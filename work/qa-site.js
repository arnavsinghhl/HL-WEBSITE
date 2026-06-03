const fs = require("node:fs");
const path = require("node:path");
let chromium;
try {
  chromium = require("playwright").chromium;
} catch {
  chromium = null;
}

const root = path.resolve(__dirname, "..", "outputs");
const pages = [
  "index.html",
  "services.html",
  "success-stories.html",
  "success-story.html",
  "qualification.html",
  "tickets.html",
  "jim-corbett-qualification.html",
  "qualification-information.html",
  "below-supervisor-information.html",
  "gifts-pc-associates.html",
  "gifts-pc-associates-information.html",
  "goa-qualification.html",
  "goa-qualification-information.html",
  "june-special-offer.html",
  "june-special-offer-information.html",
  "about.html",
  "contact.html",
  "admin-login.html",
  "admin.html",
];

function extractAttributes(html, attr) {
  const matches = [];
  const re = new RegExp(`${attr}="([^"]+)"`, "g");
  let match;
  while ((match = re.exec(html))) matches.push(match[1]);
  return matches;
}

for (const page of pages) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, "utf8");
  for (const href of extractAttributes(html, "href")) {
    if (href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:") || href === "#") continue;
    const target = path.join(root, href.split(/[?#]/)[0]);
    if (!fs.existsSync(target)) throw new Error(`${page} links to missing file: ${href}`);
  }
  for (const src of extractAttributes(html, "src")) {
    if (src.startsWith("http")) continue;
    const target = path.join(root, src);
    if (!fs.existsSync(target)) throw new Error(`${page} references missing asset: ${src}`);
  }
}

(async () => {
  if (!chromium) {
    console.log(`QA passed for ${pages.length} pages. Browser screenshot step skipped because Playwright is unavailable.`);
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  await desktop.goto(`file://${path.join(root, "index.html").replace(/\\/g, "/")}`);
  await desktop.screenshot({ path: path.resolve(__dirname, "home-desktop.png"), fullPage: false });
  const desktopTitle = await desktop.title();
  const desktopOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(`file://${path.join(root, "index.html").replace(/\\/g, "/")}`);
  await mobile.screenshot({ path: path.resolve(__dirname, "home-mobile.png"), fullPage: false });
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  await browser.close();

  if (desktopOverflow) throw new Error("Desktop layout has horizontal overflow.");
  if (mobileOverflow) throw new Error("Mobile layout has horizontal overflow.");
  console.log(`QA passed for ${pages.length} pages. Title: ${desktopTitle}`);
})();
