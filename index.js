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

// 例: 6/2 の形式に変換
function formatDateMD(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

async function getTokyoDomeEvents() {
  const url = "https://www.tokyo-dome.co.jp/dome/event/schedule.html";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  const todayStr = formatDateMD(today);
  const tomorrowStr = formatDateMD(tomorrow);

  $(".event-schedule__item").each((i, el) => {
    let dateText = $(el).find(".event-schedule__date").text().trim().replace(/\s/g, "").replace(/[年月]/g, "/").replace("日", "");

    if (dateText === todayStr || dateText === tomorrowStr) {
      const title = $(el).find(".event-schedule__title").text().trim();
      const time = $(el).find(".event-schedule__time").text().trim();
      events.push({
        date: dateText,
        time: time || "要確認",
        venue: "東京ドーム",
        category: "イベント",
        title,
      });
    }
  });

  return events;
}

async function getBlueNoteEvents() {
  const url = "https://www.bluenote.co.jp/jp/artists/schedule/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  const todayStr = formatDateMD(today);
  const tomorrowStr = formatDateMD(tomorrow);

  $(".liveInfoList .list").each((i, el) => {
    let dateText = $(el).find(".date").text().trim().replace(/\s/g, "").replace(/[年月]/g, "/").replace("日", "");

    if (dateText === todayStr || dateText === tomorrowStr) {
      const artist = $(el).find(".name").text().trim();
      const time = $(el).find(".time").text().trim();
      events.push({
        date: dateText,
        time: time || "要確認",
        venue: "ブルーノート東京",
        category: "ライブ",
        title: artist,
      });
    }
  });

  return events;
}

async function getTokyoInternationalForumEvents() {
  const url = "https://www.t-i-forum.co.jp/visitors/event/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];

  const todayStr = formatDateMD(today);
  const tomorrowStr = formatDateMD(tomorrow);

  $(".eventList .eventItem").each((i, el) => {
    let dateText = $(el).find(".eventDate").text().trim().split("（")[0].replace(/[年月]/g, "/").replace("日", "").replace(/\s/g, "");

    if (dateText === todayStr || dateText === tomorrowStr) {
      const title = $(el).find(".eventTitle").text().trim();
      const time = $(el).find(".eventTime").text().trim();
      events.push({
        date: dateText,
        time: time || "要確認",
        venue: "東京国際フォーラム",
        category: "イベント",
        title,
      });
    }
  });

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
    res.json({ status: "ok", date: new Date().toISOString(), events });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
