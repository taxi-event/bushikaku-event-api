
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
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d}`;
}

function normalizeDate(text) {
  return text.replace(/[\s年月日（）()]/g, "").replace(/\b0+/g, "");
}

function isTargetDate(dateText) {
  const formattedToday = formatDate(today);
  const formattedTomorrow = formatDate(tomorrow);
  const normalized = normalizeDate(dateText);
  return normalized.includes(formattedToday.replace("/", "")) || normalized.includes(formattedTomorrow.replace("/", ""));
}

async function getTokyoDomeEvents() {
  const url = "https://www.tokyo-dome.co.jp/dome/event/schedule.html";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  $(".event-schedule__item").each((i, el) => {
    const date = $(el).find(".event-schedule__date").text().trim();
    const title = $(el).find(".event-schedule__title").text().trim();
    const rawTime = $(el).find(".event-schedule__time").text().trim();

    console.log("東京ドーム 日付:", date, "タイトル:", title);
    if (isTargetDate(date)) {
      events.push({
        date,
        time: rawTime || "要確認",
        venue: "東京ドーム",
        category: "イベント",
        title,
      });
    }
  });

  console.log("東京ドーム: ", events.length, "件抽出");
  return events;
}

async function getBlueNoteEvents() {
  const url = "https://www.bluenote.co.jp/jp/artists/schedule/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  $(".liveInfoList .list").each((i, el) => {
    const dateText = $(el).find(".date").text().trim();
    const artist = $(el).find(".name").text().trim();
    const time = $(el).find(".time").text().trim();

    console.log("ブルーノート 日付:", dateText, "アーティスト:", artist);
    if (isTargetDate(dateText)) {
      events.push({
        date: dateText,
        time: time || "要確認",
        venue: "ブルーノート東京",
        category: "ライブ",
        title: artist,
      });
    }
  });

  console.log("ブルーノート: ", events.length, "件抽出");
  return events;
}

async function getTokyoInternationalForumEvents() {
  const url = "https://www.t-i-forum.co.jp/visitors/event/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  $(".eventList .eventItem").each((i, el) => {
    const date = $(el).find(".eventDate").text().trim();
    const title = $(el).find(".eventTitle").text().trim();
    const time = $(el).find(".eventTime").text().trim();

    console.log("フォーラム 日付:", date, "タイトル:", title);
    if (isTargetDate(date)) {
      events.push({
        date,
        time: time || "要確認",
        venue: "東京国際フォーラム",
        category: "イベント",
        title,
      });
    }
  });

  console.log("フォーラム: ", events.length, "件抽出");
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
    console.error("取得エラー:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
