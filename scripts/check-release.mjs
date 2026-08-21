#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const baseUrl = "https://jackbo9.github.io/portfolio-zh/";
const pages = [
  "index.html",
  "index-en.html",
  "project-youfeed.html",
  "project-youfeed-en.html",
  "project-sound-explore-studio-sidebar.html",
  "project-sound-explore-studio-sidebar-en.html",
  "project-research-systems.html",
  "project-research-systems-en.html",
  "project-caffeine-check.html",
  "project-caffeine-check-en.html",
  "project-kiss-kitty.html",
  "project-tangity-tribe.html",
  "sound-mirror-test-protocol.html",
  "404.html",
];
const visualPages = pages.filter((page) => page !== "404.html");

const bilingualPairs = [
  ["index.html", "index-en.html"],
  ["project-youfeed.html", "project-youfeed-en.html"],
  ["project-sound-explore-studio-sidebar.html", "project-sound-explore-studio-sidebar-en.html"],
  ["project-research-systems.html", "project-research-systems-en.html"],
  ["project-caffeine-check.html", "project-caffeine-check-en.html"],
];
const formalSeoPages = new Set(bilingualPairs.flat());

const errors = [];
const documents = new Map();

function attributeValues(source, attribute) {
  return [...source.matchAll(new RegExp(`${attribute}=["']([^"']+)["']`, "gi"))].map((match) => match[1]);
}

function anchors(source) {
  return new Set(["", ...[...source.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1])]);
}

function canonical(source) {
  return source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
}

function alternate(source, language) {
  const links = [...source.matchAll(/<link\s+rel=["']alternate["'][^>]*>/gi)].map((match) => match[0]);
  return links.find((link) => new RegExp(`hreflang=["']${language}["']`, "i").test(link))?.match(/href=["']([^"']+)["']/i)?.[1];
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const releaseManifest = (await readFile(join(root, "scripts/release-files.txt"), "utf8"))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

for (const file of releaseManifest) {
  if (!(await exists(join(root, file)))) errors.push(`release manifest: missing ${file}`);
}

for (const page of pages) {
  const path = join(root, page);
  if (!(await exists(path))) {
    errors.push(`${page}: file is missing`);
    continue;
  }
  documents.set(page, await readFile(path, "utf8"));
}

for (const [page, source] of documents) {
  if (page !== "404.html" && !/<h1\b/i.test(source)) errors.push(`${page}: no h1`);
  if (formalSeoPages.has(page) && !canonical(source)) {
    errors.push(`${page}: no canonical URL`);
  }
  if (page === "index.html" || page === "index-en.html") {
    if (!/<meta\s+property=["']og:title["']/i.test(source)) errors.push(`${page}: no og:title`);
    if (!/<meta\s+property=["']og:description["']/i.test(source)) errors.push(`${page}: no og:description`);
    if (!/<meta\s+property=["']og:image["']/i.test(source)) errors.push(`${page}: no og:image`);
  }
  if (visualPages.includes(page) && !/<link\s+rel=["']icon["']/i.test(source)) {
    errors.push(`${page}: no favicon link`);
  }
  const targets = [...attributeValues(source, "href"), ...attributeValues(source, "src")];
  for (const set of attributeValues(source, "srcset")) {
    for (const candidate of set.split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) targets.push(url);
    }
  }
  for (const rawTarget of targets) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(rawTarget) || rawTarget === "#") continue;
    const [pathPart, hash = ""] = rawTarget.split("#");
    const cleanPath = pathPart.split("?")[0];
    const targetPage = cleanPath || page;
    const absoluteTarget = resolve(root, dirname(page), cleanPath || page);
    if (!(await exists(absoluteTarget))) {
      errors.push(`${page}: missing local target ${rawTarget}`);
      continue;
    }
    const isHomeState = /^(?:index(?:-en)?\.html)$/.test(targetPage) && ["about", "youfeed", "sound", "research", "caffeine"].includes(hash);
    if (hash && extname(targetPage).toLowerCase() === ".html" && !isHomeState) {
      const targetKey = targetPage.replace(/^\.\//, "");
      const targetSource = documents.get(targetKey) ?? await readFile(absoluteTarget, "utf8");
      if (!anchors(targetSource).has(hash)) errors.push(`${page}: missing anchor ${rawTarget}`);
    }
  }
}

for (const [zhPage, enPage] of bilingualPairs) {
  const zh = documents.get(zhPage);
  const en = documents.get(enPage);
  const zhUrl = zhPage === "index.html" ? baseUrl : `${baseUrl}${zhPage}`;
  const enUrl = `${baseUrl}${enPage}`;
  if (canonical(zh) !== zhUrl) errors.push(`${zhPage}: canonical does not match ${zhUrl}`);
  if (canonical(en) !== enUrl) errors.push(`${enPage}: canonical does not match ${enUrl}`);
  for (const [page, source] of [[zhPage, zh], [enPage, en]]) {
    if (alternate(source, "zh-CN") !== zhUrl) errors.push(`${page}: zh-CN alternate mismatch`);
    if (alternate(source, "en") !== enUrl) errors.push(`${page}: en alternate mismatch`);
    if (alternate(source, "x-default") !== zhUrl) errors.push(`${page}: x-default alternate mismatch`);
  }
}

if (errors.length) {
  console.error(`Release check failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Release check passed: ${documents.size} pages, ${bilingualPairs.length} bilingual pairs.`);
}
