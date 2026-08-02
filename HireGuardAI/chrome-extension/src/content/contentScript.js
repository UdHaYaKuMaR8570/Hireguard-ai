/**
 * HireGuard AI Content Script
 * Executes DOM extraction on page load AND on SPA navigation (LinkedIn/Indeed use client-side routing).
 * Sends extracted data proactively to background.js via chrome.runtime.sendMessage.
 * Also responds to on-demand EXTRACT_JOB_DETAILS requests from popup.js.
 */
(() => {
  const LOG_PREFIX = '[HireGuard Content]';
  let lastExtractedUrl = '';
  let extractionAttemptCount = 0;

  /**
   * Core extraction dispatcher — calls the correct platform extractor
   * and falls back to generic if needed.
   */
  function getExtractedJobData() {
    const hostname = window.location.hostname;
    let data = null;

    if (hostname.includes('linkedin.com')) {
      data = typeof extractLinkedInJob === 'function' ? extractLinkedInJob() : null;
      if (!data) console.warn(`${LOG_PREFIX} LinkedIn extractor returned null on ${window.location.href}`);
    } else if (hostname.includes('indeed.com')) {
      data = typeof extractIndeedJob === 'function' ? extractIndeedJob() : null;
      if (!data) console.warn(`${LOG_PREFIX} Indeed extractor returned null on ${window.location.href}`);
    }

    // Fallback to generic extractor if platform-specific one failed
    if (!data || (!data.companyName && !data.jobTitle)) {
      data = typeof extractGenericJob === 'function' ? extractGenericJob() : null;
      if (data) console.log(`${LOG_PREFIX} Used generic fallback extractor`);
    }

    return data;
  }

  /**
   * Attempt extraction and push results to background.js for caching.
   * Retries up to 3 times with delays to handle late-rendering DOM content.
   */
  function attemptExtractionAndPush(retryCount = 0) {
    const currentUrl = window.location.href;
    const maxRetries = 3;
    const retryDelayMs = 1500;

    console.log(`${LOG_PREFIX} Extraction attempt ${retryCount + 1}/${maxRetries + 1} on: ${currentUrl}`);

    const jobData = getExtractedJobData();

    if (jobData && (jobData.companyName || jobData.jobTitle)) {
      lastExtractedUrl = currentUrl;
      extractionAttemptCount = 0;
      console.log(`${LOG_PREFIX} ✅ Extraction SUCCESS — Company: "${jobData.companyName}", Title: "${jobData.jobTitle}"`);

      // Push to background for caching in chrome.storage.local
      chrome.runtime.sendMessage({
        action: 'JOB_DATA_EXTRACTED',
        data: jobData,
        tabUrl: currentUrl
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn(`${LOG_PREFIX} Failed to send to background:`, chrome.runtime.lastError.message);
        } else {
          console.log(`${LOG_PREFIX} Data pushed to background successfully`);
        }
      });
    } else if (retryCount < maxRetries) {
      console.log(`${LOG_PREFIX} Extraction found nothing, retrying in ${retryDelayMs}ms...`);
      setTimeout(() => attemptExtractionAndPush(retryCount + 1), retryDelayMs);
    } else {
      console.warn(`${LOG_PREFIX} ❌ Extraction FAILED after ${maxRetries + 1} attempts on: ${currentUrl}`);
      lastExtractedUrl = currentUrl; // Mark as attempted so we don't loop forever
    }
  }

  /**
   * SPA Navigation Detection via URL polling.
   * LinkedIn and Indeed use client-side routing — page loads don't fire,
   * so we poll location.href every 2 seconds to catch navigation.
   */
  let lastPolledUrl = window.location.href;

  function startUrlPolling() {
    setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastPolledUrl) {
        console.log(`${LOG_PREFIX} 🔄 SPA navigation detected: ${lastPolledUrl} → ${currentUrl}`);
        lastPolledUrl = currentUrl;

        // Wait a beat for the new page content to render before extracting
        setTimeout(() => attemptExtractionAndPush(0), 1500);
      }
    }, 2000);
  }

  // Listen for on-demand extraction messages from popup.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_JOB_DETAILS') {
      console.log(`${LOG_PREFIX} On-demand extraction requested by popup`);
      const jobData = getExtractedJobData();

      if (jobData && (jobData.companyName || jobData.jobTitle)) {
        console.log(`${LOG_PREFIX} ✅ On-demand extraction SUCCESS`);
        sendResponse({ status: 'SUCCESS', data: jobData });
      } else {
        // Retry once after a short delay for late-rendering pages
        setTimeout(() => {
          const retryData = getExtractedJobData();
          console.log(`${LOG_PREFIX} On-demand retry result:`, retryData ? 'found data' : 'still empty');
          sendResponse({ status: 'SUCCESS', data: retryData });
        }, 1000);
      }
      return true; // Keep message channel open for async sendResponse
    }
  });

  // === INITIALIZATION ===
  console.log(`${LOG_PREFIX} 🚀 Content script injected on: ${window.location.href}`);

  // Run initial extraction after a short delay to let DOM settle
  setTimeout(() => attemptExtractionAndPush(0), 1000);

  // Start SPA navigation polling
  startUrlPolling();
})();
