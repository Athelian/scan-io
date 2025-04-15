// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from "crawlee";

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
  // Use the requestHandler to process each of the crawled pages.
  async requestHandler({ request, page, log, pushData }) {
    const offers = page.locator('[id^="aod-price-"]');
    const count = await offers.count();

    log.info(`Found ${count} offers on ${request.url}`);
    log.info(page.url());

    const isCaptcha = await page.$("input#captchacharacters");
    if (isCaptcha) {
      throw new Error("Captcha detected");
    }

    const seenIds = new Set();
    const prices = [];

    for (let i = 0; i < count; i++) {
      const offer = offers.nth(i);
      const id = await offer.getAttribute("id");

      const match = id?.match(/^aod-price-(\d+)$/);
      if (!match) continue;

      const idNum = match[1];
      if (seenIds.has(idNum)) continue;

      seenIds.add(idNum);

      const text = await offer.innerText();
      const priceMatch = text.match(/£\d+\.\d{2}/);
      if (priceMatch) {
        prices.push(priceMatch[0]);
      }
    }

    pushData({
      url: request.url,
      title: await page.title(),
      prices
    });
  }
});

// Add first URL to the queue and start the crawl.
await crawler.run([
  // "https://amzn.eu/d/6pXprpd?aod=1",
  "https://amzn.eu/d/gA0gBZC?aod=1",
  "https://amzn.eu/d/9KvWllb?aod=1"
]);
