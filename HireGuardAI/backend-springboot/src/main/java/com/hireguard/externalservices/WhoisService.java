package com.hireguard.externalservices;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

/**
 * External Service: WhoisService
 * Queries external WHOIS APIs (e.g., ip-api.com, WhoisXML API) to extract domain creation dates and compute domain age.
 * Gracefully degrades if WHOIS API key/URL is missing or external request times out.
 */
@Service
public class WhoisService {

    private static final Logger log = LoggerFactory.getLogger(WhoisService.class);

    private final RestTemplate restTemplate;

    @Value("${whois.api.url:}")
    private String whoisApiUrl;

    @Value("${whois.api.key:}")
    private String whoisApiKey;

    public WhoisService(RestTemplate aiRestTemplate) {
        this.restTemplate = aiRestTemplate;
    }

    public WhoisResult getDomainRegistrationInfo(String domain) {
        if (domain == null || domain.isBlank()) {
            return new WhoisResult(false, null, "Domain URL is missing or blank.");
        }

        String cleanDomain = domain.replaceFirst("^(https?://)?(www\\.)?", "").split("/")[0];

        if (whoisApiUrl == null || whoisApiUrl.isBlank()) {
            log.warn("WHOIS API Notice: 'whois.api.url' is not configured. Skipping WHOIS domain-age check for domain '{}'.", cleanDomain);
            return new WhoisResult(false, null, "WHOIS API endpoint not configured. Domain age check skipped.");
        }

        try {
            String requestUrl = whoisApiUrl.replace("{domain}", cleanDomain);
            if (whoisApiKey != null && !whoisApiKey.isBlank()) {
                requestUrl += (requestUrl.contains("?") ? "&" : "?") + "apiKey=" + whoisApiKey;
            }

            Map response = restTemplate.getForObject(requestUrl, Map.class);
            if (response != null && response.containsKey("createdDate")) {
                String dateStr = response.get("createdDate").toString();
                Instant createdInstant = Instant.parse(dateStr);
                long ageMonths = ChronoUnit.MONTHS.between(
                        ZonedDateTime.ofInstant(createdInstant, ZoneId.systemDefault()),
                        ZonedDateTime.now()
                );
                return new WhoisResult(true, (int) ageMonths, "Domain age successfully verified via WHOIS API.");
            }
        } catch (Exception e) {
            log.warn("WHOIS API Exception for domain '{}': {}. Proceeding without WHOIS domain-age score.", cleanDomain, e.getMessage());
        }

        return new WhoisResult(false, null, "WHOIS API lookup failed or domain registration date unavailable.");
    }

    public static class WhoisResult {
        private final boolean success;
        private final Integer domainAgeMonths;
        private final String message;

        public WhoisResult(boolean success, Integer domainAgeMonths, String message) {
            this.success = success;
            this.domainAgeMonths = domainAgeMonths;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public Integer getDomainAgeMonths() { return domainAgeMonths; }
        public String getMessage() { return message; }
    }
}
