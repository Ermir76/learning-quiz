const PuppeteerScraper = require('./PuppeteerScraper');
const PlaywrightScraper = require('./PlaywrightScraper');
const ApifyScraper = require('./ApifyScraper');

class ScraperFactory {
  constructor() {
    this.scrapers = new Map();
    this.initializeScrapers();
  }

  initializeScrapers() {
    // Register all available scrapers
    this.scrapers.set('puppeteer', new PuppeteerScraper());
    this.scrapers.set('playwright', new PlaywrightScraper());
    this.scrapers.set('apify', new ApifyScraper());
  }

  /**
   * Get all available scrapers with their availability status
   * @returns {Array} Array of scraper info objects
   */
  getAvailableScrapers() {
    const scraperList = [];
    
    for (const [key, scraper] of this.scrapers) {
      scraperList.push({
        id: key,
        name: scraper.getName(),
        description: scraper.getDescription(),
        type: scraper.getType(),
        available: scraper.isAvailable()
      });
    }

    return scraperList;
  }

  /**
   * Get a specific scraper by ID
   * @param {string} scraperId - The ID of the scraper to get
   * @returns {ScraperInterface} The scraper instance
   */
  getScraper(scraperId) {
    const scraper = this.scrapers.get(scraperId);
    if (!scraper) {
      throw new Error(`Unknown scraper: ${scraperId}`);
    }
    
    if (!scraper.isAvailable()) {
      throw new Error(`Scraper ${scraperId} is not available. Check dependencies and configuration.`);
    }
    
    return scraper;
  }

  /**
   * Get the first available scraper from a preference list
   * @param {Array<string>} preferences - Array of scraper IDs in order of preference
   * @returns {ScraperInterface} The first available scraper
   */
  getPreferredScraper(preferences = ['puppeteer', 'playwright', 'apify']) {
    for (const scraperId of preferences) {
      const scraper = this.scrapers.get(scraperId);
      if (scraper && scraper.isAvailable()) {
        return scraper;
      }
    }
    
    throw new Error('No scrapers are available. Please install puppeteer/playwright or configure Apify API token.');
  }

  /**
   * Extract text using a specific scraper with fallback support
   * @param {string} url - The URL to scrape
   * @param {object} options - Scraping options
   * @param {string} options.primaryScraper - Primary scraper to use
   * @param {string} options.fallbackScraper - Fallback scraper if primary fails
   * @param {number} options.timeout - Timeout in milliseconds
   * @returns {Promise<{success: boolean, text: string, metadata: object, error?: string}>}
   */
  async extractText(url, options = {}) {
    const { 
      primaryScraper = 'puppeteer', 
      fallbackScraper = 'apify',
      timeout = 30000 
    } = options;

    // Try primary scraper first
    try {
      const scraper = this.getScraper(primaryScraper);
      console.log(`Attempting to scrape with ${scraper.getName()}...`);
      
      const result = await scraper.extractText(url, { timeout });
      
      if (result.success) {
        console.log(`Successfully scraped with ${scraper.getName()}`);
        return result;
      } else {
        console.log(`Primary scraper ${scraper.getName()} failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`Primary scraper ${primaryScraper} failed: ${error.message}`);
    }

    // Try fallback scraper if primary failed
    if (fallbackScraper && fallbackScraper !== primaryScraper) {
      try {
        const fallbackScraperInstance = this.getScraper(fallbackScraper);
        console.log(`Attempting fallback scraping with ${fallbackScraperInstance.getName()}...`);
        
        const result = await fallbackScraperInstance.extractText(url, { timeout });
        
        if (result.success) {
          console.log(`Successfully scraped with fallback ${fallbackScraperInstance.getName()}`);
          return result;
        } else {
          console.log(`Fallback scraper ${fallbackScraperInstance.getName()} failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`Fallback scraper ${fallbackScraper} failed: ${error.message}`);
      }
    }

    // If both scrapers failed, return error
    return {
      success: false,
      text: '',
      metadata: {
        url: url,
        timestamp: new Date().toISOString(),
        attemptedScrapers: [primaryScraper, fallbackScraper].filter(Boolean)
      },
      error: 'All available scrapers failed to extract content from the URL'
    };
  }

  /**
   * Test all scrapers against a URL
   * @param {string} url - Test URL
   * @returns {Promise<Array>} Results from all scrapers
   */
  async testAllScrapers(url) {
    const results = [];
    
    for (const [scraperId, scraper] of this.scrapers) {
      if (!scraper.isAvailable()) {
        results.push({
          scraper: scraperId,
          available: false,
          error: 'Scraper not available'
        });
        continue;
      }

      try {
        const result = await scraper.extractText(url, { timeout: 15000 });
        results.push({
          scraper: scraperId,
          available: true,
          success: result.success,
          textLength: result.text ? result.text.length : 0,
          processingTime: result.metadata.processingTime,
          error: result.error
        });
      } catch (error) {
        results.push({
          scraper: scraperId,
          available: true,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

// Export singleton instance
module.exports = new ScraperFactory();
