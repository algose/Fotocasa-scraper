const puppeteer = require("puppeteer");

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
  await page.goto("https://www.fotocasa.es/es/alquiler/local/las-palmas-de-gran-canaria/todas-las-zonas/l");

  const listings = await page.evaluate(() => {
    const articles = document.querySelectorAll("article.re-Card");
    const data = [];

    articles.forEach(article => {
      const surfaceText = article.querySelector(".re-CardFeaturesWithIcons-feature-text")?.innerText || "";
      const surface = parseInt(surfaceText.replace(/\D/g, ""));
      const priceText = article.querySelector(".re-CardPrice")?.innerText || "";
      const price = parseInt(priceText.replace(/[^\d]/g, ""));
      const address = article.querySelector(".re-Card-title")?.innerText || "";
      const linkSuffix = article.querySelector("a")?.getAttribute("href") || "";
      const link = "https://www.fotocasa.es" + linkSuffix;
      const date = new Date().toLocaleDateString("es-ES");

      if (price && link) {
        data.push({
          ville: "Las Palmas",
          surface,
          prix: price,
          adresse: address,
          lien: link,
          source: "fotocasa",
          date
        });
      }
    });

    return data;
  });

  console.log(JSON.stringify(listings, null, 2));
  await browser.close();
})();
