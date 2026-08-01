/**
 * HireGuard AI Content Script
 * Executes DOM extraction when requested by the extension popup or background worker.
 */
(() => {
  function getExtractedJobData() {
    const hostname = window.location.hostname;
    let data = null;

    if (hostname.includes('linkedin.com')) {
      data = typeof extractLinkedInJob === 'function' ? extractLinkedInJob() : null;
    } else if (hostname.includes('indeed.com')) {
      data = typeof extractIndeedJob === 'function' ? extractIndeedJob() : null;
    }

    if (!data || (!data.companyName && !data.jobTitle)) {
      data = typeof extractGenericJob === 'function' ? extractGenericJob() : null;
    }

    return data;
  }

  // Listen for extraction messages from background service worker or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_JOB_DETAILS') {
      const jobData = getExtractedJobData();
      sendResponse({ status: 'SUCCESS', data: jobData });
    }
    return true;
  });
})();
