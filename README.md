# IIHF World Championship 2026 — Latvia Hockey Calendar

Generates Latvia-only hockey schedule in both **iCal** and **JSON** formats. Auto-updates daily via GitHub Actions.

## 🚀 Quick Start

**Subscribe to the Latvia calendar:**

### Apple Devices (iOS, macOS)
1. Open **Calendar** app
2. Settings → **Add Calendar** → **Add Subscription**
3. Paste this URL:
   ```
   https://raw.githubusercontent.com/otoinsa/hockey-calendar-for-latvia/main/output/latvia-hockey-cal.ical
   ```
4. Tap **Subscribe**

### Google Calendar
1. Go to [calendar.google.com](https://calendar.google.com)
2. Click **+** next to "Other calendars"
3. Select **Subscribe to calendar**
4. Paste this URL:
   ```
   https://raw.githubusercontent.com/otoinsa/hockey-calendar-for-latvia/main/output/latvia-hockey-cal.ical
   ```
5. Click **Subscribe**

### JSON API
Get structured data directly:
```
https://raw.githubusercontent.com/otoinsa/hockey-calendar-for-latvia/main/output/latvia-hockey-cal.json
```

## 📋 What's Inside

- ✅ **8 Latvia games** extracted from 61 total tournament games
- ✅ **Daily updates** (3 AM UTC) - smart enough to not spam hourly
- ✅ **Delta detection** - only commits when games actually change
- ✅ **Dual formats** - iCal for calendars + JSON for apps
- ✅ **ISO 8601 Zulu times** - standardized, easy to parse
- ✅ **Persistent cache** - tracks change history

## 🏒 The 8 Latvia Games

| Date | Time (UTC) | Opponent | Venue |
|------|-----------|----------|-------|
| May 16 | 18:20 | Switzerland | Swiss Life Arena, Zurich |
| May 17 | 18:20 | Germany | Swiss Life Arena, Zurich |
| May 19 | 14:20 | Austria | Swiss Life Arena, Zurich |
| May 21 | 14:20 | Finland | Swiss Life Arena, Zurich |
| May 23 | 10:20 | USA | Swiss Life Arena, Zurich |
| May 24 | 14:20 | Great Britain | Swiss Life Arena, Zurich |
| May 26 | 10:20 | Hungary | Swiss Life Arena, Zurich |
| May 28 | 18:20 | Norway (QF) | BCF Arena, Fribourg |

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
- Delta detection logic that took 10 attempts to get right (it still might not be right)
- Timezone conversion bugs (CET → UTC wasn't obvious)
- JSON time format conversions that looked like spaghetti code

**The slop was real.** But it works. Sometimes that's enough.

Every commit represents hours of "let me try this" → "oh that doesn't work" → "wait, does the API even support that?" → "let me refactor everything."

Use this as evidence that even with budget models, persistence beats perfection. 🚀


