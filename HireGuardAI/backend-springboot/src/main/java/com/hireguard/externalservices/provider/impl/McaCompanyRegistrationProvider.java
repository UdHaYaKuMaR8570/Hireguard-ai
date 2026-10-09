package com.hireguard.externalservices.provider.impl;

import com.hireguard.dto.response.CompanyRegistrationResult;
import com.hireguard.externalservices.provider.CompanyRegistrationProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * MCA (Ministry of Corporate Affairs) Company Registration Provider implementation.
 * Queries the RapidAPI MCA India Company Master API to verify company registration status.
 * Returns status = VERIFICATION_UNAVAILABLE if API credentials are not configured, rather than fake data.
 */
@Component
public class McaCompanyRegistrationProvider implements CompanyRegistrationProvider {

    private static final Logger log = LoggerFactory.getLogger(McaCompanyRegistrationProvider.class);

    private final RestTemplate restTemplate;

    @Value("${mca.api.url:}")
    private String mcaApiUrl;

    @Value("${mca.api.key:}")
    private String mcaApiKey;

    @Value("${mca.api.host:}")
    private String mcaApiHost;

    public McaCompanyRegistrationProvider(RestTemplate aiRestTemplate) {
        this.restTemplate = aiRestTemplate;
    }

    @Override
    public CompanyRegistrationResult verifyCompany(String companyName, String registrationNumber) {
        if (mcaApiUrl == null || mcaApiUrl.isBlank() || mcaApiKey == null || mcaApiKey.isBlank()) {
            log.warn("MCA Government Verification Notice: MCA API credentials not configured for company '{}'. Returning VERIFICATION_UNAVAILABLE.", companyName);
            return CompanyRegistrationResult.unavailable(
                    companyName,
                    registrationNumber,
                    "Government registration verification service (MCA) is not configured with external credentials."
            );
        }

        try {
            // Build the request URL: use ?cin if registrationNumber exists, otherwise ?query for company name
            boolean hasCin = (registrationNumber != null && !registrationNumber.isBlank());
            String paramName = hasCin ? "cin" : "query";
            String queryValue = hasCin ? registrationNumber : companyName;
            String requestUrl = mcaApiUrl + "?" + paramName + "=" + java.net.URLEncoder.encode(queryValue, "UTF-8");

            // RapidAPI requires X-RapidAPI-Key and X-RapidAPI-Host headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-RapidAPI-Key", mcaApiKey);
            headers.set("X-RapidAPI-Host", mcaApiHost != null && !mcaApiHost.isBlank() ? mcaApiHost : "mca-india-company-master-director-din-intelligence-pro.p.rapidapi.com");
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(headers);

            log.info("Querying MCA RapidAPI endpoint for company='{}', param='{}', queryValue='{}'", companyName, paramName, queryValue);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(requestUrl, HttpMethod.GET, entity, Map.class);
            Map<String, Object> response = responseEntity.getBody();

            if (response != null) {
                List<String> reasons = new ArrayList<>();
                String status = "UNKNOWN";
                boolean verified = false;
                int riskScore = 50; // Default moderate risk for unknown

                // Parse company status from response
                Object companyStatus = response.get("companyStatus");
                Object cinValue = response.get("cin");
                Object companyNameResult = response.get("companyName");

                if (companyStatus != null) {
                    String statusStr = companyStatus.toString().toUpperCase();
                    if (statusStr.contains("ACTIVE")) {
                        status = "ACTIVE";
                        verified = true;
                        riskScore = 0;
                        reasons.add("Company registration status verified ACTIVE via MCA Government Registry.");
                    } else if (statusStr.contains("DISSOLVED") || statusStr.contains("STRUCK")) {
                        status = "DISSOLVED";
                        verified = false;
                        riskScore = 90;
                        reasons.add("Company registration found but status is DISSOLVED/STRUCK OFF in MCA Registry. High risk.");
                    } else if (statusStr.contains("DORMANT")) {
                        status = "DORMANT";
                        verified = false;
                        riskScore = 70;
                        reasons.add("Company registration found but status is DORMANT in MCA Registry. Elevated risk.");
                    } else {
                        status = statusStr;
                        verified = true;
                        riskScore = 30;
                        reasons.add("Company found in MCA Registry with status: " + statusStr + ".");
                    }
                } else {
                    reasons.add("MCA API returned a response but company registration status field was not found.");
                    riskScore = 60;
                }

                if (cinValue != null) {
                    reasons.add("CIN/Registration Number confirmed: " + cinValue.toString());
                }

                String regNo = (cinValue != null) ? cinValue.toString() : (registrationNumber != null ? registrationNumber : "NOT_AVAILABLE");

                log.info("MCA API result for '{}': status={}, verified={}, riskScore={}", companyName, status, verified, riskScore);

                return new CompanyRegistrationResult(
                        companyName,
                        regNo,
                        status,
                        verified,
                        "MCA_RAPIDAPI_PROVIDER",
                        Instant.now(),
                        riskScore,
                        reasons
                );
            }

            return CompanyRegistrationResult.unavailable(companyName, registrationNumber, "MCA API returned empty response for company: " + companyName);

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.warn("MCA API returned HTTP {} for company '{}': {}", e.getStatusCode(), companyName, e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return new CompanyRegistrationResult(
                        companyName,
                        registrationNumber != null ? registrationNumber : "NOT_AVAILABLE",
                        "NOT_FOUND",
                        false,
                        "MCA_RAPIDAPI_PROVIDER",
                        Instant.now(),
                        75,
                        Collections.singletonList("Company not found in MCA Government Registry: " + companyName)
                );
            }
            return CompanyRegistrationResult.unavailable(companyName, registrationNumber, "MCA API returned status: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("MCA API execution failed for '{}': {}", companyName, e.getMessage());
            return CompanyRegistrationResult.unavailable(companyName, registrationNumber, "MCA API connection error: " + e.getMessage());
        }
    }
}
