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

  // Popup requests full multi-verification company analysis
  if (message.action === 'ANALYZE_COMPANY') {
    console.log(`[HireGuard Background] 🔍 Starting multi-verification analysis for: "${message.companyName}"`);
    handleCompanyAnalysis(message.companyName, message.jobDescription, message.recruiterEmail)
      .then(response => {
        console.log(`[HireGuard Background] ✅ Multi-verification analysis complete for: "${message.companyName}"`);
        sendResponse({ status: 'SUCCESS', data: response });
      })
      .catch(err => {
        console.error(`[HireGuard Background] ❌ Analysis failed:`, err.message);
        sendResponse({ status: 'ERROR', error: err.message });
      });
    return true; // Async response signal
  }
});

async function handleCompanyAnalysis(companyName, jobDescription, recruiterEmail = null) {
  if (!companyName || !companyName.trim()) {
    throw new Error('No company name provided for trust score verification.');
  }

  const cleanName = companyName.trim();
  let domainBase = cleanName
    .replace(/\s+(in|at|for|india|usa|uk|global|technologies|solutions|services|pvt|ltd|limited|llc|inc|corp|corporation)\b.*$/i, '')
    .trim();
  if (!domainBase) domainBase = cleanName;
  const cleanDomain = domainBase.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  const cleanEmail = (recruiterEmail && recruiterEmail.trim().length > 0) ? recruiterEmail.trim() : null;

  console.log(`[HireGuard Background] Executing POST /api/verification/employer for: "${cleanName}" (Domain: ${cleanDomain}, Email: ${cleanEmail || 'none'})`);

  // 1. Invoke unified Multi-Verification Pipeline Endpoint
  try {
    const employerVerifyUrl = `${API_BASE_URL}/api/verification/employer`;
    const verifyResp = await fetch(employerVerifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: cleanName,
        domain: cleanDomain,
        recruiterEmail: cleanEmail,
        jobDescription: jobDescription || ''
      })
    });

    if (verifyResp.ok) {
      const pipelineReport = await verifyResp.json();
      console.log(`[HireGuard Background] ✅ Pipeline report received. Score: ${pipelineReport.trustScore}`);
      return {
        company: { name: cleanName, website: `https://${cleanDomain}` },
        trustReport: {
          trustScore: pipelineReport.trustScore,
          riskLevel: pipelineReport.riskLevel,
          reasons: pipelineReport.reasons,
          warnings: pipelineReport.warnings,
          signals: pipelineReport.signals,
          verification: pipelineReport.verification,
          graphRiskFactors: pipelineReport.verification?.graphRiskFactors || []
        },
        aiReport: pipelineReport.verification?.aiAnalysis || null
      };
    }
  } catch (pipelineErr) {
    console.warn(`[HireGuard Background] /api/verification/employer failed, falling back to company search:`, pipelineErr.message);
  }

  // 2. Fallback to existing search & trust-score route if unified endpoint fails
  const searchUrl = `${API_BASE_URL}/api/company/search?name=${encodeURIComponent(cleanName)}`;
  const searchResp = await fetch(searchUrl);
  if (!searchResp.ok) {
    throw new Error(`Backend search failed with HTTP ${searchResp.status}`);
  }

  const companies = await searchResp.json();
  let targetCompany = (Array.isArray(companies) && companies.length > 0) ? companies[0] : null;

  if (!targetCompany) {
    const verifyUrl = `${API_BASE_URL}/api/company/verify`;
    const verifyResp = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: cleanName,
        website: `https://${cleanDomain}`,
        recruiterEmail: cleanEmail
      })
    });
    if (!verifyResp.ok) throw new Error(`Company onboarding failed with HTTP ${verifyResp.status}`);
    targetCompany = await verifyResp.json();
  }

  const companyId = targetCompany.id;
  const trustUrl = `${API_BASE_URL}/api/company/${companyId}/trust-score`;
  const trustResp = await fetch(trustUrl);
  if (!trustResp.ok) throw new Error(`Trust score request failed with HTTP ${trustResp.status}`);

  const trustReport = await trustResp.json();
  return {
    company: targetCompany,
    trustReport: trustReport,
    aiReport: null
  };
}
