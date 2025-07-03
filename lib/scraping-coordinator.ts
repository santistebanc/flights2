import {
  FlightSearchParams,
  ScrapeResult,
  FlightScraper,
} from "../types/scraper";

export async function runAllScrapers(
  params: FlightSearchParams,
  scrapers: FlightScraper[]
): Promise<{
  results: ScrapeResult[];
  errors: { scraper: string; error: unknown }[];
}> {
  // Run all scrapers in parallel, capturing both results and errors
  const settled = await Promise.allSettled(
    scrapers.map((scraper) =>
      scraper.scrape(params).then(
        (result) => ({ result, scraper }),
        (error) => {
          throw { error, scraper };
        }
      )
    )
  );

  const results: ScrapeResult[] = [];
  const errors: { scraper: string; error: unknown }[] = [];

  for (const s of settled) {
    if (s.status === "fulfilled") {
      results.push(s.value.result);
    } else {
      // s.reason is { error, scraper }
      errors.push({
        scraper: s.reason.scraper.constructor.name,
        error: s.reason.error,
      });
    }
  }

  return { results, errors };
}
