/**
 * LinkedIn DOM Job Details Extractor
 */
function extractLinkedInJob() {
  try {
    const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1');
    const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description a');
    const descEl = document.querySelector('#job-details, .jobs-description__content, .jobs-box__html-content');

    const jobTitle = titleEl ? titleEl.innerText.trim() : '';
    const companyName = companyEl ? companyEl.innerText.trim() : '';
    const jobDescription = descEl ? descEl.innerText.trim() : '';

    // Extract recruiter email if present in description text
    const emailMatch = jobDescription.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const recruiterEmail = emailMatch ? emailMatch[0] : '';

    if (companyName || jobTitle) {
      return {
        platform: 'LinkedIn',
        jobTitle,
        companyName,
        recruiterEmail,
        jobDescription: jobDescription.substring(0, 3000),
        pageUrl: window.location.href
      };
    }
  } catch (e) {
    console.warn('[HireGuard] LinkedIn extractor warning:', e);
  }
  return null;
}
