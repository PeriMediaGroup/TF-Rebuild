/**
 * TriggerFeed NewsBot
 *  - waits for complete page load before scraping
 *  - only queues posts newer than 24 hours
 *  - keeps hybrid source balance + logging
 */

import Parser from "rss-parser";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import crypto from "crypto";
import fs from "fs";

const parser = new Parser({ timeout: 10000 });
const FEEDS_FILE = "./utils/rssFeeds.json";
const INGEST_URL =
  "https://usvcucujzfzazszcaonb.functions.supabase.co/news-ingest";
const LOG = (...msg) =>
  console.log(`[${new Date().toISOString()}]`, ...msg);

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) =>
  crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
const HOURS = 24 * 7; // one week
const cutoff = Date.now() - HOURS * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Puppeteer selectors (for JS-rendered pages)
// ---------------------------------------------------------------------------
const puppeteerSelectors = {
  "sigsauer.com": {
    container: ".blog-item",
    title: ".blog-title a",
    link: ".blog-title a",
    desc: ".blog-excerpt",
    date: ".blog-date",
    image: "img",
  },
  "glock.com": {
    container: ".press-release, .news-item, .article",
    title: "h2, .title, .heading",
    link: "a",
    desc: "p, .summary, .excerpt",
    date: "time, .date",
    image: "img",
  },
  "danieldefense.com": {
    container: ".mfblogunveil, .post-list .item",
    title: ".post-title a, h2 a",
    link: ".post-title a",
    desc: ".post-short-content p, .post-content p",
    date: "time, .post-meta time",
    image: (el, $) =>
      $(el).attr("data-original") ||
      $(el).find("img").attr("src") ||
      $(el)
        .css("background-image")
        ?.replace(/url\(["']?(.*?)["']?\)/, "$1"),
  },
};

// ---------------------------------------------------------------------------
// Generic Puppeteer scraper (waits for full page load)
// ---------------------------------------------------------------------------
async function scrapeWithPuppeteer(url, source_name) {
  LOG(`${source_name}: launching headless browser...`);
  const browser = await puppeteer.launch({
    headless: false, // set to true for silent mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  );

  await page.goto(url, {
    waitUntil: ["load", "domcontentloaded", "networkidle0"],
    timeout: 60000,
  });
  await page.waitForTimeout(1500);

  const domain = new URL(url).hostname.replace("www.", "");
  const sel = puppeteerSelectors[domain];
  const html = await page.content();
  const $ = cheerio.load(html);
  const items = [];

  $(sel?.container || "article, .post, .card").each((_, el) => {
    const get = (selKey) =>
      typeof sel?.[selKey] === "function"
        ? sel[selKey](el, $)
        : $(el).find(sel?.[selKey] || "").first().text().trim();

    const title = get("title") || $(el).find("h1,h2").first().text().trim();
    const linkRaw =
      $(el).find("a").first().attr("href") &&
      new URL($(el).find("a").first().attr("href"), url).toString();
    const desc =
      get("desc") ||
      $(el).find("p").first().text().trim() ||
      $(el).text().slice(0, 200);
    const date =
      get("date") ||
      $(el).find("time").attr("datetime") ||
      $(el).find("time").text().trim();
    const image =
      typeof sel?.image === "function"
        ? sel.image(el, $)
        : $(el).find(sel?.image || "img").attr("src");

    if (title) {
      items.push({
        source_name,
        source_url: linkRaw || url,
        title,
        content: desc,
        image_url: image || null,
        published_at: date || new Date().toISOString(),
      });
    }
  });

  await browser.close();
  return { title: `${source_name} (puppeteer scrape)`, items };
}

// ---------------------------------------------------------------------------
// RSS + Fallback + Freshness filtering
// ---------------------------------------------------------------------------
async function scrapeFeed(feed) {
  const { source_name, url, type } = feed;
  LOG(`📰 Fetching ${source_name}...`);
  try {
    if (type === "html" || url.includes("blog")) {
      const { items } = await scrapeWithPuppeteer(url, source_name);
      return items;
    } else {
      const data = await parser.parseURL(url);
      return (
        data.items
          ?.map((it) => ({
            source_name,
            source_url: it.link,
            title: it.title,
            content: it.contentSnippet || it.content || "",
            image_url:
              it.enclosure?.url ||
              it["media:content"]?.url ||
              it["media:thumbnail"]?.url ||
              null,
            published_at:
              it.isoDate || it.pubDate || new Date().toISOString(),
          }))
          .filter((x) => new Date(x.published_at).getTime() >= cutoff) || []
      );
    }
  } catch (err) {
    LOG(`ERROR: ${source_name}: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Load feeds + ingest fresh posts only
// ---------------------------------------------------------------------------
async function run() {
  LOG("=== TriggerFeed NewsBot: Crawling feeds ===");

  const feeds = JSON.parse(fs.readFileSync(FEEDS_FILE, "utf-8"));
  let allItems = [];

  for (const feed of feeds) {
    const items = await scrapeFeed(feed);
    if (items?.length) {
      LOG(`${feed.source_name}: collected ${items.length} fresh items.`);
      allItems.push(...items);
    } else {
      LOG(`WARN: ${feed.source_name}: no fresh items found.`);
    }
  }

  // hybrid selection
  const perSourceQuota = 3;
  const globalCap = 20;
  const grouped = {};
  allItems.forEach((i) => {
    grouped[i.source_name] = grouped[i.source_name] || [];
    grouped[i.source_name].push(i);
  });
  const selected = Object.values(grouped)
    .flatMap((arr) => arr.slice(0, perSourceQuota))
    .slice(0, globalCap);

  LOG(
    `Selecting posts via hybrid strategy (${selected.length}/${globalCap} max).`
  );

  for (const post of selected) {
    const body = {
      source_name: post.source_name,
      source_url: post.source_url,
      title_raw: post.title,
      content_raw: post.content,
      image_url: post.image_url,
      published_at: post.published_at,
      hash: hash(post.title + post.source_url),
    };

    LOG(
      `>>> posting to: ${INGEST_URL} title: ${post.title.slice(0, 70)}...`
    );
    const res = await fetch(INGEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch((e) => ({ status: e.message }));

    const data = (await res.json?.()) || res;
    LOG(
      `${post.source_name}: ${post.title.slice(0, 60)} →`,
      JSON.stringify(data)
    );
    await sleep(300);
  }

  LOG("✅ Done crawling all feeds.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
run();
