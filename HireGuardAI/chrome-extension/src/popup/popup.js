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

  // Traffic-Light Quick Risk Banner Elements
  const quickRiskBanner = document.getElementById('quick-risk-banner');
  const trafficLightBadge = document.getElementById('traffic-light-badge');
  const trafficLightIndicator = document.getElementById('traffic-light-indicator');
  const trafficLightLabel = document.getElementById('traffic-light-label');
  const trafficLightScore = document.getElementById('traffic-light-score');
  const headlineIcon = document.getElementById('headline-icon');
  const headlineReason = document.getElementById('headline-reason');
  const toggleReasonsHeader = document.getElementById('toggle-reasons-header');
  const toggleReasonsText = document.getElementById('toggle-reasons-text');

  let reasonsExpanded = true;
  if (toggleReasonsHeader) {
    toggleReasonsHeader.addEventListener('click', () => {
      reasonsExpanded = !reasonsExpanded;
      if (reasonsList) {
        reasonsList.style.display = reasonsExpanded ? 'flex' : 'none';
      }
      if (toggleReasonsText) {
        toggleReasonsText.textContent = reasonsExpanded ? '▲ Collapse' : '▼ Expand';
      }
    });
  }

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
    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB_DETAILS' }, async (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[HireGuard Popup] Content script not reachable, attempting dynamic injection:', chrome.runtime.lastError.message);
        
        // Dynamic injection fallback: execute content scripts into active tab
        if (tab && tab.id && chrome.scripting) {
          try {
            setExtractionStatus('🔄 Connecting to page...');
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: [
                'src/shared/constants.js',
                'src/content/linkedinExtractor.js',
                'src/content/indeedExtractor.js',
                'src/content/genericExtractor.js',
                'src/content/contentScript.js'
              ]
            });

            // Brief wait for initialization, then retry message
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB_DETAILS' }, (retryResponse) => {
                if (chrome.runtime.lastError || !retryResponse?.data) {
                  setExtractionStatus('⚠ Content script not loaded — please refresh page (F5)');
                  showState('empty');
                } else {
                  handleExtractedData(retryResponse.data);
                }
              });
            }, 600);
            return;
          } catch (injectErr) {
            console.warn('[HireGuard Popup] Dynamic injection failed:', injectErr);
          }
        }

        setExtractionStatus('⚠ Content script not loaded — please refresh page (F5)');
        showState('empty');
        return;
      }

      handleExtractedData(response?.data);
    });
  }

  function handleExtractedData(jobData) {
    if (jobData && (jobData.companyName || jobData.jobTitle)) {
      console.log(`[HireGuard Popup] ✅ Extraction: "${jobData.companyName}" / "${jobData.jobTitle}"`);
      setExtractionStatus(`✅ Auto-detected: ${jobData.companyName}`);
      analyzeCompany(jobData.companyName, jobData.jobTitle || 'Detected Position', jobData.jobDescription);
    } else {
      console.log('[HireGuard Popup] Extraction returned empty');
      setExtractionStatus('⚠ No job posting data found on this page');
      showState('empty');
    }
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

  function getHeadlineReason(report, aiReport, score) {
    // 1. Blacklist Check (Highest Severity Priority)
    const isBlacklisted = report.verification?.blacklist?.blacklisted === true 
      || report.signals?.blacklist === 0 
      || (report.reasons && report.reasons.some(r => /blacklisted|blacklist match/i.test(r)));
    
    if (isBlacklisted) {
      const blReason = report.verification?.blacklist?.reason 
        || report.reasons?.find(r => /blacklist/i.test(r))
        || 'Entity found in fraudulent employer blacklist repository.';
      return {
        icon: '🚫',
        text: `Blacklist Alert: ${blReason}`
      };
    }

    // 2. AI Scam Probability (High Priority)
    const aiProb = aiReport?.scamProbability !== undefined 
      ? aiReport.scamProbability 
      : (report.signals?.aiAnalysis !== undefined ? (100 - report.signals.aiAnalysis) : null);

    if (aiProb !== null && aiProb >= 50) {
      const topAiReason = aiReport?.reasons?.[0] || 'High scam probability detected in posting description.';
      return {
        icon: '🤖',
        text: `AI Risk Alert (${aiProb}% scam probability): ${topAiReason}`
      };
    }

    // 3. Neo4j Graph Topology Anomaly (High Priority)
    const graphFactors = report.graphRiskFactors || [];
    const hasGraphAnomaly = graphFactors.length > 0 && !graphFactors.some(g => /clean|no multi-company|no high-risk/i.test(g));
    if (hasGraphAnomaly) {
      return {
        icon: '🕸️',
        text: `Graph Alert: ${graphFactors[0]}`
      };
    }

    // 4. Domain / Government Registration Flags
    const whois = report.verification?.whois;
    const reg = report.verification?.companyRegistration;
    if (reg && (reg.status === 'DISSOLVED' || (reg.verified === false && reg.status !== 'VERIFICATION_UNAVAILABLE'))) {
      return {
        icon: '🏢',
        text: `Registration Flag: Status is ${reg.status || 'UNVERIFIED'}.`
      };
    }

    if (whois && typeof whois.domainAgeMonths === 'number' && whois.domainAgeMonths !== null && whois.domainAgeMonths < 6) {
      return {
        icon: '🌐',
        text: `Domain Alert: Registered only ${whois.domainAgeMonths} months ago.`
      };
    }

    if (report.warnings && report.warnings.length > 0) {
      return {
        icon: '⚠️',
        text: report.warnings[0]
      };
    }

    // 5. Safe Tier (score >= 80)
    if (score >= 80) {
      return {
        icon: '✓',
        text: 'All core checks verified: Clear blacklist, domain infrastructure, and low scam probability.'
      };
    }

    // 6. Caution Tier (50 <= score < 80)
    if (score >= 50) {
      const cautionReason = report.reasons?.[0] || 'Moderate risk signals detected during employer verification.';
      return {
        icon: '⚠️',
        text: `Caution: ${cautionReason}`
      };
    }

    // 7. Danger Tier (score < 50)
    const dangerReason = report.reasons?.[0] || report.warnings?.[0] || 'Multiple critical fraud indicators flagged.';
    return {
      icon: '🚨',
      text: `High Risk: ${dangerReason}`
    };
  }

  function renderResults(companyName, jobTitle, report, aiReport) {
    showState('result');

    companyNameEl.textContent = companyName;
    jobTitleEl.textContent = jobTitle || 'Verified Employer';

    // Base score is trust score from backend (already incorporates all weights and AI analysis)
    let score = report.trustScore !== undefined ? report.trustScore : 0;
    
    scoreValue.textContent = Number(score).toFixed(1);

    // Identical thresholds: Safe (>=80), Caution (50-79.9), Danger (<50)
    let tier = 'safe';
    let tierLabel = 'Safe';
    let tierIndicator = '🟢';

    if (score >= 80) {
      tier = 'safe';
      tierLabel = 'Safe';
      tierIndicator = '🟢';
    } else if (score >= 50) {
      tier = 'caution';
      tierLabel = 'Caution';
      tierIndicator = '🟡';
    } else {
      tier = 'danger';
      tierLabel = 'Danger';
      tierIndicator = '🔴';
    }

    // Update traffic-light banner
    if (quickRiskBanner) {
      quickRiskBanner.className = `quick-risk-banner ${tier}`;
    }
    if (trafficLightBadge) {
      trafficLightBadge.className = `traffic-light-badge ${tier}`;
    }
    if (trafficLightIndicator) {
      trafficLightIndicator.textContent = tierIndicator;
    }
    if (trafficLightLabel) {
      trafficLightLabel.textContent = tierLabel;
    }
    if (trafficLightScore) {
      trafficLightScore.textContent = `${score.toFixed(1)} / 100`;
    }

    const headline = getHeadlineReason(report, aiReport, score);
    if (headlineIcon) headlineIcon.textContent = headline.icon;
    if (headlineReason) headlineReason.textContent = headline.text;

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
    let reasons = [...(report.reasons || [])];
    if (report.warnings && report.warnings.length > 0) {
      reasons = [...report.warnings, ...reasons];
    }
    
    // Add AI reasons if they exist and aren't already present
    if (aiReport && aiReport.reasons) {
      aiReport.reasons.forEach(r => {
        const aiText = `AI Analysis: ${r}`;
        if (!reasons.includes(r) && !reasons.includes(aiText)) {
          reasons.push(aiText);
        }
      });
    }

    const uniqueReasons = Array.from(new Set(reasons));

    if (uniqueReasons.length > 0) {
      uniqueReasons.forEach(r => {
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
