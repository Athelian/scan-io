// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from "crawlee";

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
  // Use the requestHandler to process each of the crawled pages.
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    const offers = page.locator("#aod-offer");
    log.info(`Found ${await offers.count()} offers on ${request.url}`);

    const innerTexts = await (
      await offers.allInnerTexts()
    ).map((t) => t.match(/£\d+\.\d{2}/));

    pushData({
      url: request.url,
      offers: innerTexts.filter((t) => t !== null)
    });
  },
  // Comment this option to scrape the full website.
  maxRequestsPerCrawl: 20,
  requestHandlerTimeoutSecs: 10
});

// Add first URL to the queue and start the crawl.
await crawler.run(["https://www.amazon.co.uk/dp/B0CGRMJF6C?aod=1"]);
