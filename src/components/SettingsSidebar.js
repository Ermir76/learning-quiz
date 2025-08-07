import React, { useState, useEffect } from 'react';
import { XCircleIcon, ChevronDownIcon, ChevronRightIcon } from './Icons';

const SettingsSidebar = ({ show, onClose, settings, onUpdateSettings }) => {
  const [availableScrapers, setAvailableScrapers] = useState([]);
  const [scraperStatus, setScraperStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({
    scrapers: true,
    advanced: false
  });

  // Load available scrapers when sidebar opens
  useEffect(() => {
    if (show) {
      loadScraperInfo();
    }
  }, [show]);

  const loadScraperInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrapers/status');
      if (response.ok) {
        const data = await response.json();
        setAvailableScrapers(data.scrapers || []);
        setScraperStatus(data.status || {});
      }
    } catch (error) {
      console.error('Failed to load scraper info:', error);
    } finally {
      setLoading(false);
    }
  };

  const testScraper = async (scraperId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrapers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scraper: scraperId,
          url: 'https://example.com' 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setScraperStatus(prev => ({
          ...prev,
          [scraperId]: result
        }));
      }
    } catch (error) {
      console.error(`Failed to test ${scraperId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    onUpdateSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('quizAppSettings', JSON.stringify(newSettings));
  };

  const getScraperIcon = (scraper) => {
    if (!scraper.available) return '❌';
    if (scraperStatus[scraper.id]?.success) return '✅';
    if (scraperStatus[scraper.id]?.success === false) return '⚠️';
    return '🔄';
  };

  const getScraperTypeColor = (type) => {
    switch (type) {
      case 'self-hosted': return 'text-green-400';
      case 'paid-api': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
        show ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-slate-200">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XCircleIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
          
          {/* Scraper Settings */}
          <div>
            <button
              onClick={() => setExpanded(prev => ({ ...prev, scrapers: !prev.scrapers }))}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-slate-200">Web Scrapers</h3>
              {expanded.scrapers ? 
                <ChevronDownIcon className="w-5 h-5 text-slate-400" /> : 
                <ChevronRightIcon className="w-5 h-5 text-slate-400" />
              }
            </button>
            
            {expanded.scrapers && (
              <div className="mt-4 space-y-4">
                
                {/* Primary Scraper */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Scraper
                  </label>
                  <select
                    value={settings.primaryScraper || 'puppeteer'}
                    onChange={(e) => handleSettingChange('primaryScraper', e.target.value)}
                    className="w-full p-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                  >
                    {availableScrapers.filter(s => s.available).map(scraper => (
                      <option key={scraper.id} value={scraper.id}>
                        {scraper.name} ({scraper.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    First choice for web scraping
                  </p>
                </div>

                {/* Fallback Scraper */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fallback Scraper
                  </label>
                  <select
                    value={settings.fallbackScraper || 'apify'}
                    onChange={(e) => handleSettingChange('fallbackScraper', e.target.value)}
                    className="w-full p-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                  >
                    <option value="">None</option>
                    {availableScrapers.filter(s => s.available).map(scraper => (
                      <option key={scraper.id} value={scraper.id}>
                        {scraper.name} ({scraper.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Backup if primary scraper fails
                  </p>
                </div>

                {/* Scraper Status */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Scraper Status</h4>
                  <div className="space-y-2">
                    {availableScrapers.map(scraper => (
                      <div key={scraper.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getScraperIcon(scraper)}</span>
                            <span className="font-medium text-slate-200">{scraper.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getScraperTypeColor(scraper.type)}`}>
                              {scraper.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{scraper.description}</p>
                          {scraperStatus[scraper.id] && (
                            <p className="text-xs text-slate-500 mt-1">
                              Last test: {scraperStatus[scraper.id].processingTime}ms
                            </p>
                          )}
                        </div>
                        {scraper.available && (
                          <button
                            onClick={() => testScraper(scraper.id)}
                            disabled={loading}
                            className="ml-3 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
                          >
                            Test
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              onClick={() => setExpanded(prev => ({ ...prev, advanced: !prev.advanced }))}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-slate-200">Advanced</h3>
              {expanded.advanced ? 
                <ChevronDownIcon className="w-5 h-5 text-slate-400" /> : 
                <ChevronRightIcon className="w-5 h-5 text-slate-400" />
              }
            </button>
            
            {expanded.advanced && (
              <div className="mt-4 space-y-4">
                
                {/* Timeout Setting */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Scraper Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={(settings.scraperTimeout || 30000) / 1000}
                    onChange={(e) => handleSettingChange('scraperTimeout', parseInt(e.target.value) * 1000)}
                    className="w-full p-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    How long to wait before scraper times out
                  </p>
                </div>

                {/* Enable Fallback */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Enable Fallback</label>
                    <p className="text-xs text-slate-400">Automatically try backup scraper if primary fails</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableFallback !== false}
                    onChange={(e) => handleSettingChange('enableFallback', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              Settings are saved locally in your browser
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsSidebar;
