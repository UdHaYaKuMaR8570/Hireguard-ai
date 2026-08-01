/**
 * Generic Fallback DOM Job Details Extractor
 * Uses OpenGraph tags, schema.org JobPosting microdata, or standard HTML elements.
 */
function extractGenericJob() {
  try {
    // 1. Try schema.org JSON-LD microdata
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.innerText);
        const item = Array.isArray(data) ? data.find(i => i['@type'] === 'JobPosting') : (data['@type'] === 'JobPosting' ? data : null);
        if (item) {
          const companyName = item.hiringOrganization ? (typeof item.hiringOrganization === 'string' ? item.hiringOrganization : item.hiringOrganization.name) : '';
          return {
            platform: 'Generic (schema.org)',
            jobTitle: item.title || '',
            companyName: companyName || '',
            recruiterEmail: '',
            jobDescription: (item.description || '').replace(/<[^>]+>/g, ' ').substring(0, 3000),
            pageUrl: window.location.href
          };
        }
      } catch (err) {}
    }

    // 2. Fallback to OpenGraph / Meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || document.title;
    const ogDesc = document.querySelector('meta[property="og:description"]')?.content || '';
    
    // Heuristic company name extraction from page title (e.g. "Software Engineer at Google")
    let companyName = '';
    let jobTitle = ogTitle;
    if (ogTitle.includes(' at ')) {
      const parts = ogTitle.split(' at ');
      jobTitle = parts[0].trim();
      companyName = parts[1].split(' - ')[0].split(' | ')[0].trim();
    } else if (ogTitle.includes(' - ')) {
      const parts = ogTitle.split(' - ');
      jobTitle = parts[0].trim();
      companyName = parts[1].trim();
    }

    const emailMatch = (document.body.innerText || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    return {
      platform: 'Generic Web Page',
      jobTitle: jobTitle || 'Job Position',
      companyName: companyName || '',
      recruiterEmail: emailMatch ? emailMatch[0] : '',
      jobDescription: (ogDesc || document.body.innerText.substring(0, 1500)).trim(),
      pageUrl: window.location.href
    };
  } catch (e) {
    console.warn('[HireGuard] Generic extractor warning:', e);
  }
  return null;
}
