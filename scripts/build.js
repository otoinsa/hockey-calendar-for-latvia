const { getGamesWithDeltaCheck } = require("./cache");
const fs = require("fs");
const path = require("path");

function pad(n) { return String(n).padStart(2, "0"); }

function formatSummary(g) {
	const round = g.round ? `[${g.round}] ` : ""
	if (g.homeScore != null && g.awayScore != null) {
		return `${round}${g.home} ${g.homeScore} - ${g.awayScore} ${g.away}`
	}
	return g.away
		? `${round}${g.home} vs ${g.away}`
		: `${round}${g.home}`
}

function utcIsoToIcs(iso) {
	return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function addHoursToIso(iso, hours) {
	const d = new Date(iso)
	d.setUTCHours(d.getUTCHours() + hours)
	return d.toISOString()
}

function getStartEnd(game) {
	if (!game.startUtc) {
		throw new Error(`Game missing startUtc from Flashscore: ${game.home} vs ${game.away}`)
	}
	const startIso = game.startUtc
	const endIso = addHoursToIso(startIso, 2)
	return { startIso, endIso, startIcs: utcIsoToIcs(startIso), endIcs: utcIsoToIcs(endIso) }
}

function generateIcs(games) {
	const now = new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
	let cal = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Latvia Hockey Calendar//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"X-WR-CALNAME:Latvia National Hockey Team",
		"X-WR-CALDESC:All Latvia international games vs other countries",
	];

	games.forEach((g, i) => {
		const { startIcs, endIcs } = getStartEnd(g)
		const summary = formatSummary(g);
		const uid = `iihf2026-${g.date}-${i}@iihf-cal`;

		cal.push("BEGIN:VEVENT");
		cal.push(`UID:${uid}`);
		cal.push(`DTSTAMP:${now}`);
		cal.push(`DTSTART:${startIcs}`);
		cal.push(`DTEND:${endIcs}`);
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
		const { startIso, endIso } = getStartEnd(g)
		return {
			home: g.home,
			away: g.away,
			venue: g.venue,
			...(g.tournament && { tournament: g.tournament }),
			...(g.round && { round: g.round }),
			...(g.homeScore != null && { homeScore: g.homeScore }),
			...(g.awayScore != null && { awayScore: g.awayScore }),
			startTime: startIso,
			endTime: endIso
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
