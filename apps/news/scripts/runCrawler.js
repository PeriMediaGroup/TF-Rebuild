/**
 * TriggerFeed NewsBot
 * Full hybrid crawler with Supabase fallback + image extraction
 * (c) 2025 TriggerFeed / Peri Media Group
 */


import 'dotenv/config';
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

// ---------- CONFIG ----------

const DEBUG = process.env.DEBUG === "1";
const FRESH_HOURS = 24; // Change to 168 for 1 week
const GLOBAL_CAP = 20;
const PER_SOURCE = 3;
const INGEST_URL =
  "https://usvcucujzfzazszcaonb.functions.supabase.co/news-ingest";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RSS_FILE = path.resolve("./utils/rssFeeds.json");

// ---------- HELPERS ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safeFetch(url, opts = {}) {
  try {
    const r = await fetch(url, { ...opts, timeout: 15000 });
    if (!r.ok) throw new Error(`Status ${r.status}`);
    return await r.text();
  } catch (err) {
    throw new Error(`${url}: ${err.message}`);
  }
}

function ts() {
  return `[${new Date().toISOString()}]`;
}

function extractImage($el, baseUrl = "") {
  const img =
    $el.find("img").first().attr("src") ||
    $el.find("img").first().attr("data-src") ||
    $el.find("img").first().attr("data-original") ||
    (() => {
      const style =
        $el.find("[style]").first().attr("style") || $el.attr("style") || "";
      const m = style.match(/url\\(["']?(.*?)["']?\\)/i);
      return m ? m[1] : null;
    })();
  if (!img) return null;
  try {
    return new URL(img, baseUrl).toString();
  } catch {
    return img;
  }
}

async function safeGoto(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  } catch {
    await page.goto(url, { timeout: 60000 });
  }
}

// ---------- MAIN ----------
async function run() {
  console.log(ts(), "=== TriggerFeed NewsBot: Crawling feeds ===");

  const cutoff = Date.now() - FRESH_HOURS * 60 * 60 * 1000;
  const feeds = JSON.parse(fs.readFileSync(RSS_FILE, "utf8"));

  const browser = await puppeteer.launch({
    headless: !DEBUG,
    slowMo: DEBUG ? 50 : 0,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const collected = [];

  for (const src of feeds) {
    console.log(ts(), `📰 Fetching ${src.source_name}...`);
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
    );

    try {
      if (src.type === "rss" || src.url.endsWith(".xml")) {
        const xml = await safeFetch(src.url);
        const $ = cheerio.load(xml, { xmlMode: true });
        const items = $("item")
          .map((_, el) => {
            const title = $(el).find("title").text().trim();
            const link = $(el).find("link").text().trim();
            const pub = new Date($(el).find("pubDate").text()).toISOString();
            const desc = $(el).find("description").text().trim();
            return {
              source_name: src.source_name,
              source_url: link,
              title_raw: title,
              content_raw: desc,
              published_at: pub,
              hash: Buffer.from(title + link).toString("base64"),
              image_url: extractImage($(el), src.url),
            };
          })
          .get()
          .filter(
            (it) =>
              it.published_at &&
              Date.parse(it.published_at) >= cutoff &&
              it.title_raw
          );
        console.log(
          ts(),
          `${src.source_name}: collected ${items.length} fresh RSS items.`
        );
        collected.push(...items);
      } else {
        await safeGoto(page, src.url);
        await page.waitForSelector("body", { timeout: 15000 });
        const html = await page.content();
        const $ = cheerio.load(html);

        const articles = $("article, .blog-item, .post, .card")
          .slice(0, 10)
          .map((_, el) => {
            const title =
              $(el).find("h2, h3, a").first().text().trim() ||
              $(el).attr("title") ||
              "";
            const href =
              $(el).find("a").first().attr("href") ||
              $(el).find("a").attr("data-href") ||
              "";
            const desc = $(el).find("p").first().text().trim();
            const img = extractImage($(el), src.url);
            const pub = new Date().toISOString(); // fallback if no timestamp
            return {
              source_name: src.source_name,
              source_url: href.startsWith("http")
                ? href
                : new URL(href, src.url).toString(),
              title_raw: title,
              content_raw: desc,
              published_at: pub,
              hash: Buffer.from(title + href).toString("base64"),
              image_url: img,
            };
          })
          .get()
          .filter((it) => it.title_raw);
        console.log(
          ts(),
          `${src.source_name}: collected ${articles.length} fresh HTML items.`
        );
        collected.push(...articles);
      }
    } catch (err) {
      console.log(ts(), `ERROR: ${src.source_name}: ${err.message}`);
    } finally {
      await page.close();
      await sleep(400);
    }
  }

  await browser.close();

  // --- Deduplicate + hybrid select ---
  const uniq = [];
  const seen = new Set();
  for (const it of collected) {
    if (!seen.has(it.hash)) {
      uniq.push(it);
      seen.add(it.hash);
    }
  }

  // per-source quota
  const bySource = {};
  for (const it of uniq) {
    if (!bySource[it.source_name]) bySource[it.source_name] = [];
    if (bySource[it.source_name].length < PER_SOURCE)
      bySource[it.source_name].push(it);
  }
  const selected = Object.values(bySource)
    .flat()
    .slice(0, GLOBAL_CAP);
  console.log(
    ts(),
    `Selecting posts via hybrid strategy (${selected.length}/${GLOBAL_CAP}).`
  );

  // --- Ingest or direct insert ---
  for (const item of selected) {
    try {
      console.log(
        ts(),
        `>>> posting to: ${INGEST_URL} title: ${item.title_raw.substring(
          0,
          60
        )}...`
      );
      const r = await fetch(INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const txt = await r.text();
      console.log(ts(), `${item.source_name}: ${item.title_raw} → ${txt}`);
    } catch (err) {
      console.log(
        ts(),
        `WARN: ${item.source_name}: edge ingest failed (${err.message}), inserting directly...`
      );
      try {
        const { error } = await supabase.from("news_queue").insert([
          {
            source_name: item.source_name,
            source_url: item.source_url,
            title_raw: item.title_raw,
            content_raw: item.content_raw,
            published_at: item.published_at,
            hash: item.hash,
            image_url: item.image_url || null,
            fetched_at: new Date().toISOString(),
            processed: false,
          },
        ]);
        if (error) console.error("Supabase insert error:", error.message);
      } catch (dbErr) {
        console.error("Direct insert failed:", dbErr.message);
      }
    }
  }

  console.log(ts(), "✅ Done crawling all feeds.");
}

run().catch((e) => console.error(ts(), "Fatal:", e));
