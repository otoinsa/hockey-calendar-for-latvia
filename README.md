# Latvia Hockey Calendar

Auto-updating calendar of **every Latvia men's national team game vs another country** — Olympics, World Championship, friendlies, European Cup of Nations, qualification tournaments, and anything else Flashscore lists on the [Latvia team page](https://www.flashscore.com/team/latvia/44JaYkQ4/).

Output is published in **iCal** (subscribe in Apple/Google Calendar) and **JSON** (for apps and scripts). Updated daily via GitHub Actions.

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

- ✅ **All Latvia international games** vs other countries (Flashscore is the only source)
- ✅ **Daily updates** (3 AM UTC) - smart enough to not spam hourly
- ✅ **Delta detection** - only commits when games actually change
- ✅ **Dual formats** - iCal for calendars + JSON for apps
- ✅ **ISO 8601 Zulu times** - standardized, easy to parse
- ✅ **Persistent cache** - tracks change history
- ✅ **Scores included** when Flashscore marks a game finished

### Competitions covered

Olympic Games (and playoffs / qualification), IIHF World Championship (and playoffs), Friendly Internationals, European Cup of Nations, invitational tournaments — whatever Flashscore has on the Latvia team page. No hardcoded schedules. No API key.

## 🔄 How It Works

```
Flashscore (results + fixtures)
  → scripts/fetch-flashscore.js   parse embedded feed data
  → scripts/cache.js              delta detection, games-cache.json
  → scripts/build.js              write iCal + JSON
  → output/
  → GitHub Actions (daily cron)
```

1. **`scripts/fetch-flashscore.js`** - Fetches all Latvia vs country games + scores from Flashscore
2. **`scripts/cache.js`** - Caches games and delta detection
3. **`scripts/build.js`** - Generates iCal and JSON from cached games
4. **`scripts/test-server.js`** - Local dev server for testing iCal output (run with `npm run dev`)
5. **`.github/workflows/update-calendar.yml`** - Runs daily at 3 AM UTC, auto-commits if changed

## 📦 JSON Output Example

```json
{
  "generated": "2026-05-29T00:05:00.829Z",
  "lastUpdated": "2026-05-29T00:05:00.546Z",
  "hasChanges": false,
  "totalGames": 43,
  "games": [
    {
      "home": "Latvia",
      "away": "Norway",
      "venue": "WORLD: Friendly International",
      "tournament": "WORLD: Friendly International",
      "homeScore": 4,
      "awayScore": 3,
      "startTime": "2026-05-07T16:30:00.000Z",
      "endTime": "2026-05-07T18:30:00.000Z"
    },
    {
      "home": "Norway",
      "away": "Latvia",
      "venue": "WORLD: World Championship - Play Offs",
      "tournament": "WORLD: World Championship - Play Offs",
      "round": "Quarterfinal",
      "homeScore": 2,
      "awayScore": 0,
      "startTime": "2026-05-28T18:20:00.000Z",
      "endTime": "2026-05-28T20:20:00.000Z"
    }
  ]
}
```

Game count varies — Flashscore returns whatever is on the Latvia team page (past and upcoming).

## 🛠️ Development

### Local Testing
Start the dev server to test iCal output locally:
```bash
npm install
npm run dev
```

Then subscribe to `http://localhost:3000/latvia-hockey-cal.ical` in your calendar app for instant testing.

**Available endpoints:**
- `http://localhost:3000/latvia-hockey-cal.ical` - iCal format (displays as text)
- `http://localhost:3000/latvia-hockey-cal.json` - JSON format
- `http://localhost:3000/rebuild` - Trigger rebuild

**Features:**
- Auto-restarts on file changes in `scripts/` and `data/`
- Always serves fresh files from `output/` directory
- No caching for instant feedback

### Building
Generate the calendar files manually:
```bash
npm run build
```

This creates:
- `output/latvia-hockey-cal.ical` - iCal format with proper RFC 5545 compliance
- `output/latvia-hockey-cal.json` - JSON format with ISO 8601 timestamps

---

## 📝 Technical Notes

### iCal Format
- Uses RFC 5545 compliant format (`YYYYMMDDTHHMMSSZ` for UTC times)
- No `X-WR-TIMEZONE` header to avoid timezone conflicts
- Proper CRLF line endings for maximum compatibility
- Scores appear in event title when available

### Game Data
- **Source:** [Flashscore Latvia team page](https://www.flashscore.com/team/latvia/44JaYkQ4/) (embedded `cjs.initialFeeds` data from results + fixtures pages)
- Fetches on each build via `scripts/fetch-flashscore.js` — no separate API key; same data the website uses
- **All international games** where Latvia plays another country (friendlies, Olympics, World Championship, European Cup, qualification, invitational tournaments)
- On fetch failure, falls back to last cached Flashscore data

### Automation
- GitHub Actions runs daily at 3 AM UTC
- Only commits when game data actually changes (delta detection)
- Smart caching prevents unnecessary updates

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
