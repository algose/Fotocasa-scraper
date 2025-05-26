const puppeteer = require("puppeteer");
const axios = require("axios");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("https://www.fotocasa.es/es/alquiler/locales-comerciales/las-palmas-de-gran-canaria/todas-las-zonas/l");

  const listings = await page.evaluate(() => {
    const articles = document.querySelectorAll(".re-CardPackPremium, .re-CardPackRegular");
    const results = [];

    articles.forEach(article => {
      const ville = "Las Palmas";

      const surfaceMatch = article.textContent.match(/(\d{2,4})\s?m²/);
      const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : "";

      const prixMatch = article.textContent.match(/(\d{2,5})\s?€/);
      const prix = prixMatch ? parseInt(prixMatch[1]) : "";

      const adresse = article.querySelector(".re-Card-header h2")?.innerText || "";
      const lien = "https://www.fotocasa.es" + (article.querySelector("a")?.getAttribute("href") || "");

      const date = new Date().toLocaleDateString("es-ES");

      // SCORE personnalisé
      let score = 0;
      if (surface) score += surface * 0.7;
      if (prix) score += (1000 - prix) * 1.2;

      const status = "";
      const memoire = "";

      if (prix && surface && adresse && lien) {
        results.push({
          ville,
          surface,
          prix,
          adresse,
          lien,
          source: "fotocasa",
          date,
          status,
          score: Math.round(score),
          memoire
        });
      }
    });

    return results;
  });

  await browser.close();

  // Envoi à Google Apps Script
  try {
    await axios.post("https://SCRIPT_GOOGLE_APPS_URL", listings, {
      headers: { "Content-Type": "application/json" }
    });
    console.log("Données envoyées avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error.message);
  }
})();
