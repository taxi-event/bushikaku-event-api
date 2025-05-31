
const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

const TARGET_URL = "https://www.bushikaku.net/expedition/concert/shows/all/region-kanto/tokyo/";
const VENUES = [ "明治座", "Bunkamuraオーチャードホール", "浜離宮朝日ホール", "帝国劇場", "新国立劇場", "東京オペラシティ", "サントリーホール", "東京体育館", "日本武道館", "有明アリーナ", "東京ガーデンシアター", "LINE CUBE SHIBUYA", "神宮球場", "東京ドーム", "国立劇場　大劇場", "国立劇場　小劇場", "国立演芸場", "国立能楽堂", "東京ビックサイト", "中野サンプラザホール", "代々木競技場第一体育館", "代々木競技場第二体育館", "歌舞伎座", "新橋演舞場", "秩父宮ラグビー場", "国立競技場", "NHKホール", "東京国際フォーラム", "両国国技館", "豊洲PIT", "日比谷公園大音楽堂", "IHIステージアラウンド東京", "Zepp羽田", "Zepp DiverCity", "なかのZERO", "東京會舘", "BlueNoteTokyo", "青山 月見ル君想フ", "かつしかシンフォニーヒルズ", "シアタークリエ", "Hakuju Hall", "トッパンホール", "南青山マンダラ", "EX THEATER ROPPONGI", "東京文化会館", "Club eX(品川プリンス内）", "豊洲文化センター", "有明コロシアム", "後楽園ホール", "新木場1stリング", "ニューピアホール（竹芝）", "TOKYO DOME CITY HALL", "日本青年館ホール", "The Garden Hall", "昭和女子大学 人見記念講堂", "日本橋三井ホール", "大手町三井ホール", "ティアラこうとう", "文京シビックホール", "渋谷区文化総合ｾﾝﾀｰ大和田", "紀尾井ホール", "品川インターシティホール", "科学技術館サイエンスホール", "東京アクアティクスセンター", "東京芸術劇場", "鴬谷 東京キネマ倶楽部", "Billboard Live TOKYO", "大田区産業プラザPio", "すみだトリフォニーホール", "シアター1010", "目黒パーシモンホール", "北とぴあ", "きゅりあん 大ホール", "草月ホール", "BLUES ALLEY JAPAN" ];

app.get("/events", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(TARGET_URL, { waitUntil: "networkidle0" });

    const events = await page.evaluate((VENUES) => {
      const result = [];
      const items = document.querySelectorAll(".live-schedule-item");
      items.forEach(item => {
        const time = item.querySelector(".time")?.innerText.trim() || "";
        const venue = item.querySelector(".venue")?.innerText.trim() || "";
        const category = item.querySelector(".category")?.innerText.trim() || "";
        const title = item.querySelector(".title")?.innerText.trim() || "";

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
      return result;
    }, VENUES);

    await browser.close();
    res.json({ status: "ok", date: new Date().toISOString(), events });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
