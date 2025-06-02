
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

const venues = [
  "明治座", "Bunkamuraオーチャードホール", "浜離宮朝日ホール", "帝国劇場", "新国立劇場", "東京オペラシティ", "サントリーホール",
  "東京体育館", "日本武道館", "有明アリーナ", "東京ガーデンシアター", "LINE CUBE SHIBUYA", "神宮球場", "東京ドーム",
  "国立劇場", "国立演芸場", "国立能楽堂", "東京ビックサイト", "中野サンプラザホール", "代々木競技場", "歌舞伎座", "新橋演舞場",
  "秩父宮ラグビー場", "国立競技場", "NHKホール", "東京国際フォーラム", "両国国技館", "豊洲PIT", "日比谷公園大音楽堂",
  "IHIステージアラウンド東京", "Zepp羽田", "Zepp DiverCity", "なかのZERO", "東京會舘", "BlueNoteTokyo", "青山 月見ル君想フ",
  "かつしかシンフォニーヒルズ", "シアタークリエ", "Hakuju Hall", "トッパンホール", "南青山マンダラ", "EX THEATER ROPPONGI",
  "東京文化会館", "Club eX", "豊洲文化センター", "有明コロシアム", "後楽園ホール", "新木場1stリング", "ニューピアホール",
  "TOKYO DOME CITY HALL", "日本青年館ホール", "The Garden Hall", "昭和女子大学 人見記念講堂", "日本橋三井ホール",
  "大手町三井ホール", "ティアラこうとう", "文京シビックホール", "渋谷区文化総合ｾﾝﾀｰ大和田", "紀尾井ホール",
  "品川インターシティホール", "科学技術館サイエンスホール", "東京アクアティクスセンター", "東京芸術劇場",
  "鴬谷 東京キネマ倶楽部", "Billboard Live TOKYO", "大田区産業プラザPio", "すみだトリフォニーホール", "シアター1010",
  "目黒パーシモンホール", "北とぴあ", "きゅりあん 大ホール", "草月ホール", "BLUES ALLEY JAPAN"
];

function normalizeVenueName(name) {
  return name.replace(/\s/g, "").replace("オペラパレス", "新国立劇場").replace("大ホール", "");
}

app.get("/events", async (req, res) => {
  try {
    const url = "https://www.bushikaku.net/expedition/concert/shows/all/region-kanto/tokyo/";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const events = [];

    $(".show-card, .expedition-event-item").each((i, el) => {
      const title = $(el).find(".show-card-title, .expedition-event-title").text().trim();
      const category = $(el).find(".show-card-category, .expedition-event-label").text().trim();
      const rawVenue = $(el).find(".show-card-place, .expedition-event-place").text().trim();
      const date = $(el).find(".show-card-date, .expedition-event-date").text().trim();

      const normalized = normalizeVenueName(rawVenue);
      if (venues.some(v => normalized.includes(v.replace(/\s/g, "")))) {
        events.push({ title, category, venue: rawVenue, date });
      }
    });

    res.json({ status: "ok", date: new Date().toISOString(), events });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
