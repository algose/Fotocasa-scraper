const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote"
    ]
  });

  const page = await browser.newPage();
  await page.goto("https://www.fotocasa.es/es/alquiler/local/las-palmas-de-gran-canaria/todas-las-zonas/l", {
    waitUntil: "domcontentloaded"
  });

  const results = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("article.re-Card"));
    return cards.map(card => {
      const title = card.querySelector("h2")?.innerText || "Sans titre";
      const link = "https://www.fotocasa.es" + (card.querySelector("a")?.getAttribute("href") || "");
      const price = card.querySelector(".re-CardPrice")?.innerText?.replace(/[^\d]/g, "") || "0";
      const surface = card.querySelector(".re-CardFeatures")?.innerText?.match(/(\d+)\s?m²/)?.[1] || "0";
      return { title, link, price, surface };
    });
  });

  console.log("Résultats :", results);
  await browser.close();
})();
