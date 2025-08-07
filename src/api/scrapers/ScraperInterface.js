/**
 * Base interface that all scrapers must implement
 */
class ScraperInterface {
  constructor() {
    if (new.target === ScraperInterface) {
      throw new TypeError("Cannot construct ScraperInterface instances directly");
    }
  }

  /**
   * Extract text content from a URL
   * @param {string} url - The URL to scrape
   * @param {object} options - Additional options for scraping
   * @returns {Promise<{success: boolean, text: string, metadata: object, error?: string}>}
   */
  async extractText(url, options = {}) {
    throw new Error("extractText method must be implemented");
  }

  /**
   * Check if the scraper dependencies are available
   * @returns {boolean} - True if scraper can be used
   */
  isAvailable() {
    throw new Error("isAvailable method must be implemented");
  }

  /**
   * Get the display name of the scraper
   * @returns {string} - Human readable name
   */
  getName() {
    throw new Error("getName method must be implemented");
  }

  /**
   * Get the description of the scraper
   * @returns {string} - Description of scraper capabilities
   */
  getDescription() {
    throw new Error("getDescription method must be implemented");
  }

  /**
   * Get the scraper type (free/paid/self-hosted)
   * @returns {string} - Scraper type
   */
  getType() {
    throw new Error("getType method must be implemented");
  }
}

module.exports = ScraperInterface;
