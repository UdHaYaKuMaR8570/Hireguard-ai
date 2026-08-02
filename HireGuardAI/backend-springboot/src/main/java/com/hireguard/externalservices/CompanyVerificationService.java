package com.hireguard.externalservices;

import com.hireguard.enums.VerificationStatus;
import com.hireguard.model.mongodb.VerificationAuditLog;
import com.hireguard.repository.mongodb.VerificationAuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * External Service: CompanyVerificationService
 * Orchestrates multi-check employer verification:
 * 1. Domain age audit via WhoisService
 * 2. Web infrastructure reachability (HTTP GET/HEAD)
 * 3. SSL/TLS Certificate validity inspection
 * Stores audit logs in MongoDB verification_audit_logs collection.
 */
@Service
public class CompanyVerificationService {

    private static final Logger log = LoggerFactory.getLogger(CompanyVerificationService.class);

    private final WhoisService whoisService;
    private final VerificationAuditLogRepository auditLogRepository;

    public CompanyVerificationService(WhoisService whoisService, VerificationAuditLogRepository auditLogRepository) {
        this.whoisService = whoisService;
        this.auditLogRepository = auditLogRepository;
    }

    public VerificationResult verifyCompanyDomain(String companyId, String companyName, String websiteUrl) {
        List<String> reasons = new ArrayList<>();
        int highRiskCount = 0;
        int mediumRiskCount = 0;

        String formattedUrl = websiteUrl != null && !websiteUrl.isBlank() ? websiteUrl.trim() : "";
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
            formattedUrl = "https://" + formattedUrl;
        }

        String cleanDomain = formattedUrl.replaceFirst("^(https?://)?(www\\.)?", "").split("/")[0];

        // 1. Check Website Reachability (HTTP HEAD/GET)
        boolean reachable = checkWebsiteReachability(formattedUrl);
        saveAuditLog(companyId, "WEBSITE_REACHABILITY", reachable ? "SUCCESS: Website is online" : "FAILED: Website unreachable");
        if (reachable) {
            reasons.add("Infrastructure Audit: Official company website is reachable (" + cleanDomain + ").");
        } else {
            highRiskCount++;
            reasons.add("HIGH RISK FLAG: Company website (" + cleanDomain + ") is unreachable or returning connection timeouts.");
        }

        // 2. Check SSL/TLS Certificate Validity
        boolean sslValid = checkSslCertificate(formattedUrl);
        saveAuditLog(companyId, "SSL_CERTIFICATE", sslValid ? "SUCCESS: SSL Certificate valid" : "FAILED: SSL invalid or missing");
        if (sslValid) {
            reasons.add("SSL Security Audit: Website uses a valid, non-expired HTTPS certificate.");
        } else {
            highRiskCount++;
            reasons.add("HIGH RISK FLAG: Website SSL/TLS certificate is invalid, expired, or missing.");
        }

        // 3. Check Domain Age via WhoisService
        WhoisService.WhoisResult whoisResult = whoisService.getDomainRegistrationInfo(cleanDomain);
        Integer domainAgeMonths = whoisResult.getDomainAgeMonths();
        saveAuditLog(companyId, "WHOIS_DOMAIN_AGE", whoisResult.getMessage());

        if (whoisResult.isSuccess() && domainAgeMonths != null) {
            if (domainAgeMonths < 6) {
                highRiskCount++;
                reasons.add(String.format("HIGH RISK FLAG: Domain '%s' was registered recently (%d months old). High potential for throwaway scam domain.", cleanDomain, domainAgeMonths));
            } else if (domainAgeMonths <= 24) {
                mediumRiskCount++;
                reasons.add(String.format("MEDIUM RISK SIGNAL: Domain '%s' is relatively new (%d months old).", cleanDomain, domainAgeMonths));
            } else {
                reasons.add(String.format("Domain Age Audit: Domain '%s' is well-established (%d months old).", cleanDomain, domainAgeMonths));
            }
        } else {
            reasons.add("WHOIS Audit Notice: " + whoisResult.getMessage());
        }

        // 4. Derive overall VerificationStatus
        VerificationStatus status;
        if (highRiskCount > 0) {
            status = VerificationStatus.SUSPICIOUS;
        } else if (mediumRiskCount > 0) {
            status = VerificationStatus.PENDING;
        } else {
            status = VerificationStatus.VERIFIED;
        }

        saveAuditLog(companyId, "OVERALL_VERIFICATION", "Status determined: " + status.name());

        return new VerificationResult(status, domainAgeMonths, reasons);
    }

    private boolean checkWebsiteReachability(String urlString) {
        try {
            URL url = new URI(urlString).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("HEAD");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            int code = conn.getResponseCode();
            if (code >= 200 && code < 400) {
                return true;
            }
            // Retry with GET if HEAD is forbidden by web server
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            return (conn.getResponseCode() >= 200 && conn.getResponseCode() < 400);
        } catch (Exception e) {
            log.warn("Website reachability failed for {}: {}", urlString, e.getMessage());
            return false;
        }
    }

    private boolean checkSslCertificate(String urlString) {
        if (!urlString.startsWith("https://")) {
            return false;
        }
        try {
            URL url = new URI(urlString).toURL();
            HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            conn.connect();
            java.security.cert.Certificate[] certs = conn.getServerCertificates();
            if (certs != null && certs.length > 0 && certs[0] instanceof X509Certificate) {
                X509Certificate x509 = (X509Certificate) certs[0];
                x509.checkValidity();
                return true;
            }
        } catch (Exception e) {
            log.warn("SSL certificate check failed for {}: {}", urlString, e.getMessage());
        }
        return false;
    }

    private void saveAuditLog(String companyId, String checkType, String result) {
        try {
            VerificationAuditLog logEntry = new VerificationAuditLog();
            logEntry.setCompanyId(companyId != null ? companyId : "unknown");
            logEntry.setCheckType(checkType);
            logEntry.setResult(result);
            logEntry.setTimestamp(Instant.now());
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to persist VerificationAuditLog to MongoDB: {}", e.getMessage());
        }
    }

    public static class VerificationResult {
        private final VerificationStatus status;
        private final Integer domainAgeMonths;
        private final List<String> reasons;

        public VerificationResult(VerificationStatus status, Integer domainAgeMonths, List<String> reasons) {
            this.status = status;
            this.domainAgeMonths = domainAgeMonths;
            this.reasons = reasons != null ? reasons : new ArrayList<>();
        }

        public VerificationStatus getStatus() { return status; }
        public Integer getDomainAgeMonths() { return domainAgeMonths; }
        public List<String> getReasons() { return reasons; }
    }
}
