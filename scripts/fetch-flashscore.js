const https = require("https")

const LATVIA_TEAM_ID = "44JaYkQ4"
const RESULTS_URL = `https://www.flashscore.com/team/latvia/${LATVIA_TEAM_ID}/results/`
const FIXTURES_URL = `https://www.flashscore.com/team/latvia/${LATVIA_TEAM_ID}/fixtures/`

function isLatviaVersusCountry(home, away) {
	if (!home || !away || home === away) return false
	if (home !== "Latvia" && away !== "Latvia") return false
	if (/winner|medal game|tbd/i.test(home) || /winner|medal game|tbd/i.test(away)) return false
	return true
}

function fetch(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, {
				headers: {
					"User-Agent": "Mozilla/5.0",
					"Accept-Language": "en-US,en;q=0.9",
				},
			}, (res) => {
				let data = ""
				res.on("data", (chunk) => (data += chunk))
				res.on("end", () => resolve({ status: res.statusCode, body: data }))
			})
			.on("error", reject)
	})
}

function extractFeedData(html, feedKey) {
	const re = new RegExp(
		`cjs\\.initialFeeds\\["${feedKey}"\\]\\s*=\\s*\\{\\s*data:\\s*\`([\\s\\S]*?)\``,
		"m"
	)
	const match = html.match(re)
	return match ? match[1] : ""
}

function getField(block, key) {
	const match = block.match(new RegExp(`${key}÷([^¬]+)`))
	return match ? match[1].trim() : null
}

function parseRound(tournament) {
	if (/Play Offs|Playoffs|Quarterfinal/i.test(tournament)) return "Quarterfinal"
	if (/Semi/i.test(tournament)) return "Semifinal"
	if (/Final/i.test(tournament) && !/Qualification/i.test(tournament)) return "Final"
	if (/Qualification/i.test(tournament)) return "Qualification"
	return null
}

function parseFeedToGames(feedData) {
	const games = []
	const sections = feedData.split("~ZA÷").slice(1)

	for (const section of sections) {
		const tournament = section.match(/^([^¬]+)/)?.[1]?.trim() || ""
		const round = parseRound(tournament)
		const eventBlocks = section.split("~AA÷").slice(1)

		for (const block of eventBlocks) {
			const home = getField(block, "AE")
			const away = getField(block, "AF")
			if (!isLatviaVersusCountry(home, away)) continue

			const timestamp = parseInt(getField(block, "AD"), 10)
			if (!timestamp) continue

			const start = new Date(timestamp * 1000)
			const date = start.toISOString().slice(0, 10).replace(/-/g, "")
			const time = start.toISOString().slice(11, 16).replace(":", "")

			const homeScoreRaw = getField(block, "AG")
			const awayScoreRaw = getField(block, "AH")
			const homeScore = homeScoreRaw != null && homeScoreRaw !== "" ? parseInt(homeScoreRaw, 10) : null
			const awayScore = awayScoreRaw != null && awayScoreRaw !== "" ? parseInt(awayScoreRaw, 10) : null

			const game = {
				date,
				time,
				startUtc: start.toISOString(),
				home,
				away,
				venue: getField(block, "CO") || tournament,
				tournament,
				...(round && { round }),
			}

			if (homeScore != null && awayScore != null && !Number.isNaN(homeScore) && !Number.isNaN(awayScore)) {
				game.homeScore = homeScore
				game.awayScore = awayScore
			}

			games.push(game)
		}
	}

	return games
}

function gameKey(g) {
	return `${g.date}|${g.time}|${g.home}|${g.away}`
}

function mergeGames(existing, incoming) {
	const map = new Map(existing.map((g) => [gameKey(g), g]))
	for (const g of incoming) {
		const prev = map.get(gameKey(g))
		map.set(gameKey(g), prev ? { ...prev, ...g } : g)
	}
	return [...map.values()].sort((a, b) =>
		`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
	)
}

async function fetchLatviaGamesFromFlashscore() {
	const [resultsRes, fixturesRes] = await Promise.all([
		fetch(RESULTS_URL),
		fetch(FIXTURES_URL),
	])

	if (resultsRes.status !== 200) {
		throw new Error(`Flashscore results page returned HTTP ${resultsRes.status}`)
	}
	if (fixturesRes.status !== 200) {
		throw new Error(`Flashscore fixtures page returned HTTP ${fixturesRes.status}`)
	}

	const resultsFeed = extractFeedData(resultsRes.body, "results")
	const fixturesFeed = extractFeedData(fixturesRes.body, "fixtures")
		|| extractFeedData(fixturesRes.body, "summary-fixtures")

	let games = mergeGames(
		parseFeedToGames(resultsFeed),
		parseFeedToGames(fixturesFeed)
	)

	const withScores = games.filter((g) => g.homeScore != null).length
	console.error(
		`Flashscore: ${games.length} Latvia games (${withScores} with scores) from ${RESULTS_URL}`
	)

	return games
}

module.exports = {
	fetchLatviaGamesFromFlashscore,
	parseFeedToGames,
	isLatviaVersusCountry,
}
