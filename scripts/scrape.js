const https = require("https");
const http = require("http");

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

// All known 2026 IIHF WM games (scraped/hardcoded from iihf.com schedule)
// Times are in CET (UTC+2 during May)
const GAMES = [
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

  // Group stage - Group B (Fribourg, BCF Arena)
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

  // Quarterfinals (May 28)
  { date: "20260528", time: "1620", home: "Finland", away: "Czech Republic", venue: "Swiss Life Arena, Zurich", round: "Quarterfinal" },
  { date: "20260528", time: "1620", home: "Canada", away: "USA", venue: "BCF Arena, Fribourg", round: "Quarterfinal" },
  { date: "20260528", time: "2020", home: "Switzerland", away: "Sweden", venue: "Swiss Life Arena, Zurich", round: "Quarterfinal" },
  { date: "20260528", time: "2020", home: "Norway", away: "Latvia", venue: "BCF Arena, Fribourg", round: "Quarterfinal" },

  // Semifinals (May 30)
  { date: "20260530", time: "1620", home: "SF1 Winner", away: "SF2 Winner", venue: "Swiss Life Arena, Zurich", round: "Semifinal" },
  { date: "20260530", time: "2020", home: "SF3 Winner", away: "SF4 Winner", venue: "Swiss Life Arena, Zurich", round: "Semifinal" },

  // Medal games (May 31)
  { date: "20260531", time: "1620", home: "Bronze Medal Game", away: "", venue: "Swiss Life Arena, Zurich", round: "Bronze Medal" },
  { date: "20260531", time: "2020", home: "Gold Medal Game", away: "", venue: "Swiss Life Arena, Zurich", round: "Gold Medal" },
];

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
    "X-WR-CALNAME:IIHF World Championship 2026",
    "X-WR-TIMEZONE:Europe/Zurich",
    "X-WR-CALDESC:2026 IIHF Ice Hockey World Championship - Switzerland",
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

const ics = generateIcs(GAMES);
process.stdout.write(ics);
