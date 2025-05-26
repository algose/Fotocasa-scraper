const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

// Ton webhook Google Apps Script ici :
const WEBHOOK_URL = "https://www.tucasa.com/alquiler/locales-comerciales/las-palmas/?r=&idz=0035&p1=200&p2=1200";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  await page.goto("https://www.fotocasa.es/es/alquiler/local/las-palmas-de-gran-canaria/todas-las-zonas/l", {
    waitUntil: "domcontentloaded"
  });

  const listings = await page.evaluate(() => {
    const articles = document.querySelectorAll("article.re-Card");
    const now = new Date().toLocaleDateString("es-ES");

    return Array.from(articles).map(card => {
      const surfaceText = card.querySelector(".re-CardFeaturesWithIcons-feature-text")?.innerText || "";
      const surface = parseInt(surfaceText.replace(/\D/g, "")) || 0;
      const priceText = card.querySelector(".re-CardPrice")?.innerText || "";
      const price = parseInt(priceText.replace(/[^\d]/g, "")) || 0;
      const address = card.querySelector(".re-Card-title")?.innerText || "Non précisé";
      const link = "https://www.fotocasa.es" + (card.querySelector("a")?.getAttribute("href") || "");

      const score = surface && price ? Math.round((surface / price) * 1000) : 0;

      return {
        ville: "Las Palmas",
        surface,
        prix: price,
        adresse: address,
        lien: link,
        source: "fotocasa",
        date: now,
        status: "",
        score,
        mémoire: "" // sera géré par Apps Script ou feuille tampon
      };
    });
  });

  console.log(`Envoi de ${listings.length} résultats à Google Sheets...`);

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listings)
  });

  console.log("Réponse Webhook :", await res.text());
  await browser.close();
})();
