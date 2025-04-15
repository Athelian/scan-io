// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from "crawlee";

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
  // Use the requestHandler to process each of the crawled pages.
  async requestHandler({ request, page, log, pushData }) {
    const offers = page.locator("#aod-offer");
    log.info(`Found ${await offers.count()} offers on ${request.url}`);

    log.info(page.url());

    const innerTexts = await (
      await offers.allInnerTexts()
    ).map((t) => t.match(/£\d+\.\d{2}/));

    const isCaptcha = await page.$("input#captchacharacters");
    if (isCaptcha) {
      throw new Error("Captcha detected");
    }

    pushData({
      url: request.url,
      title: await page.title(),
      offers: innerTexts.filter((t) => t !== null)
    });
  },
  requestHandlerTimeoutSecs: 60
});

// Add first URL to the queue and start the crawl.
await crawler.run([
  // "https://amzn.eu/d/6pXprpd?aod=1",
  "https://amzn.eu/d/9KvWllb?aod=1"
]);
