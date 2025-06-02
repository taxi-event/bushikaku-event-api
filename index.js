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
  return date.toISOString().split("T")[0];
}

async function getTokyoDomeEvents() {
  const url = "https://www.tokyo-dome.co.jp/dome/event/schedule.html";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  $(".event-schedule__item").each((i, el) => {
    const rawDate = $(el).find(".event-schedule__date").text().trim();
    const date = rawDate.replace(/[年月]/g, "-").replace("日", "").trim();
    const title = $(el).find(".event-schedule__title").text().trim();
    const rawTime = $(el).find(".event-schedule__time").text().trim();

    events.push({
      rawDate,
      date,
      time: rawTime || "要確認",
      venue: "東京ドーム",
      category: "イベント",
      title
    });
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
    const rawDate = $(el).find(".date").text().trim();
    const date = rawDate.replace(/[年月]/g, "-").replace("日", "").trim();
    const artist = $(el).find(".name").text().trim();
    const time = $(el).find(".time").text().trim();

    events.push({
      rawDate,
      date,
      time: time || "要確認",
      venue: "ブルーノート東京",
      category: "ライブ",
      title: artist
    });
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
    const rawDate = $(el).find(".eventDate").text().trim();
    const date = rawDate.split("（")[0].trim();
    const title = $(el).find(".eventTitle").text().trim();
    const time = $(el).find(".eventTime").text().trim();

    events.push({
      rawDate,
      date,
      time: time || "要確認",
      venue: "東京国際フォーラム",
      category: "イベント",
      title
    });
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
    res.json({ status: "ok", date: new Date().toISOString(), count: events.length, debug: true, events });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
