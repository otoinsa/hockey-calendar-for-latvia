# IIHF World Championship 2026 — Latvia Hockey Calendar

Generates Latvia-only hockey schedule in both **iCal** and **JSON** formats. Auto-updates daily via GitHub Actions.

## 🚀 Quick Start

**Subscribe to the Latvia calendar:**
- **iCal**: Add to Google Calendar via URL → `https://raw.githubusercontent.com/otoinsa/hockey-calendar-for-latvia/main/output/latvia-hockey-cal.ical`
- **JSON**: `https://raw.githubusercontent.com/otoinsa/hockey-calendar-for-latvia/main/output/latvia-hockey-cal.json`

## 📋 Features

- ✅ Daily updates (3 AM UTC) - not overkill hourly
- ✅ Delta detection - only commits when games actually change
- ✅ Dual formats - iCal + JSON with ISO 8601 Zulu times
- ✅ Persistent cache - tracks game history
- ✅ 8 Latvia games extracted from 61 total tournament games

## 🔄 How It Works

1. **`scripts/cache.js`** - Manages game caching + delta detection
2. **`scripts/scrape-latvia.js`** - Generates iCal format
3. **`scripts/scrape-latvia-json.js`** - Generates clean JSON with Zulu times
4. **`.github/workflows/update-calendar.yml`** - Runs daily, auto-commits if changed

## 📦 JSON Output Example

```json
{
  "generated": "2026-05-28T23:17:39.589Z",
  "lastUpdated": "2026-05-28T23:17:39.587Z",
  "hasChanges": false,
  "totalGames": 8,
  "games": [
    {
      "home": "Switzerland",
      "away": "Latvia",
      "venue": "Swiss Life Arena, Zurich",
      "startTime": "2026-05-16T18:20:00Z",
      "endTime": "2026-05-16T20:20:00Z"
    }
  ]
}
```

---

## 🤖 Built with Budget LLMs (Haiku)

This project was **painstakingly built using cheap LLMs**, navigating through:
- Hardcoded game schedules that violated every software engineering principle
- A 405 HTTP error trying to POST to Google Calendar's read-only endpoint
- Multiple refactorings to make it actually maintainable
- Delta detection logic that took 3 attempts to get right
- Timezone conversion bugs (CET → UTC wasn't obvious)
- JSON time format conversions that looked like spaghetti code

**The slop was real.** But it works. Sometimes that's enough.

Every commit represents hours of "let me try this" → "oh that doesn't work" → "wait, does the API even support that?" → "let me refactor everything."

Use this as evidence that even with budget models, persistence beats perfection. 🚀

