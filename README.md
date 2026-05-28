# IIHF World Championship 2026 — Google Calendar Auto-Sync

Runs every hour via GitHub Actions. Generates a fresh `.ics` and pushes it to your Google Calendar via its private iCal import URL.

## Setup (one time)

### 1. Create a new Google Calendar
- Go to [calendar.google.com](https://calendar.google.com)
- Click **+** next to "Other calendars" → **Create new calendar**
- Name it e.g. `IIHF Worlds 2026`

### 2. Get the private iCal URL
- Open the calendar's **Settings** (gear icon → Settings for this calendar)
- Scroll to **"Secret address in iCal format"**
- Copy that URL — it looks like:
  `https://calendar.google.com/calendar/ical/xxxx%40group.calendar.google.com/private-xxxx/basic.ics`

> ⚠️ This is your write/read secret URL. Don't share it publicly.

### 3. Add it as a GitHub Secret
- In this repo: **Settings → Secrets and variables → Actions → New repository secret**
- Name: `GCAL_ICAL_URL`
- Value: paste the full URL from step 2

### 4. Enable Actions
- Go to the **Actions** tab and enable workflows if prompted
- Run the workflow manually once to verify it works

## How it works

Every hour GitHub Actions runs `scripts/scrape.js` which generates an `.ics` with all 64 games (group stage, QFs, SFs, medal games), then `scripts/push_to_gcal.js` POSTs it to your Google Calendar's private iCal endpoint.

## Sharing the calendar

To share the calendar publicly (so others can subscribe):
- Calendar Settings → **Access permissions** → check **"Make available to public"**
- Share the **Public address in iCal format** — that's the subscribe URL you paste into any calendar app
