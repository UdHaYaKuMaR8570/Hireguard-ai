/**
 * LinkedIn DOM Job Details Extractor
 * Uses multiple fallback selector strategies to handle LinkedIn's frequently-changing DOM.
 * Prefers semantic selectors (aria-label, data-*, structural) over brittle auto-generated class names.
 */
function extractLinkedInJob() {
  const LOG_PREFIX = '[HireGuard LinkedIn]';

  try {
    // === JOB TITLE ===
    // Strategy: Try specific LinkedIn class names first, then aria-label patterns, then any h1
    const titleSelectors = [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      '.t-24.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      'h1[class*="job-title"]',
      'a[class*="job-title"]',
      '.jobs-details__main-content h1',
      '.job-view-layout h1',
      '.top-card-layout__title',
      'h1.topcard__title',
      '.artdeco-entity-lockup__title',
      'h1'
    ];
    const titleEl = queryFirst(titleSelectors);
    if (!titleEl) console.warn(`${LOG_PREFIX} ⚠ Job title element NOT FOUND with any selector`);

    // === COMPANY NAME ===
    // Strategy: LinkedIn company name is usually a link inside the top card
    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__primary-description a',
      'a[class*="company-name"]',
      'span[class*="company-name"]',
      '.jobs-details__main-content a[href*="/company/"]',
      '.job-view-layout a[href*="/company/"]',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
      '.topcard__org-name-link',
      '.top-card-layout__first-sub-line a',
      '.artdeco-entity-lockup__subtitle',
      '.jobs-unified-top-card__subtitle-primary-grouping-line a',
      '.jobs-unified-top-card__subtitle-primary-grouping-line',
      // Structural fallback: find a link whose href contains "/company/"
      'a[href*="linkedin.com/company/"]',
      'a[href*="/company/"]'
    ];
    const companyEl = queryFirst(companySelectors);
    if (!companyEl) console.warn(`${LOG_PREFIX} ⚠ Company name element NOT FOUND with any selector`);

    // === JOB DESCRIPTION ===
    const descSelectors = [
      '#job-details',
      '.jobs-description__content',
      '.jobs-box__html-content',
      '.jobs-description-content__text',
      'article[class*="jobs-description"]',
      '.jobs-details__main-content .jobs-box__html-content',
      '.show-more-less-html__markup',
      '.jobs-description-content',
      '.description__text',
      // Structural fallback: look for the section containing "About the job"
      'div[class*="description"]'
    ];
    const descEl = queryFirst(descSelectors);
    if (!descEl) console.warn(`${LOG_PREFIX} ⚠ Job description element NOT FOUND with any selector`);

    // === RECRUITER / POSTER INFO ===
    const recruiterSelectors = [
      '.jobs-poster__name',
      '.hirer-card__hirer-information a',
      'a[class*="hirer"]',
      '.message-the-recruiter a'
    ];
    const recruiterEl = queryFirst(recruiterSelectors);

    // Extract text values
    const jobTitle = titleEl ? (titleEl.innerText || titleEl.textContent || '').trim() : '';
    const companyName = companyEl ? (companyEl.innerText || companyEl.textContent || '').trim() : '';
    const jobDescription = descEl ? (descEl.innerText || descEl.textContent || '').trim() : '';
    const recruiterName = recruiterEl ? (recruiterEl.innerText || recruiterEl.textContent || '').trim() : '';

    // Extract recruiter email if present in description text
    const emailMatch = jobDescription.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const recruiterEmail = emailMatch ? emailMatch[0] : '';

    console.log(`${LOG_PREFIX} Extracted → Title: "${jobTitle}", Company: "${companyName}", Desc length: ${jobDescription.length}, Recruiter: "${recruiterName}"`);

    if (companyName || jobTitle) {
      return {
        platform: 'LinkedIn',
        jobTitle,
        companyName,
        recruiterEmail,
        recruiterName,
        jobDescription: jobDescription.substring(0, 3000),
        pageUrl: window.location.href
      };
    }

    console.warn(`${LOG_PREFIX} ⚠ Both companyName and jobTitle are empty — returning null`);
  } catch (e) {
    console.warn(`${LOG_PREFIX} Extractor error:`, e);
  }
  return null;
}

/**
 * Helper: try multiple CSS selectors and return the first element found.
 */
function queryFirst(selectors) {
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el) {
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length > 0) {
          return el;
        }
      }
    } catch (e) {
      // Invalid selector, skip
    }
  }
  return null;
}
