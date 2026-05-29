// Local development server for testing iCal output
// Serves files from the output/ directory with fresh reads on each request
// Usage: node server.js or npm run dev

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000
const OUTPUT_DIR = path.join(__dirname, '../output')

const server = http.createServer((req, res) => {
	// CORS headers for local testing
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

	if (req.method === 'OPTIONS') {
		res.writeHead(200)
		res.end()
		return
	}

	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)

	// Always read fresh from disk on each request
	if (req.url === '/latvia-hockey-cal.ical' || req.url === '/') {
		const filePath = path.join(OUTPUT_DIR, 'latvia-hockey-cal.ical')
		fs.readFile(filePath, 'utf-8', (err, data) => {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' })
				res.end('Error reading iCal file')
				console.error('Error:', err)
				return
			}
			res.writeHead(200, {
				'Content-Type': 'text/plain; charset=utf-8'
			})
			res.end(data)
		})
	} else if (req.url === '/latvia-hockey-cal.json') {
		const filePath = path.join(OUTPUT_DIR, 'latvia-hockey-cal.json')
		fs.readFile(filePath, 'utf-8', (err, data) => {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' })
				res.end('Error reading JSON file')
				console.error('Error:', err)
				return
			}
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(data)
		})
	} else if (req.url === '/rebuild') {
		const { exec } = require('child_process')
		exec('node scripts/build.js', (err, stdout, stderr) => {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' })
				res.end(`Build error: ${stderr}`)
				console.error('Build error:', stderr)
				return
			}
			res.writeHead(200, { 'Content-Type': 'text/plain' })
			res.end('✓ Calendar rebuilt\n' + stdout)
			console.log('Calendar rebuilt:', stdout)
		})
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' })
		res.end('Not found\n\nAvailable endpoints:\n  GET /latvia-hockey-cal.ical\n  GET /latvia-hockey-cal.json\n  GET /rebuild')
	}
})

server.listen(PORT, () => {
	console.log(`\n🏒 Latvia Hockey Calendar - Local Test Server`)
	console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
	console.log(`\n📅 iCal URL:  http://localhost:${PORT}/latvia-hockey-cal.ical`)
	console.log(`📋 JSON URL:  http://localhost:${PORT}/latvia-hockey-cal.json`)
	console.log(`🔄 Rebuild:   http://localhost:${PORT}/rebuild`)
	console.log(`\n💡 Test locally by subscribing to:`)
	console.log(`   http://localhost:${PORT}/latvia-hockey-cal.ical`)
	console.log(`\n⚠️  This is for LOCAL TESTING ONLY`)
	console.log(`   For production, use the GitHub raw URL`)
	console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
})
