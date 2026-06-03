const fs = require("node:fs/promises");
const path = require("node:path");
const { execFile } = require("node:child_process");

const root = __dirname;
const dataDir = path.join(root, "backend-data");
const outputFile = path.join(dataDir, "qualification-records.json");

function pythonPath() {
  const dependenciesDir = path.dirname(path.dirname(path.dirname(process.execPath)));
  return path.join(dependenciesDir, "python", "python.exe");
}

function cleanText(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseVolume(value) {
  const match = String(value || "").replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function calculateTicketQualification(totalVolumeValue) {
  const totalVolume = parseVolume(totalVolumeValue);
  const slabs = [
    { volume: 3000, tickets: 1 },
    { volume: 5000, tickets: 2 },
    { volume: 7000, tickets: 3 },
    { volume: 9000, tickets: 4 },
  ];

  let tickets = 0;
  let nextSlab = slabs[0].volume;

  for (const slab of slabs) {
    if (totalVolume >= slab.volume) {
      tickets = slab.tickets;
      nextSlab = null;
    } else {
      nextSlab = slab.volume;
      break;
    }
  }

  const volumeRequired = nextSlab ? Math.max(0, Math.ceil(nextSlab - totalVolume)) : 0;
  const ticketWord = tickets === 1 ? "Ticket" : "Tickets";

  return {
    volumeRequired: String(volumeRequired),
    result: `${tickets} ${ticketWord} Qualified`,
  };
}

function cleanRecord(body) {
  const totalVolume = cleanText(body.totalVolume || body["total volume"], 120);
  const ticketQualification = calculateTicketQualification(totalVolume);

  return {
    idNumber: cleanText(body.idNumber || body.id || body["id number"], 120),
    name: cleanText(body.name || body.fullName || body["full name"], 160),
    ppv: cleanText(body.ppv || body.PPV, 120),
    totalVolume,
    volumeRequired: ticketQualification.volumeRequired,
    result: ticketQualification.result,
    updatedAt: new Date().toISOString(),
  };
}

function parseExcelFile(filePath) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath(),
      [path.join(root, "parse_excel.py"), filePath],
      { maxBuffer: 10000000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        try {
          resolve(JSON.parse(stdout || "[]"));
        } catch (parseError) {
          reject(parseError);
        }
      }
    );
  });
}

async function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    throw new Error("Usage: node import-qualification-excel.js <path-to-excel-file.xlsx>");
  }

  const absoluteInput = path.resolve(inputFile);
  if (!absoluteInput.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Please provide an Excel .xlsx file.");
  }

  const records = (await parseExcelFile(absoluteInput))
    .map(cleanRecord)
    .filter((record) => record.idNumber);

  if (!records.length) {
    throw new Error("No valid rows found. The Excel sheet must include an ID column.");
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  console.log(`Imported ${records.length} qualification records from ${absoluteInput}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
