/**
 * LinkedIn DOM Job Details Extractor
 * Uses multiple fallback selector strategies to handle LinkedIn's frequently-changing DOM.
 * Prefers semantic selectors (aria-label, data-*, structural) over brittle auto-generated class names.
 */
function extractLinkedInJob() {
  const LOG_PREFIX = '[HireGuard LinkedIn]';

  try {
    // Strategy 1: Look inside the active job details pane first (split-view search page or direct page)
    const detailsContainer = document.querySelector(
      '.jobs-search__job-details--container, .job-view-layout, .jobs-details__main-content, .job-details-jobs-unified-top-card, [class*="jobs-search__job-details"], .jobs-details-pane, div.scaffold-layout__detail, main'
    ) || document;

    // === JOB TITLE ===
    const titleSelectors = [
      'h1.job-details-jobs-unified-top-card__job-title',
      '.job-details-jobs-unified-top-card__job-title h1',
      '.job-details-jobs-unified-top-card__job-title a',
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title a',
      '.jobs-unified-top-card__job-title',
      '.t-24.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      'h2.t-24',
      'h1[class*="job-title"]',
      'h2[class*="job-title"]',
      'a[class*="job-title"]',
      '.jobs-details__main-content h1',
      '.jobs-search__job-details--container h1',
      '.top-card-layout__title',
      'h1.topcard__title',
      '.artdeco-entity-lockup__title',
      'h1'
    ];
    let titleEl = queryValidTitle(titleSelectors, detailsContainer) || queryValidTitle(titleSelectors, document);

    // === COMPANY NAME ===
    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__primary-description a',
      '.job-details-jobs-unified-top-card__subtitle-primary-grouping-line a',
      '.job-details-jobs-unified-top-card__subtitle-primary-grouping-line',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
      'a[data-tracking-control-name*="company"]',
      '.topcard__org-name-link',
      '.top-card-layout__first-sub-line a',
      '.artdeco-entity-lockup__subtitle',
      'a[class*="company-name"]',
      'span[class*="company-name"]',
      'a[href*="/company/"]'
    ];
    let companyEl = queryFirst(companySelectors, detailsContainer) || queryFirst(companySelectors, document);

    // === FALLBACK: Check Active Job Card in Search Results List ===
    if (!companyEl || !titleEl) {
      const activeCard = document.querySelector(
        '.jobs-search-results-list__list-item--active, [class*="jobs-search-results-list__list-item--active"], .job-card-container--clickable.jobs-search-results-list__list-item--active, li[class*="active"][class*="job"]'
      );
      if (activeCard) {
        if (!titleEl) {
          titleEl = queryFirst(['.job-card-list__title', 'a[class*="job-card-list__title"]', '[class*="job-card-list__title"]', 'a[href*="/jobs/view/"]'], activeCard);
        }
        if (!companyEl) {
          companyEl = queryFirst(['.job-card-container__primary-description', '[class*="primary-description"]', '[class*="company-name"]', 'span[class*="company"]'], activeCard);
        }
      }
    }

    if (!titleEl) console.warn(`${LOG_PREFIX} ⚠ Job title element NOT FOUND with any selector`);
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
      'div[class*="description"]'
    ];
    const descEl = queryFirst(descSelectors, detailsContainer) || queryFirst(descSelectors, document);
    if (!descEl) console.warn(`${LOG_PREFIX} ⚠ Job description element NOT FOUND with any selector`);

    // === RECRUITER / POSTER INFO ===
    const recruiterSelectors = [
      '.jobs-poster__name',
      '.hirer-card__hirer-information a',
      'a[class*="hirer"]',
      '.message-the-recruiter a'
    ];
    const recruiterEl = queryFirst(recruiterSelectors, detailsContainer) || queryFirst(recruiterSelectors, document);

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
 * Helper: try multiple CSS selectors within root and return the first element found.
 */
function queryFirst(selectors, root = document) {
  for (const selector of selectors) {
    try {
      const el = root.querySelector(selector);
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

/**
 * Helper: find title element while filtering out section headings like 'About the job'.
 */
function queryValidTitle(selectors, root = document) {
  const invalidTitles = [
    'about the job', 'job description', 'description', 'about us', 
    'easy apply', 'apply', 'save', 'show more', 'show less', 'job details',
    'experience level', 'employment type', 'job function', 'industries'
  ];

  for (const selector of selectors) {
    try {
      const el = root.querySelector(selector);
      if (el) {
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length > 2 && !invalidTitles.includes(text.toLowerCase())) {
          return el;
        }
      }
    } catch (e) {
      // Invalid selector, skip
    }
  }
  return null;
}
