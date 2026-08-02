/**
 * HireGuard AI Extension Popup Script
 * On open: checks chrome.storage.local cache first (fast path),
 * then falls back to on-demand content script extraction.
 * Shows debug extraction status indicator.
 */
document.addEventListener('DOMContentLoaded', () => {
  const stateLoading = document.getElementById('state-loading');
  const stateResult = document.getElementById('state-result');
  const stateEmpty = document.getElementById('state-empty');
  const errorBanner = document.getElementById('error-banner');
  const extractionStatus = document.getElementById('extraction-status');

  const scoreValue = document.getElementById('score-value');
  const scoreCircle = document.getElementById('score-circle');
  const companyNameEl = document.getElementById('company-name');
  const jobTitleEl = document.getElementById('job-title');
  const riskBadge = document.getElementById('risk-badge');
  const reasonsList = document.getElementById('reasons-list');
  const graphList = document.getElementById('graph-list');

  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  // Trigger initial scan
  initScan();

  searchBtn.addEventListener('click', () => {
    const name = searchInput.value.trim();
    if (name) {
      analyzeCompany(name, 'Manual Verification Lookup');
    }
  });

  // Allow Enter key on search input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = searchInput.value.trim();
      if (name) analyzeCompany(name, 'Manual Verification Lookup');
    }
  });

  function setExtractionStatus(text) {
    if (extractionStatus) extractionStatus.textContent = text;
  }

  async function initScan() {
    showState('loading');
    hideError();
    setExtractionStatus('🔄 Checking for cached job data...');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        setExtractionStatus('❌ No active tab found');
        showState('empty');
        return;
      }

      const currentTabUrl = tab.url || '';
      console.log('[HireGuard Popup] Current tab URL:', currentTabUrl);

      // FAST PATH: Check chrome.storage.local cache first
      chrome.runtime.sendMessage({ action: 'GET_CACHED_JOB_DATA' }, (cacheResponse) => {
        if (chrome.runtime.lastError) {
          console.warn('[HireGuard Popup] Cache fetch error:', chrome.runtime.lastError.message);
          // Fall through to on-demand extraction
          attemptOnDemandExtraction(tab);
          return;
        }

        const cached = cacheResponse?.cached;
        if (cached && cached.jobData && cached.jobData.companyName) {
          // Check if cached data is for the current tab's URL (or very recent)
          const cacheAge = Date.now() - (cached.cachedAt || 0);
          const isRelevant = cached.tabUrl === currentTabUrl || cacheAge < 10000; // within 10 seconds

          if (isRelevant) {
            const jd = cached.jobData;
            console.log(`[HireGuard Popup] ✅ Using cached data: "${jd.companyName}" / "${jd.jobTitle}"`);
            setExtractionStatus(`✅ Auto-detected: ${jd.companyName} (cached)`);
            analyzeCompany(jd.companyName, jd.jobTitle || 'Detected Position', jd.jobDescription);
            return;
          }
        }

        // Cache miss or stale — try on-demand extraction from content script
        console.log('[HireGuard Popup] Cache miss, attempting on-demand extraction...');
        setExtractionStatus('🔄 Extracting from page DOM...');
        attemptOnDemandExtraction(tab);
      });
    } catch (err) {
      console.error('[HireGuard Popup] Scan init error:', err);
      setExtractionStatus(`❌ Error: ${err.message}`);
      showState('empty');
    }
  }

  function attemptOnDemandExtraction(tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB_DETAILS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[HireGuard Popup] Content script not reachable:', chrome.runtime.lastError.message);
        setExtractionStatus('⚠ Content script not loaded — try refreshing the page');
        showState('empty');
        return;
      }

      if (response && response.data && (response.data.companyName || response.data.jobTitle)) {
        const jobData = response.data;
        console.log(`[HireGuard Popup] ✅ On-demand extraction: "${jobData.companyName}" / "${jobData.jobTitle}"`);
        setExtractionStatus(`✅ Auto-detected: ${jobData.companyName}`);
        analyzeCompany(jobData.companyName, jobData.jobTitle || 'Detected Position', jobData.jobDescription);
      } else {
        console.log('[HireGuard Popup] On-demand extraction returned empty');
        setExtractionStatus('⚠ No job posting data found on this page');
        showState('empty');
      }
    });
  }

  async function analyzeCompany(companyName, jobTitle, jobDescription = null) {
    showState('loading');
    hideError();
    setExtractionStatus(`🔄 Analyzing: ${companyName}...`);

    try {
      chrome.runtime.sendMessage(
        { action: 'ANALYZE_COMPANY', companyName, jobDescription },
        (response) => {
          if (chrome.runtime.lastError) {
            showError(`Connection error: ${chrome.runtime.lastError.message}`);
            setExtractionStatus('❌ Backend connection failed');
            showState('empty');
            return;
          }

          if (response && response.status === 'SUCCESS' && response.data) {
            setExtractionStatus(`✅ Analysis complete for: ${companyName}`);
            renderResults(companyName, jobTitle, response.data.trustReport, response.data.aiReport);
          } else {
            showError(response?.error || 'Failed to retrieve trust score from backend.');
            setExtractionStatus('❌ Analysis failed');
            showState('empty');
          }
        }
      );
    } catch (err) {
      showError(err.message || 'Network request failed.');
      setExtractionStatus('❌ Network error');
      showState('empty');
    }
  }

  function renderResults(companyName, jobTitle, report, aiReport) {
    showState('result');

    companyNameEl.textContent = companyName;
    jobTitleEl.textContent = jobTitle || 'Verified Employer';

    // Base score is graph trust score (0-100, 100=good)
    let score = report.trustScore !== undefined ? report.trustScore : 0;
    
    // AI Scam Probability is 0-100 (100=bad). Subtract from trust if present.
    if (aiReport && aiReport.scamProbability !== undefined) {
      score = Math.max(0, score - (aiReport.scamProbability / 2));
    }
    
    scoreValue.textContent = score.toFixed(1);

    let risk = report.riskLevel || 'UNASSIGNED';
    if (aiReport && aiReport.riskLevel === 'HIGH') {
        risk = 'HIGH RISK (AI DETECTED)';
    } else if (aiReport && aiReport.riskLevel === 'MEDIUM' && risk === 'LOW') {
        risk = 'MEDIUM RISK';
    }

    riskBadge.textContent = risk.replace('_', ' ');

    // Color code circle and badge
    if (score >= 80) {
      scoreCircle.style.borderColor = '#10b981';
      riskBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      riskBadge.style.color = '#34d399';
    } else if (score >= 50) {
      scoreCircle.style.borderColor = '#f59e0b';
      riskBadge.style.background = 'rgba(245, 158, 11, 0.2)';
      riskBadge.style.color = '#fbbf24';
    } else {
      scoreCircle.style.borderColor = '#f43f5e';
      riskBadge.style.background = 'rgba(244, 63, 94, 0.2)';
      riskBadge.style.color = '#fb7185';
    }

    // Render audit trail reasons
    reasonsList.innerHTML = '';
    let reasons = report.reasons || [];
    
    // Add AI reasons if they exist
    if (aiReport && aiReport.reasons) {
        reasons = reasons.concat(aiReport.reasons.map(r => `AI Analysis: ${r}`));
    }

    if (reasons.length > 0) {
      reasons.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        reasonsList.appendChild(li);
      });
    } else {
      reasonsList.innerHTML = '<li style="color: #64748b; font-style: italic;">No specific risk reason flags generated.</li>';
    }

    // Render graph factors
    graphList.innerHTML = '';
    const graphFactors = report.graphRiskFactors || [];
    if (graphFactors.length > 0) {
      graphFactors.forEach(g => {
        const li = document.createElement('li');
        li.textContent = g;
        graphList.appendChild(li);
      });
    } else {
      graphList.innerHTML = '<li style="color: #64748b;">No high-risk recruiter network connections flagged.</li>';
    }
  }

  function showState(state) {
    stateLoading.classList.add('hidden');
    stateResult.classList.add('hidden');
    stateEmpty.classList.add('hidden');

    if (state === 'loading') stateLoading.classList.remove('hidden');
    if (state === 'result') stateResult.classList.remove('hidden');
    if (state === 'empty') stateEmpty.classList.remove('hidden');
  }

  function showError(msg) {
    errorBanner.textContent = msg;
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }
});
