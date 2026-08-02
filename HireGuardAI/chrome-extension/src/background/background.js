/**
 * HireGuard AI Service Worker (Background Script)
 * Orchestrates message passing between Content Scripts, Extension Popup, and Spring Boot Backend REST API (http://localhost:8080).
 * Caches extracted job data in chrome.storage.local for instant popup access.
 */
const API_BASE_URL = 'http://localhost:8080';

// Handle incoming messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // Content script proactively pushes extracted job data — cache it
  if (message.action === 'JOB_DATA_EXTRACTED') {
    console.log(`[HireGuard Background] 📥 Received extracted job data from content script:`, message.data?.companyName);
    const cachePayload = {
      jobData: message.data,
      tabUrl: message.tabUrl,
      cachedAt: Date.now()
    };
    chrome.storage.local.set({ hireguard_job_cache: cachePayload }, () => {
      console.log(`[HireGuard Background] 💾 Cached job data for: "${message.data?.companyName}" at ${message.tabUrl}`);
    });
    sendResponse({ status: 'CACHED' });
    return false;
  }

  // Popup requests cached data for fast-path rendering
  if (message.action === 'GET_CACHED_JOB_DATA') {
    chrome.storage.local.get('hireguard_job_cache', (result) => {
      const cached = result.hireguard_job_cache || null;
      console.log(`[HireGuard Background] 📤 Returning cached data:`, cached ? cached.jobData?.companyName : 'none');
      sendResponse({ status: 'SUCCESS', cached: cached });
    });
    return true; // Async
  }

  // Popup requests full company analysis (graph trust + AI scam detection)
  if (message.action === 'ANALYZE_COMPANY') {
    console.log(`[HireGuard Background] 🔍 Starting analysis for: "${message.companyName}"`);
    handleCompanyAnalysis(message.companyName, message.jobDescription)
      .then(response => {
        console.log(`[HireGuard Background] ✅ Analysis complete for: "${message.companyName}"`);
        sendResponse({ status: 'SUCCESS', data: response });
      })
      .catch(err => {
        console.error(`[HireGuard Background] ❌ Analysis failed:`, err.message);
        sendResponse({ status: 'ERROR', error: err.message });
      });
    return true; // Async response signal
  }
});

async function handleCompanyAnalysis(companyName, jobDescription) {
  if (!companyName || !companyName.trim()) {
    throw new Error('No company name provided for trust score verification.');
  }

  const cleanName = companyName.trim();
  console.log(`[HireGuard Background] Searching backend for company: "${cleanName}"`);

  // 1. Search existing company index in Spring Boot backend
  const searchUrl = `${API_BASE_URL}/api/company/search?name=${encodeURIComponent(cleanName)}`;
  const searchResp = await fetch(searchUrl);
  
  if (!searchResp.ok) {
    throw new Error(`Backend search failed with HTTP ${searchResp.status}`);
  }

  const companies = await searchResp.json();

  let targetCompany = null;
  if (Array.isArray(companies) && companies.length > 0) {
    targetCompany = companies[0];
  } else {
    // 2. If not found in index, onboard/verify company automatically via POST /api/company/verify
    console.log(`[HireGuard Background] Company "${cleanName}" not in index. Onboarding via POST /api/company/verify...`);
    const verifyUrl = `${API_BASE_URL}/api/company/verify`;
    const verifyResp = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: cleanName,
        website: `https://${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        recruiterEmail: `recruiter@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      })
    });

    if (!verifyResp.ok) {
      throw new Error(`Company onboarding failed with HTTP ${verifyResp.status}`);
    }

    targetCompany = await verifyResp.json();
  }

  // 3. Fetch latest Graph-Aware Trust Score from backend GET /api/company/{id}/trust-score
  const companyId = targetCompany.id;
  const trustUrl = `${API_BASE_URL}/api/company/${companyId}/trust-score`;
  const trustResp = await fetch(trustUrl);

  if (!trustResp.ok) {
    throw new Error(`Trust score request failed with HTTP ${trustResp.status}`);
  }

  const trustReport = await trustResp.json();

  // 4. Send to AI Job Description Service
  let aiReport = null;
  if (jobDescription && jobDescription.trim()) {
    try {
      console.log(`[HireGuard Background] Sending job description to AI Service...`);
      const aiUrl = `http://localhost:8001/predict`;
      const aiResp = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription,
          companyName: cleanName,
          recruiterEmail: `recruiter@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        })
      });
      
      if (aiResp.ok) {
        aiReport = await aiResp.json();
        console.log(`[HireGuard Background] ✅ AI Service response received`);
      } else {
        console.warn(`[HireGuard] AI Service failed with HTTP ${aiResp.status}`);
      }
    } catch (err) {
      console.error('[HireGuard] Failed to connect to AI Service', err);
    }
  }

  return {
    company: targetCompany,
    trustReport: trustReport,
    aiReport: aiReport
  };
}
