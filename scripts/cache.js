const fs = require("fs");
const path = require("path");
const { fetchLatviaGamesFromFlashscore } = require("./fetch-flashscore");

const CACHE_FILE = path.join(__dirname, "../data/games-cache.json");
const DATA_DIR = path.join(__dirname, "../data");

function ensureDataDir() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
}

function readCache() {
	try {
		if (fs.existsSync(CACHE_FILE)) {
			const data = fs.readFileSync(CACHE_FILE, "utf-8");
			return JSON.parse(data);
		}
	} catch (error) {
		console.error("Failed to read cache:", error.message);
	}
	return { games: [], lastScraped: null, lastUpdated: null };
}

function writeCache(cache) {
	ensureDataDir();
	fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

function calculateDeltas(oldGames, newGames) {
	const added = [];
	const updated = [];
	const deleted = [];

	// Find added or updated
	newGames.forEach(newGame => {
		const oldGame = oldGames.find(g => g.date === newGame.date && g.time === newGame.time && g.home === newGame.home);
		if (!oldGame) {
			added.push(newGame);
		} else if (JSON.stringify(oldGame) !== JSON.stringify(newGame)) {
			updated.push({ old: oldGame, new: newGame });
		}
	});

	// Find deleted
	oldGames.forEach(oldGame => {
		const stillExists = newGames.find(g => g.date === oldGame.date && g.time === oldGame.time && g.home === oldGame.home);
		if (!stillExists) {
			deleted.push(oldGame);
		}
	});

	return { added, updated, deleted };
}

async function getGamesWithDeltaCheck() {
	const cache = readCache();
	const now = new Date().toISOString();

	let newGames = []
	try {
		newGames = await fetchLatviaGamesFromFlashscore()
	} catch (error) {
		console.error("Flashscore fetch failed, using cached games:", error.message)
		newGames = (cache.games || []).map((g) => ({ ...g }))
	}

	// Calculate deltas
	const deltas = calculateDeltas(cache.games || [], newGames);
	const hasChanges = deltas.added.length > 0 || deltas.updated.length > 0 || deltas.deleted.length > 0;

	// Update cache
	const updatedCache = {
		games: newGames,
		lastScraped: now,
		lastUpdated: hasChanges ? now : cache.lastUpdated,
		deltas: hasChanges ? deltas : null,
	};

	writeCache(updatedCache);

	return {
		games: newGames,
		hasChanges,
		deltas,
		lastScraped: now,
	};
}

module.exports = { getGamesWithDeltaCheck, readCache };
