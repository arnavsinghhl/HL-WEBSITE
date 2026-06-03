const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFile } = require("node:child_process");

const root = __dirname;
const dataDir = path.join(root, "backend-data");
const contactsFile = path.join(dataDir, "contacts.json");
const displayItemsFile = path.join(dataDir, "display-items.json");
const qualificationMenuFile = path.join(dataDir, "qualification-menu.json");
const qualificationCriteriaFile = path.join(dataDir, "qualification-criteria.json");
const qualificationRecordsFile = path.join(dataDir, "qualification-records.json");
const belowSupervisorRecordsFile = path.join(dataDir, "below-supervisor-records.json");
const giftRecordsFile = path.join(dataDir, "gift-records.json");
const goaRecordsFile = path.join(dataDir, "goa-records.json");
const juneSpecialOfferRecordsFile = path.join(dataDir, "june-special-offer-records.json");
const progressSupervisorRecordsFile = path.join(dataDir, "progress-supervisor-records.json");
const progressBelowRecordsFile = path.join(dataDir, "progress-below-records.json");
const port = Number(process.env.PORT || 3000);
const adminAccessId = process.env.ADMIN_ACCESS_ID || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "Wellness@2026";
const adminToken = crypto
  .createHash("sha256")
  .update(`${adminAccessId}:${adminPassword}:wellness-path-admin`)
  .digest("hex");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  await ensureJsonFile(contactsFile);
  await ensureJsonFile(displayItemsFile);
  await ensureQualificationMenuFile();
  await ensureQualificationCriteriaFile();
  await ensureJsonFile(qualificationRecordsFile);
  await ensureJsonFile(belowSupervisorRecordsFile);
  await ensureJsonFile(giftRecordsFile);
  await ensureJsonFile(goaRecordsFile);
  await ensureJsonFile(juneSpecialOfferRecordsFile);
  await ensureJsonFile(progressSupervisorRecordsFile);
  await ensureJsonFile(progressBelowRecordsFile);
}

async function ensureJsonFile(file) {
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "[]\n", "utf8");
  }
}

function defaultQualificationMenuItems() {
  return [
    {
      id: "jim-corbett",
      title: "Jim Corbett Qualification",
      description: "Ticket slab check for Supervisor and above, PC, and Associate.",
      href: "jim-corbett-qualification.html",
      image: "assets/jim-corbett-qualification.jpeg",
      criteria:
        "Supervisor and above: 3000 TV = 1 ticket; 5000 TV = 2 tickets; 7000 TV = 3 tickets; 9000 TV = 4 tickets\nPC / Associate: 1000 PPV = 1 ticket; 1500 PPV = 2 tickets; 2000 PPV = 3 tickets",
      active: true,
      sortOrder: 10,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "gifts-pc-associates",
      title: "Gifts for PC and Associates",
      description: "PPV gift offer check using the Gifts sheet.",
      href: "gifts-pc-associates.html",
      image: "assets/gifts-pc-associates.jpeg",
      criteria:
        "100+ PPV = Shaker Cup\n200+ PPV = Shaker Cup + Herbalife Nutrition Diary\n300+ PPV = Steel Bottle\n500+ PPV = Steel Bottle + Electric Kettle\n1000+ PPV = BMI Machine",
      active: true,
      sortOrder: 20,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "goa",
      title: "Goa Qualification",
      description: "Supervisor and above only Goa ticket check.",
      href: "goa-qualification.html",
      image: "assets/goa-qualification.jpeg",
      criteria: "Only Supervisor and above\n28000+ Total Volume = Single Ticket Free\n36000+ Total Volume = Couple Ticket Free",
      active: true,
      sortOrder: 30,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "june-special-offer",
      title: "June 2026 Special Offer",
      description: "Supervisor and above only TVP reward check.",
      href: "june-special-offer.html",
      image: "assets/june-special-offer.jpeg",
      criteria:
        "Only Supervisor and above\n500+ TVP = 01 Afresh\n1000+ TVP = 01 Shake Mix\n1500+ TVP = 01 Afresh + 01 Shake Mix\n2000+ TVP = 02 Shake Mix\n2500+ TVP = 01 Afresh + 02 Shake Mix\n3000+ TVP = 03 Shake Mix\n4000+ TVP = 04 Shake Mix\n5000+ TVP = 05 Shake Mix",
      active: true,
      sortOrder: 40,
      updatedAt: new Date().toISOString(),
    },
  ];
}

async function ensureQualificationMenuFile() {
  try {
    await fs.access(qualificationMenuFile);
    const items = await readJson(qualificationMenuFile);
    if (!Array.isArray(items) || !items.length) {
      await writeJson(qualificationMenuFile, defaultQualificationMenuItems());
    }
  } catch {
    await writeJson(qualificationMenuFile, defaultQualificationMenuItems());
  }
}

function defaultQualificationCriteria() {
  return [
    {
      id: "jim-supervisor",
      title: "Jim Corbett Supervisor and Above",
      metric: "totalVolume",
      metricLabel: "Total Volume",
      notQualifiedResult: "0 Tickets Qualified",
      slabs: [
        { threshold: 3000, result: "1 Ticket Qualified" },
        { threshold: 5000, result: "2 Tickets Qualified" },
        { threshold: 7000, result: "3 Tickets Qualified" },
        { threshold: 9000, result: "4 Tickets Qualified" },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "jim-below",
      title: "Jim Corbett Below Supervisor",
      metric: "ppv",
      metricLabel: "PPV",
      notQualifiedResult: "0 Tickets Qualified",
      slabs: [
        { threshold: 1000, result: "1 Ticket Qualified" },
        { threshold: 1500, result: "2 Tickets Qualified" },
        { threshold: 2000, result: "3 Tickets Qualified" },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "gifts",
      title: "Gifts for PC and Associates",
      metric: "ppv",
      metricLabel: "PPV",
      notQualifiedResult: "Not qualified yet",
      slabs: [
        { threshold: 100, result: "Shaker Cup" },
        { threshold: 200, result: "Shaker Cup + Herbalife Nutrition Diary" },
        { threshold: 300, result: "Steel Bottle" },
        { threshold: 500, result: "Steel Bottle + Electric Kettle" },
        { threshold: 1000, result: "BMI Machine" },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "goa",
      title: "Goa Qualification",
      metric: "totalVolume",
      metricLabel: "Total Volume",
      notQualifiedResult: "Not qualified yet",
      slabs: [
        { threshold: 28000, result: "Single Ticket Free" },
        { threshold: 36000, result: "Couple Ticket Free" },
      ],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "june-special-offer",
      title: "June 2026 Special Offer",
      metric: "totalVolume",
      metricLabel: "TVP",
      notQualifiedResult: "Not qualified yet",
      slabs: [
        { threshold: 500, result: "01 Afresh" },
        { threshold: 1000, result: "01 Shake Mix" },
        { threshold: 1500, result: "01 Afresh + 01 Shake Mix" },
        { threshold: 2000, result: "02 Shake Mix" },
        { threshold: 2500, result: "01 Afresh + 02 Shake Mix" },
        { threshold: 3000, result: "03 Shake Mix" },
        { threshold: 4000, result: "04 Shake Mix" },
        { threshold: 5000, result: "05 Shake Mix" },
      ],
      updatedAt: new Date().toISOString(),
    },
  ];
}

async function ensureQualificationCriteriaFile() {
  try {
    await fs.access(qualificationCriteriaFile);
    const criteria = await readJson(qualificationCriteriaFile);
    if (!Array.isArray(criteria) || !criteria.length) {
      await writeJson(qualificationCriteriaFile, defaultQualificationCriteria());
    }
  } catch {
    await writeJson(qualificationCriteriaFile, defaultQualificationCriteria());
  }
}

async function readJson(file) {
  await ensureJsonFile(file);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Token,X-File-Name,X-Merge",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function isAdminRequest(request) {
  const authorization = request.headers.authorization || "";
  const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const headerToken = request.headers["x-admin-token"] || "";
  return bearerToken === adminToken || headerToken === adminToken;
}

function requireAdmin(request, response) {
  if (isAdminRequest(request)) return true;
  sendJson(response, 401, { error: "Admin login required." });
  return false;
}

function cleanText(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function slugify(value) {
  const slug = cleanText(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || crypto.randomUUID();
}

function cleanBoolean(value, defaultValue = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "no", "off"].includes(normalized)) return false;
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
  }
  return defaultValue;
}

function cleanQualificationMenuItem(body, forcedId) {
  const id = slugify(forcedId || body.id || body.title);
  return {
    id,
    title: cleanText(body.title, 140),
    description: cleanText(body.description, 500),
    href: cleanText(body.href || body.link || body.pageLink, 240),
    image: cleanText(body.image || body.imagePath, 240),
    criteria: cleanText(body.criteria, 2000),
    active: cleanBoolean(body.active, true),
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 100,
    updatedAt: new Date().toISOString(),
  };
}

function parseVolume(value) {
  const match = String(value || "").replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function cleanSlab(body) {
  return {
    threshold: parseVolume(body.threshold || body.volume || body.ppv || body.totalVolume),
    result: cleanText(body.result || body.label || body.reward, 240),
  };
}

function cleanQualificationCriterion(body, forcedId) {
  const metric = cleanText(body.metric, 40) === "ppv" ? "ppv" : "totalVolume";
  const slabs = (Array.isArray(body.slabs) ? body.slabs : [])
    .map(cleanSlab)
    .filter((slab) => Number.isFinite(slab.threshold) && slab.threshold > 0 && slab.result)
    .sort((a, b) => a.threshold - b.threshold);

  return {
    id: slugify(forcedId || body.id || body.title),
    title: cleanText(body.title, 140),
    metric,
    metricLabel: cleanText(body.metricLabel, 80) || (metric === "ppv" ? "PPV" : "Total Volume"),
    notQualifiedResult: cleanText(body.notQualifiedResult, 160) || "Not qualified yet",
    slabs,
    updatedAt: new Date().toISOString(),
  };
}

function calculateByCriterion(value, criterion) {
  const numericValue = parseVolume(value);
  const slabs = (criterion?.slabs || [])
    .map(cleanSlab)
    .filter((slab) => Number.isFinite(slab.threshold) && slab.threshold > 0 && slab.result)
    .sort((a, b) => a.threshold - b.threshold);

  let result = cleanText(criterion?.notQualifiedResult, 160) || "Not qualified yet";
  let nextThreshold = slabs[0]?.threshold || null;

  for (const slab of slabs) {
    if (numericValue >= slab.threshold) {
      result = slab.result;
      nextThreshold = null;
    } else {
      nextThreshold = slab.threshold;
      break;
    }
  }

  return {
    volumeRequired: String(nextThreshold ? Math.max(0, Math.ceil(nextThreshold - numericValue)) : 0),
    result,
  };
}

async function readQualificationCriteria() {
  await ensureQualificationCriteriaFile();
  return await readJson(qualificationCriteriaFile);
}

async function readQualificationCriterion(id) {
  const criteria = await readQualificationCriteria();
  const criterion = criteria.find((item) => String(item.id) === id);
  return criterion || defaultQualificationCriteria().find((item) => item.id === id) || defaultQualificationCriteria()[0];
}

function applyQualificationCriterion(record, criterion) {
  const metricValue = criterion.metric === "ppv" ? record.ppv : record.totalVolume;
  const calculation = calculateByCriterion(metricValue, criterion);

  return {
    ...record,
    volumeRequired: calculation.volumeRequired,
    result: calculation.result,
  };
}

async function applyCriterionToRecords(records, criterionId) {
  const criterion = await readQualificationCriterion(criterionId);
  return records.map((record) => applyQualificationCriterion(record, criterion));
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

function calculateBelowSupervisorQualification(ppvValue) {
  const ppv = parseVolume(ppvValue);
  const slabs = [
    { volume: 1000, tickets: 1 },
    { volume: 1500, tickets: 2 },
    { volume: 2000, tickets: 3 },
  ];

  let tickets = 0;
  let nextSlab = slabs[0].volume;

  for (const slab of slabs) {
    if (ppv >= slab.volume) {
      tickets = slab.tickets;
      nextSlab = null;
    } else {
      nextSlab = slab.volume;
      break;
    }
  }

  const volumeRequired = nextSlab ? Math.max(0, Math.ceil(nextSlab - ppv)) : 0;
  const ticketWord = tickets === 1 ? "Ticket" : "Tickets";

  return {
    volumeRequired: String(volumeRequired),
    result: `${tickets} ${ticketWord} Qualified`,
  };
}

function calculateGiftQualification(ppvValue) {
  const ppv = parseVolume(ppvValue);
  const slabs = [
    { volume: 100, result: "Shaker Cup" },
    { volume: 200, result: "Shaker Cup + Herbalife Nutrition Diary" },
    { volume: 300, result: "Steel Bottle" },
    { volume: 500, result: "Steel Bottle + Electric Kettle" },
    { volume: 1000, result: "BMI Machine" },
  ];

  let result = "Not qualified yet";
  let nextSlab = slabs[0].volume;

  for (const slab of slabs) {
    if (ppv >= slab.volume) {
      result = slab.result;
      nextSlab = null;
    } else {
      nextSlab = slab.volume;
      break;
    }
  }

  return {
    volumeRequired: String(nextSlab ? Math.max(0, Math.ceil(nextSlab - ppv)) : 0),
    result,
  };
}

function calculateGoaQualification(totalVolumeValue) {
  const totalVolume = parseVolume(totalVolumeValue);

  if (totalVolume >= 36000) {
    return { volumeRequired: "0", result: "Couple Ticket Free" };
  }

  if (totalVolume >= 28000) {
    return {
      volumeRequired: String(Math.max(0, Math.ceil(36000 - totalVolume))),
      result: "Single Ticket Free",
    };
  }

  return {
    volumeRequired: String(Math.max(0, Math.ceil(28000 - totalVolume))),
    result: "Not qualified yet",
  };
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 2000000) throw new Error("Request body too large.");
  }
  return JSON.parse(body || "{}");
}

async function readBinaryBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    chunks.push(chunk);
    size += chunk.length;
    if (size > 10000000) throw new Error("Uploaded Excel file is too large.");
  }
  return Buffer.concat(chunks);
}

function pythonPath() {
  const dependenciesDir = path.dirname(path.dirname(path.dirname(process.execPath)));
  return path.join(dependenciesDir, "python", "python.exe");
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

function cleanBelowSupervisorRecord(body) {
  const ppv = cleanText(body.ppv || body.PPV, 120);
  const ticketQualification = calculateBelowSupervisorQualification(ppv);

  return {
    idNumber: cleanText(body.idNumber || body.id || body["id number"], 120),
    name: cleanText(body.name || body.fullName || body["full name"], 160),
    ppv,
    totalVolume: cleanText(body.totalVolume || body["total volume"], 120),
    volumeRequired: ticketQualification.volumeRequired,
    result: ticketQualification.result,
    updatedAt: new Date().toISOString(),
  };
}

function cleanGiftRecord(body) {
  const ppv = cleanText(body.ppv || body.PPV, 120);
  const giftQualification = calculateGiftQualification(ppv);

  return {
    idNumber: cleanText(body.idNumber || body.id || body["id number"], 120),
    name: cleanText(body.name || body.fullName || body["full name"], 160),
    ppv,
    totalVolume: cleanText(body.totalVolume || body["total volume"], 120),
    volumeRequired: giftQualification.volumeRequired,
    result: giftQualification.result,
    updatedAt: new Date().toISOString(),
  };
}

function cleanGoaRecord(body) {
  const totalVolume = cleanText(body.totalVolume || body["total volume"], 120);
  const goaQualification = calculateGoaQualification(totalVolume);

  return {
    idNumber: cleanText(body.idNumber || body.id || body["id number"], 120),
    name: cleanText(body.name || body.fullName || body["full name"], 160),
    ppv: cleanText(body.ppv || body.PPV, 120),
    totalVolume,
    volumeRequired: goaQualification.volumeRequired,
    result: goaQualification.result,
    updatedAt: new Date().toISOString(),
  };
}

function cleanJuneSpecialOfferRecord(body) {
  return {
    idNumber: cleanText(body.idNumber || body.id || body["id number"], 120),
    name: cleanText(body.name || body.fullName || body["full name"], 160),
    ppv: cleanText(body.ppv || body.PPV, 120),
    totalVolume: cleanText(body.totalVolume || body["total volume"] || body.tvp || body.TVP, 120),
    volumeRequired: "",
    result: "",
    updatedAt: new Date().toISOString(),
  };
}

function cleanProgressRecord(body) {
  return {
    idNumber: cleanText(body.idNumber || body.id || body["id number"], 120),
    name: cleanText(body.name || body.fullName || body["full name"], 160),
    currentMonth: cleanText(body.currentMonth || body.month || body["current month"] || body["current month name"], 120),
    sponsorName: cleanText(body.sponsorName || body.sponsor || body["sponsor name"] || body.sponser || body["sponser name"], 160),
    ppv: cleanText(body.ppv || body.PPV, 120),
    totalVolume: cleanText(body.totalVolume || body["total volume"], 120),
    volumeRequired: cleanText(body.volumeRequired || body["volume required"], 120),
    result: cleanText(body.result || body.status || body.progress, 240),
    updatedAt: new Date().toISOString(),
  };
}

async function handleRecordDatasetApi(request, response, url, config) {
  const {
    adminPath,
    publicPath,
    file,
    clean,
    uploadPrefix,
    label,
    mergeUploads = false,
    criterionId = "",
  } = config;

  if (url.pathname === adminPath && request.method === "GET") {
    if (!requireAdmin(request, response)) return true;
    const records = await readJson(file);
    sendJson(response, 200, criterionId ? await applyCriterionToRecords(records, criterionId) : records);
    return true;
  }

  if (url.pathname === adminPath && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    await writeJson(file, []);
    sendJson(response, 200, { ok: true, count: 0 });
    return true;
  }

  if (url.pathname === adminPath && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const body = await readBody(request);
    const records = Array.isArray(body.records) ? body.records.map(clean) : [];
    const validRecords = records.filter((record) => record.idNumber);
    const shouldMerge = Boolean(body.merge);

    if (!validRecords.length) {
      sendJson(response, 400, { error: "At least one row with an ID is required." });
      return true;
    }

    const finalRecords = shouldMerge
      ? mergeRecordsById(await readJson(file), validRecords)
      : validRecords;

    await writeJson(file, finalRecords);
    sendJson(response, 201, {
      ok: true,
      count: finalRecords.length,
      importedCount: validRecords.length,
      records: criterionId ? await applyCriterionToRecords(finalRecords, criterionId) : finalRecords,
    });
    return true;
  }

  if (url.pathname === `${adminPath}/excel` && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const upload = await readBinaryBody(request);
    const uploadName = cleanText(request.headers["x-file-name"] || `${uploadPrefix}.xlsx`, 240).toLowerCase();
    const shouldMerge = String(request.headers["x-merge"] || "").toLowerCase() === "true" || mergeUploads;

    if (!uploadName.endsWith(".xlsx")) {
      sendJson(response, 400, { error: "Please upload an Excel .xlsx file." });
      return true;
    }

    const tempFile = path.join(dataDir, `${uploadPrefix}-upload-${crypto.randomUUID()}.xlsx`);
    await fs.writeFile(tempFile, upload);

    try {
      const records = (await parseExcelFile(tempFile)).map(clean).filter((record) => record.idNumber);
      if (!records.length) {
        sendJson(response, 400, { error: "No valid rows found. Make sure the Excel sheet has an ID column and a normal header row." });
        return true;
      }

      const finalRecords = shouldMerge
        ? mergeRecordsById(await readJson(file), records)
        : records;

      await writeJson(file, finalRecords);
      sendJson(response, 201, {
        ok: true,
        count: finalRecords.length,
        importedCount: records.length,
        records: criterionId ? await applyCriterionToRecords(finalRecords, criterionId) : finalRecords,
      });
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }

    return true;
  }

  if (url.pathname.startsWith(`${adminPath}/`) && request.method === "PUT") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace(`${adminPath}/`, "")).trim();
    const body = await readBody(request);
    const record = clean({ ...body, idNumber });

    if (!record.idNumber) {
      sendJson(response, 400, { error: "ID is required." });
      return true;
    }

    const records = await readJson(file);
    const existingIndex = records.findIndex((item) => String(item.idNumber).trim() === idNumber);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    await writeJson(file, records);
    sendJson(response, 200, {
      ok: true,
      record: criterionId ? (await applyCriterionToRecords([record], criterionId))[0] : record,
    });
    return true;
  }

  if (url.pathname.startsWith(`${adminPath}/`) && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace(`${adminPath}/`, "")).trim();
    const records = await readJson(file);
    const updatedRecords = records.filter((item) => String(item.idNumber).trim() !== idNumber);

    if (records.length === updatedRecords.length) {
      sendJson(response, 404, { error: `No ${label} record found for this ID.` });
      return true;
    }

    await writeJson(file, updatedRecords);
    sendJson(response, 200, { ok: true, count: updatedRecords.length });
    return true;
  }

  if (url.pathname.startsWith(`${publicPath}/`) && request.method === "GET") {
    const idNumber = decodeURIComponent(url.pathname.replace(`${publicPath}/`, "")).trim();
    const records = await readJson(file);
    const record = records.find((item) => String(item.idNumber).trim() === idNumber);

    if (!record) {
      sendJson(response, 404, { error: `No ${label} record found for this ID.` });
      return true;
    }

    sendJson(response, 200, criterionId ? (await applyCriterionToRecords([record], criterionId))[0] : record);
    return true;
  }

  return false;
}

function mergeRecordsById(existingRecords, incomingRecords) {
  const merged = [...existingRecords];
  const indexById = new Map(
    merged.map((record, index) => [String(record.idNumber || "").trim(), index])
  );

  for (const record of incomingRecords) {
    const id = String(record.idNumber || "").trim();
    if (!id) continue;

    if (indexById.has(id)) {
      merged[indexById.get(id)] = record;
    } else {
      indexById.set(id, merged.length);
      merged.push(record);
    }
  }

  return merged;
}

async function handleApi(request, response, url) {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return true;
  }

  if (url.pathname === "/api/admin-login" && request.method === "POST") {
    const body = await readBody(request);
    const accessId = cleanText(body.accessId, 120);
    const password = cleanText(body.password, 240);

    if (accessId === adminAccessId && password === adminPassword) {
      sendJson(response, 200, { ok: true, token: adminToken });
      return true;
    }

    sendJson(response, 401, { error: "Invalid access ID or password." });
    return true;
  }

  if (url.pathname === "/api/contact" && request.method === "POST") {
    const body = await readBody(request);
    const contact = {
      id: crypto.randomUUID(),
      fullName: cleanText(body.fullName, 120),
      email: cleanText(body.email, 180),
      phone: cleanText(body.phone, 80),
      message: cleanText(body.message, 2000),
      createdAt: new Date().toISOString(),
    };

    if (!contact.fullName || !contact.email || !contact.message) {
      sendJson(response, 400, { error: "Full name, email, and message are required." });
      return true;
    }

    const contacts = await readJson(contactsFile);
    contacts.unshift(contact);
    await writeJson(contactsFile, contacts);
    sendJson(response, 201, { ok: true, contact });
    return true;
  }

  if (url.pathname === "/api/contacts" && request.method === "GET") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, await readJson(contactsFile));
    return true;
  }

  if (url.pathname === "/api/display-items" && request.method === "GET") {
    sendJson(response, 200, await readJson(displayItemsFile));
    return true;
  }

  if (url.pathname === "/api/display-items" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const body = await readBody(request);
    const item = {
      id: crypto.randomUUID(),
      title: cleanText(body.title, 120),
      category: cleanText(body.category, 80),
      message: cleanText(body.message, 1000),
      createdAt: new Date().toISOString(),
    };

    if (!item.title || !item.message) {
      sendJson(response, 400, { error: "Title and message are required." });
      return true;
    }

    const items = await readJson(displayItemsFile);
    items.unshift(item);
    await writeJson(displayItemsFile, items);
    sendJson(response, 201, { ok: true, item });
    return true;
  }

  if (url.pathname === "/api/qualification-menu" && request.method === "GET") {
    const items = await readJson(qualificationMenuFile);
    const sortedItems = items
      .slice()
      .sort((a, b) => Number(a.sortOrder || 100) - Number(b.sortOrder || 100));
    sendJson(response, 200, sortedItems);
    return true;
  }

  if (url.pathname === "/api/qualification-menu" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const body = await readBody(request);
    const item = cleanQualificationMenuItem(body);

    if (!item.title || !item.href) {
      sendJson(response, 400, { error: "Qualification name and page link are required." });
      return true;
    }

    const items = await readJson(qualificationMenuFile);
    const existingIndex = items.findIndex((entry) => String(entry.id) === item.id);

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    await writeJson(qualificationMenuFile, items);
    sendJson(response, 201, { ok: true, item, items });
    return true;
  }

  if (url.pathname.startsWith("/api/qualification-menu/") && request.method === "PUT") {
    if (!requireAdmin(request, response)) return true;
    const id = decodeURIComponent(url.pathname.replace("/api/qualification-menu/", "")).trim();
    const body = await readBody(request);
    const item = cleanQualificationMenuItem(body, id);

    if (!item.title || !item.href) {
      sendJson(response, 400, { error: "Qualification name and page link are required." });
      return true;
    }

    const items = await readJson(qualificationMenuFile);
    const existingIndex = items.findIndex((entry) => String(entry.id) === id);

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    await writeJson(qualificationMenuFile, items);
    sendJson(response, 200, { ok: true, item, items });
    return true;
  }

  if (url.pathname.startsWith("/api/qualification-menu/") && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    const id = decodeURIComponent(url.pathname.replace("/api/qualification-menu/", "")).trim();
    const items = await readJson(qualificationMenuFile);
    const updatedItems = items.filter((item) => String(item.id) !== id);

    if (items.length === updatedItems.length) {
      sendJson(response, 404, { error: "No qualification menu item found." });
      return true;
    }

    await writeJson(qualificationMenuFile, updatedItems);
    sendJson(response, 200, { ok: true, count: updatedItems.length });
    return true;
  }

  if (url.pathname === "/api/qualification-criteria" && request.method === "GET") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, await readQualificationCriteria());
    return true;
  }

  if (url.pathname.startsWith("/api/qualification-criteria/") && request.method === "PUT") {
    if (!requireAdmin(request, response)) return true;
    const id = decodeURIComponent(url.pathname.replace("/api/qualification-criteria/", "")).trim();
    const body = await readBody(request);
    const criterion = cleanQualificationCriterion(body, id);

    if (!criterion.title || !criterion.slabs.length) {
      sendJson(response, 400, { error: "Criteria name and at least one slab are required." });
      return true;
    }

    const criteria = await readQualificationCriteria();
    const existingIndex = criteria.findIndex((item) => String(item.id) === id);

    if (existingIndex >= 0) {
      criteria[existingIndex] = criterion;
    } else {
      criteria.push(criterion);
    }

    await writeJson(qualificationCriteriaFile, criteria);
    sendJson(response, 200, { ok: true, criterion, criteria });
    return true;
  }

  if (url.pathname === "/api/qualification-records" && request.method === "GET") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, await applyCriterionToRecords(await readJson(qualificationRecordsFile), "jim-supervisor"));
    return true;
  }

  if (url.pathname === "/api/qualification-records" && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    await writeJson(qualificationRecordsFile, []);
    sendJson(response, 200, { ok: true, count: 0 });
    return true;
  }

  if (url.pathname === "/api/qualification-records" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const body = await readBody(request);
    const records = Array.isArray(body.records) ? body.records.map(cleanRecord) : [];
    const validRecords = records.filter((record) => record.idNumber);

    if (!validRecords.length) {
      sendJson(response, 400, { error: "At least one row with an ID is required." });
      return true;
    }

    await writeJson(qualificationRecordsFile, validRecords);
    sendJson(response, 201, {
      ok: true,
      count: validRecords.length,
      records: await applyCriterionToRecords(validRecords, "jim-supervisor"),
    });
    return true;
  }

  if (url.pathname === "/api/qualification-records/excel" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const upload = await readBinaryBody(request);
    const uploadName = cleanText(request.headers["x-file-name"] || "qualification.xlsx", 240).toLowerCase();

    if (!uploadName.endsWith(".xlsx")) {
      sendJson(response, 400, { error: "Please upload an Excel .xlsx file." });
      return true;
    }

    const tempFile = path.join(dataDir, `qualification-upload-${crypto.randomUUID()}.xlsx`);
    await fs.writeFile(tempFile, upload);

    try {
      const records = (await parseExcelFile(tempFile)).map(cleanRecord).filter((record) => record.idNumber);
      if (!records.length) {
        sendJson(response, 400, { error: "No valid rows found. Make sure the Excel sheet has an ID column and a normal header row." });
        return true;
      }

      await writeJson(qualificationRecordsFile, records);
      sendJson(response, 201, {
        ok: true,
        count: records.length,
        records: await applyCriterionToRecords(records, "jim-supervisor"),
      });
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }

    return true;
  }

  if (url.pathname.startsWith("/api/qualification-records/") && request.method === "PUT") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/qualification-records/", "")).trim();
    const body = await readBody(request);
    const record = cleanRecord({ ...body, idNumber });

    if (!record.idNumber) {
      sendJson(response, 400, { error: "ID is required." });
      return true;
    }

    const records = await readJson(qualificationRecordsFile);
    const existingIndex = records.findIndex((item) => String(item.idNumber).trim() === idNumber);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    await writeJson(qualificationRecordsFile, records);
    sendJson(response, 200, {
      ok: true,
      record: (await applyCriterionToRecords([record], "jim-supervisor"))[0],
    });
    return true;
  }

  if (url.pathname.startsWith("/api/qualification-records/") && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/qualification-records/", "")).trim();
    const records = await readJson(qualificationRecordsFile);
    const updatedRecords = records.filter((item) => String(item.idNumber).trim() !== idNumber);

    if (records.length === updatedRecords.length) {
      sendJson(response, 404, { error: "No qualification record found for this ID." });
      return true;
    }

    await writeJson(qualificationRecordsFile, updatedRecords);
    sendJson(response, 200, { ok: true, count: updatedRecords.length });
    return true;
  }

  if (url.pathname.startsWith("/api/qualification/") && request.method === "GET") {
    const idNumber = decodeURIComponent(url.pathname.replace("/api/qualification/", "")).trim();
    const records = await readJson(qualificationRecordsFile);
    const record = records.find((item) => String(item.idNumber).trim() === idNumber);

    if (!record) {
      sendJson(response, 404, { error: "No qualification record found for this ID." });
      return true;
    }

    sendJson(response, 200, (await applyCriterionToRecords([record], "jim-supervisor"))[0]);
    return true;
  }

  if (url.pathname === "/api/below-supervisor-records" && request.method === "GET") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, await applyCriterionToRecords(await readJson(belowSupervisorRecordsFile), "jim-below"));
    return true;
  }

  if (url.pathname === "/api/below-supervisor-records" && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    await writeJson(belowSupervisorRecordsFile, []);
    sendJson(response, 200, { ok: true, count: 0 });
    return true;
  }

  if (url.pathname === "/api/below-supervisor-records" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const body = await readBody(request);
    const records = Array.isArray(body.records) ? body.records.map(cleanBelowSupervisorRecord) : [];
    const validRecords = records.filter((record) => record.idNumber);
    const shouldMerge = Boolean(body.merge);

    if (!validRecords.length) {
      sendJson(response, 400, { error: "At least one row with an ID is required." });
      return true;
    }

    const finalRecords = shouldMerge
      ? mergeRecordsById(await readJson(belowSupervisorRecordsFile), validRecords)
      : validRecords;

    await writeJson(belowSupervisorRecordsFile, finalRecords);
    sendJson(response, 201, {
      ok: true,
      count: finalRecords.length,
      importedCount: validRecords.length,
      records: await applyCriterionToRecords(finalRecords, "jim-below"),
    });
    return true;
  }

  if (url.pathname === "/api/below-supervisor-records/excel" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const upload = await readBinaryBody(request);
    const uploadName = cleanText(request.headers["x-file-name"] || "below-supervisor.xlsx", 240).toLowerCase();
    const shouldMerge = String(request.headers["x-merge"] || "").toLowerCase() === "true";

    if (!uploadName.endsWith(".xlsx")) {
      sendJson(response, 400, { error: "Please upload an Excel .xlsx file." });
      return true;
    }

    const tempFile = path.join(dataDir, `below-supervisor-upload-${crypto.randomUUID()}.xlsx`);
    await fs.writeFile(tempFile, upload);

    try {
      const records = (await parseExcelFile(tempFile)).map(cleanBelowSupervisorRecord).filter((record) => record.idNumber);
      if (!records.length) {
        sendJson(response, 400, { error: "No valid rows found. Make sure the Excel sheet has an ID column and a normal header row." });
        return true;
      }

      const finalRecords = shouldMerge
        ? mergeRecordsById(await readJson(belowSupervisorRecordsFile), records)
        : records;

      await writeJson(belowSupervisorRecordsFile, finalRecords);
      sendJson(response, 201, {
        ok: true,
        count: finalRecords.length,
        importedCount: records.length,
        records: await applyCriterionToRecords(finalRecords, "jim-below"),
      });
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }

    return true;
  }

  if (url.pathname.startsWith("/api/below-supervisor-records/") && request.method === "PUT") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/below-supervisor-records/", "")).trim();
    const body = await readBody(request);
    const record = cleanBelowSupervisorRecord({ ...body, idNumber });

    if (!record.idNumber) {
      sendJson(response, 400, { error: "ID is required." });
      return true;
    }

    const records = await readJson(belowSupervisorRecordsFile);
    const existingIndex = records.findIndex((item) => String(item.idNumber).trim() === idNumber);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    await writeJson(belowSupervisorRecordsFile, records);
    sendJson(response, 200, {
      ok: true,
      record: (await applyCriterionToRecords([record], "jim-below"))[0],
    });
    return true;
  }

  if (url.pathname.startsWith("/api/below-supervisor-records/") && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/below-supervisor-records/", "")).trim();
    const records = await readJson(belowSupervisorRecordsFile);
    const updatedRecords = records.filter((item) => String(item.idNumber).trim() !== idNumber);

    if (records.length === updatedRecords.length) {
      sendJson(response, 404, { error: "No below-supervisor record found for this ID." });
      return true;
    }

    await writeJson(belowSupervisorRecordsFile, updatedRecords);
    sendJson(response, 200, { ok: true, count: updatedRecords.length });
    return true;
  }

  if (url.pathname.startsWith("/api/below-supervisor/") && request.method === "GET") {
    const idNumber = decodeURIComponent(url.pathname.replace("/api/below-supervisor/", "")).trim();
    const records = await readJson(belowSupervisorRecordsFile);
    const record = records.find((item) => String(item.idNumber).trim() === idNumber);

    if (!record) {
      sendJson(response, 404, { error: "No below-supervisor record found for this ID." });
      return true;
    }

    sendJson(response, 200, (await applyCriterionToRecords([record], "jim-below"))[0]);
    return true;
  }

  if (url.pathname === "/api/gift-records" && request.method === "GET") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, await applyCriterionToRecords(await readJson(giftRecordsFile), "gifts"));
    return true;
  }

  if (url.pathname === "/api/gift-records" && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    await writeJson(giftRecordsFile, []);
    sendJson(response, 200, { ok: true, count: 0 });
    return true;
  }

  if (url.pathname === "/api/gift-records" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const body = await readBody(request);
    const records = Array.isArray(body.records) ? body.records.map(cleanGiftRecord) : [];
    const validRecords = records.filter((record) => record.idNumber);

    if (!validRecords.length) {
      sendJson(response, 400, { error: "At least one row with an ID is required." });
      return true;
    }

    await writeJson(giftRecordsFile, validRecords);
    sendJson(response, 201, {
      ok: true,
      count: validRecords.length,
      records: await applyCriterionToRecords(validRecords, "gifts"),
    });
    return true;
  }

  if (url.pathname === "/api/gift-records/excel" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const upload = await readBinaryBody(request);
    const uploadName = cleanText(request.headers["x-file-name"] || "gifts.xlsx", 240).toLowerCase();

    if (!uploadName.endsWith(".xlsx")) {
      sendJson(response, 400, { error: "Please upload an Excel .xlsx file." });
      return true;
    }

    const tempFile = path.join(dataDir, `gift-upload-${crypto.randomUUID()}.xlsx`);
    await fs.writeFile(tempFile, upload);

    try {
      const records = (await parseExcelFile(tempFile)).map(cleanGiftRecord).filter((record) => record.idNumber);
      if (!records.length) {
        sendJson(response, 400, { error: "No valid rows found. Make sure the Excel sheet has an ID column and a normal header row." });
        return true;
      }

      await writeJson(giftRecordsFile, records);
      sendJson(response, 201, {
        ok: true,
        count: records.length,
        records: await applyCriterionToRecords(records, "gifts"),
      });
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }

    return true;
  }

  if (url.pathname.startsWith("/api/gift-records/") && request.method === "PUT") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/gift-records/", "")).trim();
    const body = await readBody(request);
    const record = cleanGiftRecord({ ...body, idNumber });

    if (!record.idNumber) {
      sendJson(response, 400, { error: "ID is required." });
      return true;
    }

    const records = await readJson(giftRecordsFile);
    const existingIndex = records.findIndex((item) => String(item.idNumber).trim() === idNumber);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    await writeJson(giftRecordsFile, records);
    sendJson(response, 200, {
      ok: true,
      record: (await applyCriterionToRecords([record], "gifts"))[0],
    });
    return true;
  }

  if (url.pathname.startsWith("/api/gift-records/") && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/gift-records/", "")).trim();
    const records = await readJson(giftRecordsFile);
    const updatedRecords = records.filter((item) => String(item.idNumber).trim() !== idNumber);

    if (records.length === updatedRecords.length) {
      sendJson(response, 404, { error: "No gift record found for this ID." });
      return true;
    }

    await writeJson(giftRecordsFile, updatedRecords);
    sendJson(response, 200, { ok: true, count: updatedRecords.length });
    return true;
  }

  if (url.pathname.startsWith("/api/gifts/") && request.method === "GET") {
    const idNumber = decodeURIComponent(url.pathname.replace("/api/gifts/", "")).trim();
    const records = await readJson(giftRecordsFile);
    const record = records.find((item) => String(item.idNumber).trim() === idNumber);

    if (!record) {
      sendJson(response, 404, { error: "No gift record found for this ID." });
      return true;
    }

    sendJson(response, 200, (await applyCriterionToRecords([record], "gifts"))[0]);
    return true;
  }

  if (url.pathname === "/api/goa-records" && request.method === "GET") {
    if (!requireAdmin(request, response)) return true;
    sendJson(response, 200, await applyCriterionToRecords(await readJson(goaRecordsFile), "goa"));
    return true;
  }

  if (url.pathname === "/api/goa-records" && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    await writeJson(goaRecordsFile, []);
    sendJson(response, 200, { ok: true, count: 0 });
    return true;
  }

  if (url.pathname === "/api/goa-records" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const body = await readBody(request);
    const records = Array.isArray(body.records) ? body.records.map(cleanGoaRecord) : [];
    const validRecords = records.filter((record) => record.idNumber);

    if (!validRecords.length) {
      sendJson(response, 400, { error: "At least one row with an ID is required." });
      return true;
    }

    await writeJson(goaRecordsFile, validRecords);
    sendJson(response, 201, {
      ok: true,
      count: validRecords.length,
      records: await applyCriterionToRecords(validRecords, "goa"),
    });
    return true;
  }

  if (url.pathname === "/api/goa-records/excel" && request.method === "POST") {
    if (!requireAdmin(request, response)) return true;
    const upload = await readBinaryBody(request);
    const uploadName = cleanText(request.headers["x-file-name"] || "goa.xlsx", 240).toLowerCase();

    if (!uploadName.endsWith(".xlsx")) {
      sendJson(response, 400, { error: "Please upload an Excel .xlsx file." });
      return true;
    }

    const tempFile = path.join(dataDir, `goa-upload-${crypto.randomUUID()}.xlsx`);
    await fs.writeFile(tempFile, upload);

    try {
      const records = (await parseExcelFile(tempFile)).map(cleanGoaRecord).filter((record) => record.idNumber);
      if (!records.length) {
        sendJson(response, 400, { error: "No valid rows found. Make sure the Excel sheet has an ID column and a normal header row." });
        return true;
      }

      await writeJson(goaRecordsFile, records);
      sendJson(response, 201, {
        ok: true,
        count: records.length,
        records: await applyCriterionToRecords(records, "goa"),
      });
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }

    return true;
  }

  if (url.pathname.startsWith("/api/goa-records/") && request.method === "PUT") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/goa-records/", "")).trim();
    const body = await readBody(request);
    const record = cleanGoaRecord({ ...body, idNumber });

    if (!record.idNumber) {
      sendJson(response, 400, { error: "ID is required." });
      return true;
    }

    const records = await readJson(goaRecordsFile);
    const existingIndex = records.findIndex((item) => String(item.idNumber).trim() === idNumber);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    await writeJson(goaRecordsFile, records);
    sendJson(response, 200, {
      ok: true,
      record: (await applyCriterionToRecords([record], "goa"))[0],
    });
    return true;
  }

  if (url.pathname.startsWith("/api/goa-records/") && request.method === "DELETE") {
    if (!requireAdmin(request, response)) return true;
    const idNumber = decodeURIComponent(url.pathname.replace("/api/goa-records/", "")).trim();
    const records = await readJson(goaRecordsFile);
    const updatedRecords = records.filter((item) => String(item.idNumber).trim() !== idNumber);

    if (records.length === updatedRecords.length) {
      sendJson(response, 404, { error: "No Goa record found for this ID." });
      return true;
    }

    await writeJson(goaRecordsFile, updatedRecords);
    sendJson(response, 200, { ok: true, count: updatedRecords.length });
    return true;
  }

  if (url.pathname.startsWith("/api/goa/") && request.method === "GET") {
    const idNumber = decodeURIComponent(url.pathname.replace("/api/goa/", "")).trim();
    const records = await readJson(goaRecordsFile);
    const record = records.find((item) => String(item.idNumber).trim() === idNumber);

    if (!record) {
      sendJson(response, 404, { error: "No Goa record found for this ID." });
      return true;
    }

    sendJson(response, 200, (await applyCriterionToRecords([record], "goa"))[0]);
    return true;
  }

  if (await handleRecordDatasetApi(request, response, url, {
    adminPath: "/api/june-special-offer-records",
    publicPath: "/api/june-special-offer",
    file: juneSpecialOfferRecordsFile,
    clean: cleanJuneSpecialOfferRecord,
    uploadPrefix: "june-special-offer",
    label: "June Special Offer",
    criterionId: "june-special-offer",
  })) return true;

  if (await handleRecordDatasetApi(request, response, url, {
    adminPath: "/api/progress-supervisor-records",
    publicPath: "/api/progress-supervisor",
    file: progressSupervisorRecordsFile,
    clean: cleanProgressRecord,
    uploadPrefix: "progress-supervisor",
    label: "progress supervisor",
    mergeUploads: true,
  })) return true;

  if (await handleRecordDatasetApi(request, response, url, {
    adminPath: "/api/progress-below-records",
    publicPath: "/api/progress-below",
    file: progressBelowRecordsFile,
    clean: cleanProgressRecord,
    uploadPrefix: "progress-below",
    label: "progress below-supervisor",
    mergeUploads: true,
  })) return true;

  return false;
}

async function serveStatic(request, response, url) {
  let requestedPath = decodeURIComponent(url.pathname);
  if (requestedPath === "/") requestedPath = "/index.html";

  const filePath = path.normalize(path.join(root, requestedPath));
  const isInsideRoot = filePath.startsWith(root);
  const isProtected = filePath.startsWith(dataDir) || path.basename(filePath) === "server.js";

  if (!isInsideRoot || isProtected) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (await handleApi(request, response, url)) return;
    await serveStatic(request, response, url);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
  }
});

ensureDataFiles().then(() => {
  server.listen(port, () => {
    console.log(`Wellness Path backend running at http://127.0.0.1:${port}`);
  });
});
