package com.hireguard.externalservices.provider.impl;

import com.hireguard.dto.response.BlacklistVerificationResult;
import com.hireguard.externalservices.provider.BlacklistProvider;
import com.hireguard.model.mongodb.BlacklistEntry;
import com.hireguard.repository.mongodb.BlacklistRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Internal MongoDB Blacklist Database Provider implementation.
 */
@Component
public class InternalBlacklistProvider implements BlacklistProvider {

    private static final Logger log = LoggerFactory.getLogger(InternalBlacklistProvider.class);

    private final BlacklistRepository blacklistRepository;

    public InternalBlacklistProvider(BlacklistRepository blacklistRepository) {
        this.blacklistRepository = blacklistRepository;
    }

    @Override
    public BlacklistVerificationResult check(String domain, String companyName, String email) {
        // 1. Check Domain
        if (domain != null && !domain.isBlank()) {
            String cleanDomain = domain.toLowerCase().replaceFirst("^(https?://)?(www\\.)?", "").split("/")[0];
            Optional<BlacklistEntry> domainMatch = blacklistRepository.findFirstByTypeAndValueIgnoreCaseAndActiveTrue("DOMAIN", cleanDomain);
            if (domainMatch.isPresent()) {
                return buildMatchResult(domainMatch.get());
            }
        }

        // 2. Check Email
        if (email != null && !email.isBlank()) {
            Optional<BlacklistEntry> emailMatch = blacklistRepository.findFirstByTypeAndValueIgnoreCaseAndActiveTrue("EMAIL", email.trim().toLowerCase());
            if (emailMatch.isPresent()) {
                return buildMatchResult(emailMatch.get());
            }
        }

        // 3. Check Company Name
        if (companyName != null && !companyName.isBlank()) {
            Optional<BlacklistEntry> companyMatch = blacklistRepository.findFirstByTypeAndValueIgnoreCaseAndActiveTrue("COMPANY", companyName.trim());
            if (companyMatch.isPresent()) {
                return buildMatchResult(companyMatch.get());
            }
        }

        return BlacklistVerificationResult.clear();
    }

    private BlacklistVerificationResult buildMatchResult(BlacklistEntry entry) {
        log.warn("BLACKLIST MATCH DETECTED! Type={}, Value={}, Severity={}", entry.getType(), entry.getValue(), entry.getSeverity());
        
        List<String> reasons = new ArrayList<>();
        reasons.add(String.format("CRITICAL BLACKLIST MATCH: %s '%s' is flagged in blacklist database (%s).", entry.getType(), entry.getValue(), entry.getReason()));

        int riskScore = "CRITICAL".equalsIgnoreCase(entry.getSeverity()) ? 95 : ("HIGH".equalsIgnoreCase(entry.getSeverity()) ? 85 : 60);

        return new BlacklistVerificationResult(
                true,
                entry.getType(),
                entry.getValue(),
                entry.getSeverity() != null ? entry.getSeverity() : "HIGH",
                entry.getSource() != null ? entry.getSource() : "INTERNAL_REPORTS",
                entry.getReason(),
                riskScore,
                reasons
        );
    }
}
