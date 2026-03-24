const fetch = require("node-fetch");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let history = [];

async function checkBTC() {
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const data = await r.json();

    // 🔥 NULL SAFE
    const price = data?.bitcoin?.usd;

    if (!price) {
      console.log("Fiyat alınamadı:", data);
      return;
    }

    const now = Date.now();

    history.push({ price, time: now });

    // 3 dk veri tut
    history = history.filter(x => now - x.time < 3 * 60 * 1000);

    let msg = null;

    // 1 dk
    const oneMin = history.find(x => now - x.time >= 60000);
    if (oneMin) {
      const diff = price - oneMin.price;

      if (Math.abs(diff) >= 50) {
        msg = `🚨 1DK ALARM\nFark: ${diff.toFixed(2)}$\nFiyat: ${price}`;
      }
    }

    // 2 dk
    const twoMin = history.find(x => now - x.time >= 120000);
    if (twoMin) {
      const diff = price - twoMin.price;

      if (Math.abs(diff) >= 100) {
        msg = `🚨 2DK ALARM\nFark: ${diff.toFixed(2)}$\nFiyat: ${price}`;
      }
    }

    if (msg) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: msg
        })
      });

      console.log("ALARM GÖNDERİLDİ:", msg);
    }

  } catch (err) {
    console.error("HATA:", err.message);
  }
}

// 🔥 HER 10 SN
setInterval(checkBTC, 10000);

console.log("BTC BOT BAŞLADI...");
