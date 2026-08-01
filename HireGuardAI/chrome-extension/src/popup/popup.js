/**
 * HireGuard AI Extension Popup Script
 */
document.addEventListener('DOMContentLoaded', () => {
  const stateLoading = document.getElementById('state-loading');
  const stateResult = document.getElementById('state-result');
  const stateEmpty = document.getElementById('state-empty');
  const errorBanner = document.getElementById('error-banner');

  const scoreValue = document.getElementById('score-value');
  const scoreCircle = document.getElementById('score-circle');
  const companyNameEl = document.getElementById('company-name');
  const jobTitleEl = document.getElementById('job-title');
  const riskBadge = document.getElementById('risk-badge');
  const reasonsList = document.getElementById('reasons-list');
  const graphList = document.getElementById('graph-list');

  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  // Trigger initial tab extraction
  initScan();

  searchBtn.addEventListener('click', () => {
    const name = searchInput.value.trim();
    if (name) {
      analyzeCompany(name, 'Manual Verification Lookup');
    }
  });

  async function initScan() {
    showState('loading');
    hideError();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        showState('empty');
        return;
      }

      // Request DOM extraction from content script
      chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB_DETAILS' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.data) {
          console.log('[HireGuard Popup] No content script response or generic page.');
          showState('empty');
          return;
        }

        const jobData = response.data;
        if (jobData.companyName) {
          analyzeCompany(jobData.companyName, jobData.jobTitle || 'Detected Position');
        } else {
          showState('empty');
        }
      });
    } catch (err) {
      console.error('[HireGuard Popup] Scan init error:', err);
      showState('empty');
    }
  }

  async function analyzeCompany(companyName, jobTitle) {
    showState('loading');
    hideError();

    try {
      chrome.runtime.sendMessage(
        { action: 'ANALYZE_COMPANY', companyName },
        (response) => {
          if (chrome.runtime.lastError) {
            showError(`Connection error: ${chrome.runtime.lastError.message}`);
            showState('empty');
            return;
          }

          if (response && response.status === 'SUCCESS' && response.data) {
            renderResults(companyName, jobTitle, response.data.trustReport);
          } else {
            showError(response?.error || 'Failed to retrieve trust score from backend.');
            showState('empty');
          }
        }
      );
    } catch (err) {
      showError(err.message || 'Network request failed.');
      showState('empty');
    }
  }

  function renderResults(companyName, jobTitle, report) {
    showState('result');

    companyNameEl.textContent = companyName;
    jobTitleEl.textContent = jobTitle || 'Verified Employer';

    const score = report.trustScore !== undefined ? report.trustScore.toFixed(1) : 'N/A';
    scoreValue.textContent = score;

    const risk = report.riskLevel || 'UNASSIGNED';
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
    const reasons = report.reasons || [];
    if (reasons.length > 0) {
      reasons.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        reasonsList.appendChild(li);
      });
    } else {
      reasonsList.innerHTML = '<li style="color: #64748b; italic;">No specific risk reason flags generated.</li>';
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
