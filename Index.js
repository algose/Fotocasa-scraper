const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.fotocasa.es/es/alquiler/locales/comercial/las-palmas-de-gran-canaria/todas-las-zonas/l");

  const listings = await page.evaluate(() => {
    const articles = document.querySelectorAll("article.re-Card");
    return Array.from(articles).map(article => ({
      title: article.querySelector("h2")?.innerText || "",
      price: article.querySelector(".re-CardPrice")?.innerText || "",
      link: article.querySelector("a")?.href || "",
    }));
  });

  console.log(JSON.stringify(listings, null, 2));

  await browser.close();
})();
