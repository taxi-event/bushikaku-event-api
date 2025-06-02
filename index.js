// index.js（デバッグ用ログ追加）
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function getTokyoDomeEvents() {
  const url = "https://www.tokyo-dome.co.jp/dome/event/schedule.html";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  console.log("[東京ドーム] today:", formatDate(today));
  console.log("[東京ドーム] tomorrow:", formatDate(tomorrow));

  $(".event-schedule__item").each((i, el) => {
    const rawDate = $(el).find(".event-schedule__date").text().trim();
    const date = rawDate.replace(/[年月]/g, "-").replace("日", "").trim();
    const title = $(el).find(".event-schedule__title").text().trim();
    const rawTime = $(el).find(".event-schedule__time").text().trim();

    console.log("[東京ドーム] rawDate:", rawDate, "→", date);

    if (date === formatDate(today) || date === formatDate(tomorrow)) {
      events.push({
        date,
        time: rawTime || "要確認",
        venue: "東京ドーム",
        category: "イベント",
        title,
      });
    }
  });

  console.log("東京ドーム:", events.length, "件抽出");
  return events;
}

async function getBlueNoteEvents() {
  const url = "https://www.bluenote.co.jp/jp/artists/schedule/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  console.log("[ブルーノート] today:", formatDate(today));
  console.log("[ブルーノート] tomorrow:", formatDate(tomorrow));

  $(".liveInfoList .list").each((i, el) => {
    const rawDate = $(el).find(".date").text().trim();
    const date = rawDate.replace(/[年月]/g, "-").replace("日", "").trim();
    const artist = $(el).find(".name").text().trim();
    const time = $(el).find(".time").text().trim();

    console.log("[ブルーノート] rawDate:", rawDate, "→", date);

    if (date === formatDate(today) || date === formatDate(tomorrow)) {
      events.push({
        date,
        time: time || "要確認",
        venue: "ブルーノート東京",
        category: "ライブ",
        title: artist,
      });
    }
  });

  console.log("ブルーノート:", events.length, "件抽出");
  return events;
}

async function getTokyoInternationalForumEvents() {
  const url = "https://www.t-i-forum.co.jp/visitors/event/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  console.log("[フォーラム] today:", formatDate(today));
  console.log("[フォーラム] tomorrow:", formatDate(tomorrow));

  $(".eventList .eventItem").each((i, el) => {
    const rawDate = $(el).find(".eventDate").text().trim();
    const date = rawDate.split("（")[0];
    const title = $(el).find(".eventTitle").text().trim();
    const time = $(el).find(".eventTime").text().trim();

    console.log("[フォーラム] rawDate:", rawDate, "→", date);

    if (date === formatDate(today) || date === formatDate(tomorrow)) {
      events.push({
        date,
        time: time || "要確認",
        venue: "東京国際フォーラム",
        category: "イベント",
        title,
      });
    }
  });

  console.log("フォーラム:", events.length, "件抽出");
  return events;
}

app.get("/events", async (req, res) => {
  try {
    const [dome, blueNote, tif] = await Promise.all([
      getTokyoDomeEvents(),
      getBlueNoteEvents(),
      getTokyoInternationalForumEvents()
    ]);
    const events = [...dome, ...blueNote, ...tif];
    res.json({ status: "ok", date: new Date().toISOString(), debug: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
