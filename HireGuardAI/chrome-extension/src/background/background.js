/**
 * HireGuard AI Service Worker (Background Script)
 * Orchestrates message passing between Content Scripts, Extension Popup, and Spring Boot Backend REST API (http://localhost:8080).
 */
const API_BASE_URL = 'http://localhost:8080';

// Handle incoming messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ANALYZE_COMPANY') {
    handleCompanyAnalysis(message.companyName)
      .then(response => sendResponse({ status: 'SUCCESS', data: response }))
      .catch(err => sendResponse({ status: 'ERROR', error: err.message }));
    return true; // Async response signal
  }
});

async function handleCompanyAnalysis(companyName) {
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
        website: `https://${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
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

  return {
    company: targetCompany,
    trustReport: trustReport
  };
}
