
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors"); // CORS対応追加
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // すべての外部アクセスを許可

const TARGET_URL = "https://www.bushikaku.net/expedition/concert/shows/all/region-kanto/tokyo/";
const VENUES = [ "東京国際フォーラム", "日本武道館", "東京ビックサイト", "サントリーホール", "NHKホール" ]; // テスト用

app.get("/events", async (req, res) => {
  try {
    const response = await axios.get(TARGET_URL);
    const $ = cheerio.load(response.data);
    const result = [];

    $(".live-schedule-item").each((i, el) => {
      const time = $(el).find(".time").text().trim();
      const venue = $(el).find(".venue").text().trim();
      const category = $(el).find(".category").text().trim();
      const title = $(el).find(".title").text().trim();

      if (VENUES.includes(venue)) {
        let start = "", end = null;
        if (time.includes("～")) {
          const parts = time.split("～");
          start = parts[0];
          if (parts[1]) end = parts[1];
        } else {
          start = time;
        }
        result.push({ venue, category, title, start, end });
      }
    });

    res.json({ status: "ok", date: new Date().toISOString(), events: result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
