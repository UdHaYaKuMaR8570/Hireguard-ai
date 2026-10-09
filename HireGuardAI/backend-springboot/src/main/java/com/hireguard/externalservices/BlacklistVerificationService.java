package com.hireguard.externalservices;

import com.hireguard.dto.response.BlacklistVerificationResult;
import com.hireguard.externalservices.provider.BlacklistProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * External Service: BlacklistVerificationService
 * Cross-references domain, company name, and recruiter email against internal and external blacklist repositories.
 */
@Service
public class BlacklistVerificationService {

    private static final Logger log = LoggerFactory.getLogger(BlacklistVerificationService.class);

    private final BlacklistProvider blacklistProvider;

    public BlacklistVerificationService(BlacklistProvider blacklistProvider) {
        this.blacklistProvider = blacklistProvider;
    }

    public BlacklistVerificationResult checkBlacklist(String domain, String companyName, String email) {
        log.info("Executing Blacklist Verification Check — Domain='{}', Company='{}', Email='{}'", domain, companyName, email);
        return blacklistProvider.check(domain, companyName, email);
    }
}
