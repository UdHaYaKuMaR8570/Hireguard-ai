/**
 * Indeed DOM Job Details Extractor
 */
function extractIndeedJob() {
  try {
    const titleEl = document.querySelector('.jobsearch-JobInfoHeader-title, h1[data-testid="job-title"]');
    const companyEl = document.querySelector('[data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating-companyHeader a, [data-company-name="true"]');
    const descEl = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');

    const jobTitle = titleEl ? titleEl.innerText.trim() : '';
    const companyName = companyEl ? companyEl.innerText.trim() : '';
    const jobDescription = descEl ? descEl.innerText.trim() : '';

    const emailMatch = jobDescription.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const recruiterEmail = emailMatch ? emailMatch[0] : '';

    if (companyName || jobTitle) {
      return {
        platform: 'Indeed',
        jobTitle,
        companyName,
        recruiterEmail,
        jobDescription: jobDescription.substring(0, 3000),
        pageUrl: window.location.href
      };
    }
  } catch (e) {
    console.warn('[HireGuard] Indeed extractor warning:', e);
  }
  return null;
}
