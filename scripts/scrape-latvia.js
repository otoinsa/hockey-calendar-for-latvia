const { getGamesWithDeltaCheck } = require("./cache");

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
		// games are ~2.5h
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

async function main() {
	try {
		const result = await getGamesWithDeltaCheck();

		if (result.hasChanges) {
			console.error(`📋 Changes detected at ${result.lastScraped}`);
			if (result.deltas.added.length > 0) {
				console.error(`  ✅ Added: ${result.deltas.added.length} game(s)`);
			}
			if (result.deltas.updated.length > 0) {
				console.error(`  🔄 Updated: ${result.deltas.updated.length} game(s)`);
			}
			if (result.deltas.deleted.length > 0) {
				console.error(`  ❌ Deleted: ${result.deltas.deleted.length} game(s)`);
			}
		}

		// Filter for Latvia games
		const latviaGames = result.games.filter(game =>
			game.home.includes("Latvia") || game.away.includes("Latvia")
		);

		const ics = generateIcs(latviaGames);
		process.stdout.write(ics);
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

main();
