require("dotenv").config();
const fs = require("fs");
const { execSync } = require("child_process");

// Generate the ICS
const ics = execSync("node scripts/scrape.js").toString();

// Write to disk
const outputPath = "hockey-calendar.ics";
fs.writeFileSync(outputPath, ics, "utf-8");
console.log(`✓ Calendar saved to ${outputPath}`);

// Optionally: log stats
const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
console.log(`✓ Total events: ${eventCount}`);
