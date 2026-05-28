const fs = require("fs");
const path = require("path");
const https = require("https");

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

function fetch(url) {
	return new Promise((resolve, reject) => {
		https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
			let data = "";
			res.on("data", (chunk) => (data += chunk));
			res.on("end", () => resolve({ status: res.statusCode, body: data }));
		}).on("error", reject);
	});
}

function getDefaultGames() {
	// Official 2026 IIHF tournament schedule
	return [
		// Group stage - Group A (Zurich, Swiss Life Arena)
		{ date: "20260515", time: "1620", home: "Finland", away: "Hungary", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260515", time: "2020", home: "USA", away: "Germany", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260516", time: "1620", home: "Hungary", away: "Finland", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260516", time: "2020", home: "Switzerland", away: "Latvia", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260517", time: "1220", home: "Great Britain", away: "USA", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260517", time: "2020", home: "Germany", away: "Latvia", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260518", time: "1620", home: "Finland", away: "USA", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260518", time: "2020", home: "Germany", away: "Switzerland", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260519", time: "1620", home: "Latvia", away: "Austria", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260519", time: "2020", home: "Hungary", away: "Great Britain", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260520", time: "1620", home: "Austria", away: "Switzerland", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260520", time: "2020", home: "USA", away: "Germany", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260521", time: "1620", home: "Finland", away: "Latvia", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260521", time: "2020", home: "Switzerland", away: "Great Britain", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260522", time: "1620", home: "Germany", away: "Hungary", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260522", time: "2020", home: "Finland", away: "Great Britain", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260523", time: "1220", home: "USA", away: "Latvia", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260523", time: "1620", home: "Switzerland", away: "Hungary", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260523", time: "2020", home: "Austria", away: "Germany", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260524", time: "1620", home: "Great Britain", away: "Latvia", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260524", time: "2020", home: "Finland", away: "Austria", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260525", time: "1620", home: "USA", away: "Hungary", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260525", time: "2020", home: "Germany", away: "Great Britain", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260526", time: "1220", home: "Hungary", away: "Latvia", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260526", time: "1620", home: "USA", away: "Austria", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260526", time: "2020", home: "Switzerland", away: "Finland", venue: "Swiss Life Arena, Zurich" },

		{ date: "20260515", time: "1220", home: "Sweden", away: "Canada", venue: "BCF Arena, Fribourg" },
		{ date: "20260515", time: "1620", home: "Slovakia", away: "Norway", venue: "BCF Arena, Fribourg" },
		{ date: "20260516", time: "1220", home: "Great Britain", away: "Austria", venue: "Swiss Life Arena, Zurich" },
		{ date: "20260516", time: "2020", home: "Slovenia", away: "Czech Republic", venue: "BCF Arena, Fribourg" },
		{ date: "20260517", time: "1220", home: "Italy", away: "Slovakia", venue: "BCF Arena, Fribourg" },
		{ date: "20260517", time: "1620", home: "Sweden", away: "Denmark", venue: "BCF Arena, Fribourg" },
		{ date: "20260517", time: "2020", home: "Norway", away: "Slovenia", venue: "BCF Arena, Fribourg" },
		{ date: "20260518", time: "1620", home: "Canada", away: "Denmark", venue: "BCF Arena, Fribourg" },
		{ date: "20260518", time: "2020", home: "Czech Republic", away: "Sweden", venue: "BCF Arena, Fribourg" },
		{ date: "20260519", time: "1620", home: "Italy", away: "Norway", venue: "BCF Arena, Fribourg" },
		{ date: "20260519", time: "2020", home: "Slovenia", away: "Slovakia", venue: "BCF Arena, Fribourg" },
		{ date: "20260520", time: "1620", home: "Czech Republic", away: "Italy", venue: "BCF Arena, Fribourg" },
		{ date: "20260520", time: "2020", home: "Sweden", away: "Slovenia", venue: "BCF Arena, Fribourg" },
		{ date: "20260521", time: "1220", home: "Norway", away: "Canada", venue: "BCF Arena, Fribourg" },
		{ date: "20260521", time: "2020", home: "Denmark", away: "Slovakia", venue: "BCF Arena, Fribourg" },
		{ date: "20260522", time: "1620", home: "Canada", away: "Slovenia", venue: "BCF Arena, Fribourg" },
		{ date: "20260522", time: "2020", home: "Italy", away: "Sweden", venue: "BCF Arena, Fribourg" },
		{ date: "20260523", time: "1220", home: "Denmark", away: "Slovenia", venue: "BCF Arena, Fribourg" },
		{ date: "20260523", time: "1620", home: "Slovakia", away: "Czech Republic", venue: "BCF Arena, Fribourg" },
		{ date: "20260523", time: "2020", home: "Sweden", away: "Norway", venue: "BCF Arena, Fribourg" },
		{ date: "20260524", time: "1620", home: "Denmark", away: "Italy", venue: "BCF Arena, Fribourg" },
		{ date: "20260524", time: "2020", home: "Canada", away: "Slovakia", venue: "BCF Arena, Fribourg" },
		{ date: "20260525", time: "1620", home: "Czech Republic", away: "Norway", venue: "BCF Arena, Fribourg" },
		{ date: "20260525", time: "2020", home: "Slovenia", away: "Italy", venue: "BCF Arena, Fribourg" },
		{ date: "20260526", time: "1220", home: "Norway", away: "Denmark", venue: "BCF Arena, Fribourg" },
		{ date: "20260526", time: "1620", home: "Slovakia", away: "Sweden", venue: "BCF Arena, Fribourg" },
		{ date: "20260526", time: "2020", home: "Czech Republic", away: "Canada", venue: "BCF Arena, Fribourg" },

		{ date: "20260528", time: "1620", home: "Finland", away: "Czech Republic", venue: "Swiss Life Arena, Zurich", round: "Quarterfinal" },
		{ date: "20260528", time: "1620", home: "Canada", away: "USA", venue: "BCF Arena, Fribourg", round: "Quarterfinal" },
		{ date: "20260528", time: "2020", home: "Switzerland", away: "Sweden", venue: "Swiss Life Arena, Zurich", round: "Quarterfinal" },
		{ date: "20260528", time: "2020", home: "Norway", away: "Latvia", venue: "BCF Arena, Fribourg", round: "Quarterfinal" },

		{ date: "20260530", time: "1620", home: "SF1 Winner", away: "SF2 Winner", venue: "Swiss Life Arena, Zurich", round: "Semifinal" },
		{ date: "20260530", time: "2020", home: "SF3 Winner", away: "SF4 Winner", venue: "Swiss Life Arena, Zurich", round: "Semifinal" },

		{ date: "20260531", time: "1620", home: "Bronze Medal Game", away: "", venue: "Swiss Life Arena, Zurich", round: "Bronze Medal" },
		{ date: "20260531", time: "2020", home: "Gold Medal Game", away: "", venue: "Swiss Life Arena, Zurich", round: "Gold Medal" },
	];
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

	// Try to fetch new data
	let newGames = getDefaultGames();

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

module.exports = { getGamesWithDeltaCheck, readCache, getDefaultGames };
