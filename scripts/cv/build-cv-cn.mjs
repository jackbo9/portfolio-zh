#!/usr/bin/env node
/**
 * Builds output/pdf/Junyan_Lu_CV_CN.pdf from scripts/cv/cv-cn.html.
 *
 * The Chinese CV is built from HTML rather than exported from Figma so the
 * source lives in the repo, the PDF stays small (~0.85 MB against ~3 MB) and
 * the links stay clickable.
 *
 * Correcting an earlier claim: this file used to say Figma's PDF text layer was
 * unusable for ATS parsing. That came from a single extractor (pypdf), which
 * inserts spaces between full-width CJK glyphs. pdfminer-based extraction reads
 * both the Figma export and this one cleanly, so the ATS claim was wrong and
 * must not be repeated as fact.
 *
 * Usage: node scripts/cv/build-cv-cn.mjs
 * Playwright is resolved from PLAYWRIGHT_PATH, then a few known locations.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..", "..");

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    path.join(root, "node_modules", "playwright"),
    "/Users/ninebot/Desktop/AI\u667a\u7ed8/node_modules/playwright",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error(
    "Playwright not found. Set PLAYWRIGHT_PATH to a playwright install, or npm i -D playwright."
  );
}

const { chromium } = loadPlaywright();
const source = path.join(root, "scripts", "cv", "cv-cn.html");
const out = path.join(root, "output", "pdf", "Junyan_Lu_CV_CN.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(source).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// Measure the page's natural content height with the fixed A4 height lifted,
// otherwise scrollHeight just reports the clamped box.
const fit = await page.evaluate(() => {
  const el = document.querySelector(".page");
  const px = 0.75; // 1 CSS px = 0.75pt
  const box = el.getBoundingClientRect();
  const pagePt = Math.round(box.height * px);
  const previous = el.style.height;
  el.style.height = "auto";
  const naturalPt = Math.round(el.getBoundingClientRect().height * px);
  el.style.height = previous;
  return {
    widthPt: Math.round(box.width * px),
    contentPt: naturalPt,
    pagePt,
    fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family),
  };
});

await page.emulateMedia({ media: "print" });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});
await browser.close();

const size = fs.statSync(out).size;
const overflow = fit.contentPt > fit.pagePt ? Math.round(fit.contentPt - fit.pagePt) : 0;
console.log(`wrote ${path.relative(root, out)} (${(size / 1024).toFixed(0)} KB)`);
console.log(`  page ${fit.widthPt}pt wide, content ${fit.contentPt}pt of ${fit.pagePt}pt`);
console.log(`  loaded fonts: ${[...new Set(fit.fonts)].join(", ")}`);
if (overflow) console.error(`  WARNING: content overflows the page by ${overflow}pt`);
process.exit(overflow ? 1 : 0);
