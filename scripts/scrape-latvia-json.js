const { getGamesWithDeltaCheck } = require("./cache");

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

		// Output as JSON to stdout
		const output = {
			generated: new Date().toISOString(),
			lastUpdated: result.lastScraped,
			hasChanges: result.hasChanges,
			totalGames: latviaGames.length,
			games: latviaGames
		};

		console.log(JSON.stringify(output, null, 2));
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

main();
