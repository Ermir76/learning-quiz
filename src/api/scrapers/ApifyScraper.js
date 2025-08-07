const ScraperInterface = require('./ScraperInterface');

class ApifyScraper extends ScraperInterface {
  constructor() {
    super();
  }

  async extractText(url, options = {}) {
    const startTime = Date.now();

    try {
      const apiToken = process.env.APIFY_API_TOKEN;
      if (!apiToken) {
        throw new Error("Server configuration error: Apify API token not found.");
      }

      const actorId = 'apify/website-content-crawler';
      const encodedActorId = encodeURIComponent(actorId);
      const runUrl = `https://api.apify.com/v2/acts/${encodedActorId}/runs?token=${apiToken}`;

      const runInput = {
        startUrls: [{ url: url }],
        maxCrawlDepth: 0, // Only crawl the specified URL
        saveHtml: false, // We only need the text
      };

      // Start the actor run
      const runResponse = await fetch(runUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runInput),
      });

      if (!runResponse.ok) {
        const errorBody = await runResponse.text();
        console.error("Apify API Error (starting run):", errorBody);
        throw new Error(`Apify API call failed with status ${runResponse.status}`);
      }

      const runData = await runResponse.json();
      const { id: runId, status: initialStatus, defaultDatasetId } = runData.data;

      // Wait for the run to finish
      let status = initialStatus;
      const statusUrl = `https://api.apify.com/v2/acts/${encodedActorId}/runs/${runId}?token=${apiToken}`;
      const timeout = options.timeout || 90000; // 90 seconds default for Apify (more than other scrapers)
      const startWait = Date.now();

      while (status !== 'SUCCEEDED' && status !== 'FAILED') {
        if (Date.now() - startWait > timeout) {
          throw new Error('Apify scraping timeout exceeded');
        }

        await this._sleep(2000); // Poll every 2 seconds
        const statusResponse = await fetch(statusUrl);
        const statusData = await statusResponse.json();
        
        if (!statusData.data || typeof statusData.data.status === 'undefined') {
          console.error("Unexpected Apify status response:", statusData);
          throw new Error("Apify status API returned an unexpected response format.");
        }
        status = statusData.data.status;
      }

      if (status === 'FAILED') {
        throw new Error(`Apify actor run failed. Run ID: ${runId}`);
      }

      // Fetch the results from the dataset
      const datasetUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apiToken}`;
      const datasetResponse = await fetch(datasetUrl);
      const datasetItems = await datasetResponse.json();

      if (!datasetItems || datasetItems.length === 0 || !datasetItems[0].text) {
        throw new Error("Could not extract any text content from the URL using Apify.");
      }

      // Concatenate text from all results (though there should only be one)
      const textContent = datasetItems.map(item => item.text).join('\n\n');

      if (textContent.trim().length < 50) {
        throw new Error("Could not extract sufficient text content from the URL.");
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        text: textContent,
        metadata: {
          scraper: 'apify',
          url: url,
          timestamp: new Date().toISOString(),
          processingTime: processingTime,
          textLength: textContent.length,
          runId: runId
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        text: '',
        metadata: {
          scraper: 'apify',
          url: url,
          timestamp: new Date().toISOString(),
          processingTime: processingTime
        },
        error: error.message
      };
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isAvailable() {
    return !!process.env.APIFY_API_TOKEN;
  }

  getName() {
    return 'Apify';
  }

  getDescription() {
    return 'Cloud-based web scraping service. Reliable and handles complex websites, but requires API token and costs money per use.';
  }

  getType() {
    return 'paid-api';
  }
}

module.exports = ApifyScraper;
