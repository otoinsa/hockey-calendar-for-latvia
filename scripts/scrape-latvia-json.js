const { getGamesWithDeltaCheck } = require("./cache");

function pad(n) { return String(n).padStart(2, "0"); }

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

async function main() {
	try {
		const result = await getGamesWithDeltaCheck();

		// Filter for Latvia games
		const latviaGames = result.games.filter(game =>
			game.home.includes("Latvia") || game.away.includes("Latvia")
		);

		// Convert to output format with Zulu times
		const gamesWithZulu = latviaGames.map(g => ({
			...g,
			startTime: toUtcIso(g.date, g.time),
			endTime: (() => {
				const endH = parseInt(g.time.slice(0,2)) + 2;
				const endTime = pad(endH) + g.time.slice(2);
				return toUtcIso(g.date, endTime);
			})()
		}));

		// Output as JSON to stdout
		const output = {
			generated: new Date().toISOString(),
			lastUpdated: result.lastScraped,
			hasChanges: result.hasChanges,
			totalGames: latviaGames.length,
			games: gamesWithZulu
		};

		console.log(JSON.stringify(output, null, 2));
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

main();
