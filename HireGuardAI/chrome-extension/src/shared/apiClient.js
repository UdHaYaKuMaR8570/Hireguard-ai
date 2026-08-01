/**
 * HireGuard AI API Client
 * Calls host-published Spring Boot REST API endpoints (http://localhost:8080).
 */
const API_BASE_URL = 'http://localhost:8080';

export async function searchCompanies(companyName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/company/search?name=${encodeURIComponent(companyName)}`);
    if (!response.ok) {
      throw new Error(`Server error (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('[HireGuard API] Search failed:', error);
    throw error;
  }
}

export async function getCompanyTrustScore(companyId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/trust-score`);
    if (!response.ok) {
      throw new Error(`Server error (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('[HireGuard API] Trust score retrieval failed:', error);
    throw error;
  }
}

export async function verifyCompany(companyName, website) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/company/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, website: website || 'https://' + companyName.toLowerCase().replace(/\s+/g, '') + '.com' })
    });
    if (!response.ok) {
      throw new Error(`Server error (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('[HireGuard API] Verification request failed:', error);
    throw error;
  }
}
