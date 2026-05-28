const { getGamesWithDeltaCheck } = require("./cache");
const fs = require("fs");
const path = require("path");

function pad(n) { return String(n).padStart(2, "0"); }

function toUtcIcs(dateStr, timeStr) {
	// dateStr: YYYYMMDD, timeStr: HHMM, CET = UTC+2 in May
	const y = dateStr.slice(0,4), mo = dateStr.slice(4,6), d = dateStr.slice(6,8);
	const h = parseInt(timeStr.slice(0,2)), m = timeStr.slice(2,4);
	// subtract 2h for CET->UTC
	let utcH = h - 2;
	let utcD = parseInt(d);
	if (utcH < 0) { utcH += 24; utcD -= 1; }
	return `${y}${mo}${pad(utcD)}T${pad(utcH)}${m}00Z`;
}

function toUtcIso(dateStr, timeStr) {
	// dateStr: YYYYMMDD, timeStr: HHMM, CET = UTC+2 in May
	const y = dateStr.slice(0,4), mo = dateStr.slice(4,6), d = dateStr.slice(6,8);
	const h = parseInt(timeStr.slice(0,2)), m = timeStr.slice(2,4);
	// subtract 2h for CET->UTC
	let utcH = h - 2;
	let utcD = parseInt(d);
	if (utcH < 0) { utcH += 24; utcD -= 1; }
	return `${y}-${mo}-${pad(utcD)}T${pad(utcH)}:${m}:00Z`;
}

function generateIcs(games) {
	const now = new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
	let cal = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//IIHF WM 2026//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"X-WR-CALNAME:Latvia - IIHF World Championship 2026",
		"X-WR-TIMEZONE:Europe/Zurich",
		"X-WR-CALDESC:2026 IIHF Ice Hockey World Championship - Latvia Games Only",
	];

	games.forEach((g, i) => {
		const dtstart = toUtcIcs(g.date, g.time);
		const endH = parseInt(g.time.slice(0,2)) + 2;
		const endTime = pad(endH) + g.time.slice(2);
		const dtend = toUtcIcs(g.date, endTime);
		const round = g.round ? `[${g.round}] ` : "";
		const summary = g.away
			? `${round}${g.home} vs ${g.away}`
			: `${round}${g.home}`;
		const uid = `iihf2026-${g.date}-${i}@iihf-cal`;

		cal.push("BEGIN:VEVENT");
		cal.push(`UID:${uid}`);
		cal.push(`DTSTAMP:${now}`);
		cal.push(`DTSTART:${dtstart}`);
		cal.push(`DTEND:${dtend}`);
		cal.push(`SUMMARY:${summary}`);
		cal.push(`LOCATION:${g.venue}`);
		cal.push("END:VEVENT");
	});

	cal.push("END:VCALENDAR");
	return cal.join("\r\n");
}

function generateJson(games, metadata) {
	const endH = parseInt(games[0]?.time.slice(0,2) || 0) + 2;
	const endTime = pad(endH) + (games[0]?.time.slice(2) || "00");

	const gamesWithZulu = games.map(g => {
		const endH = parseInt(g.time.slice(0,2)) + 2;
		const endTime = pad(endH) + g.time.slice(2);
		return {
			home: g.home,
			away: g.away,
			venue: g.venue,
			...(g.round && { round: g.round }),
			startTime: toUtcIso(g.date, g.time),
			endTime: toUtcIso(g.date, endTime)
		};
	});

	return {
		generated: new Date().toISOString(),
		lastUpdated: metadata.lastScraped,
		hasChanges: metadata.hasChanges,
		totalGames: games.length,
		games: gamesWithZulu
	};
}

async function main() {
	try {
		const result = await getGamesWithDeltaCheck();

		// Filter for Latvia games
		const latviaGames = result.games.filter(game =>
			game.home.includes("Latvia") || game.away.includes("Latvia")
		);

		// Generate both formats
		const ics = generateIcs(latviaGames);
		const json = generateJson(latviaGames, { lastScraped: result.lastScraped, hasChanges: result.hasChanges });

		// Write to output folder
		const outputDir = path.join(__dirname, "../output");
		fs.writeFileSync(path.join(outputDir, "latvia-hockey-cal.ical"), ics, "utf-8");
		fs.writeFileSync(path.join(outputDir, "latvia-hockey-cal.json"), JSON.stringify(json, null, 2), "utf-8");

		console.log("✓ Calendar built");
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

main();
