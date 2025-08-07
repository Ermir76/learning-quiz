const ScraperInterface = require('./ScraperInterface');

class PuppeteerScraper extends ScraperInterface {
  constructor() {
    super();
    this.puppeteer = null;
  }

  async _initPuppeteer() {
    if (!this.puppeteer) {
      try {
        this.puppeteer = require('puppeteer');
      } catch (error) {
        throw new Error('Puppeteer is not installed. Run: npm install puppeteer');
      }
    }
    return this.puppeteer;
  }

  async extractText(url, options = {}) {
    const startTime = Date.now();
    let browser = null;

    try {
      const puppeteer = await this._initPuppeteer();
      
      // Launch browser with optimized settings
      browser = await puppeteer.launch({
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

      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1280, height: 720 });

      // Set timeout from options or default
      const timeout = options.timeout || 30000;
      page.setDefaultTimeout(timeout);

      // Navigate to URL
      await page.goto(url, { 
        waitUntil: 'networkidle2',
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
          scraper: 'puppeteer',
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
          scraper: 'puppeteer',
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
      require('puppeteer');
      return true;
    } catch (error) {
      return false;
    }
  }

  getName() {
    return 'Puppeteer';
  }

  getDescription() {
    return 'Full browser automation with JavaScript support. Handles dynamic content, SPAs, and complex websites.';
  }

  getType() {
    return 'self-hosted';
  }
}

module.exports = PuppeteerScraper;
