const ScraperInterface = require('./ScraperInterface');

class PlaywrightScraper extends ScraperInterface {
  constructor() {
    super();
    this.playwright = null;
  }

  async _initPlaywright() {
    if (!this.playwright) {
      try {
        this.playwright = require('playwright');
      } catch (error) {
        throw new Error('Playwright is not installed. Run: npm install playwright');
      }
    }
    return this.playwright;
  }

  async extractText(url, options = {}) {
    const startTime = Date.now();
    let browser = null;

    try {
      const { chromium } = await this._initPlaywright();
      
      // Launch browser with optimized settings
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1280, height: 720 }
      });

      const page = await context.newPage();

      // Set timeout from options or default
      const timeout = options.timeout || 30000;
      page.setDefaultTimeout(timeout);

      // Navigate to URL
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: timeout
      });

      // Wait a bit for dynamic content (use setTimeout instead of page.waitForTimeout)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract text content
      const text = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, header, footer');
        scripts.forEach(el => el.remove());

        // Get main content areas first
        const mainSelectors = ['main', '[role="main"]', '.main', '#main', '.content', '#content'];
        let mainContent = '';
        
        for (const selector of mainSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            mainContent = element.innerText;
            break;
          }
        }

        // If no main content found, get body text
        if (!mainContent) {
          mainContent = document.body.innerText;
        }

        return mainContent.trim();
      });

      const processingTime = Date.now() - startTime;

      if (!text || text.length < 50) {
        throw new Error('Could not extract sufficient text content from the URL');
      }

      return {
        success: true,
        text: text,
        metadata: {
          scraper: 'playwright',
          url: url,
          timestamp: new Date().toISOString(),
          processingTime: processingTime,
          textLength: text.length
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        text: '',
        metadata: {
          scraper: 'playwright',
          url: url,
          timestamp: new Date().toISOString(),
          processingTime: processingTime
        },
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  isAvailable() {
    try {
      require('playwright');
      return true;
    } catch (error) {
      return false;
    }
  }

  getName() {
    return 'Playwright';
  }

  getDescription() {
    return 'Fast and reliable browser automation. Better performance than Puppeteer with cross-browser support.';
  }

  getType() {
    return 'self-hosted';
  }
}

module.exports = PlaywrightScraper;
