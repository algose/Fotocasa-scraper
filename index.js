const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://www.fotocasa.es/es/alquiler/local/las-palmas-de-gran-canaria/todas-las-zonas/l");

  const listings = await page.evaluate(() => {
    const articles = document.querySelectorAll("article.re-Card");

    return Array.from(articles).map(card => {
      const surface = card.innerText.match(/(\d{2,3})\s?m²/)?.[1] || "";
      const prix = card.innerText.match(/(\d{2,4})\s?€/)?.[1] || "";
      const adresse = card.querySelector("h2")?.innerText.trim() || "Non précisé";
      const lien = card.querySelector("a")?.href || "";
      return {
        ville: "Las Palmas",
        surface,
        prix,
        adresse,
        lien,
        source: "fotocasa",
        date: new Date().toLocaleDateString("fr-FR"),
      };
    });
  });

  fs.writeFileSync("results.json", JSON.stringify(listings, null, 2));
  await browser.close();
})();
