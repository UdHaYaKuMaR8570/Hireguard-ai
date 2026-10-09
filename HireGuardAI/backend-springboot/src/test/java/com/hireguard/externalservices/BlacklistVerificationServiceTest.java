package com.hireguard.externalservices;

import com.hireguard.dto.response.BlacklistVerificationResult;
import com.hireguard.externalservices.provider.impl.InternalBlacklistProvider;
import com.hireguard.model.mongodb.BlacklistEntry;
import com.hireguard.repository.mongodb.BlacklistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;

class BlacklistVerificationServiceTest {

    private BlacklistVerificationService blacklistService;
    private BlacklistRepository blacklistRepository;

    @BeforeEach
    void setUp() {
        blacklistRepository = Mockito.mock(BlacklistRepository.class);
        InternalBlacklistProvider provider = new InternalBlacklistProvider(blacklistRepository);
        blacklistService = new BlacklistVerificationService(provider);
    }

    @Test
    void testClearDomainCheck() {
        Mockito.when(blacklistRepository.findFirstByTypeAndValueIgnoreCaseAndActiveTrue(eq("DOMAIN"), eq("safe-domain.com")))
                .thenReturn(Optional.empty());

        BlacklistVerificationResult result = blacklistService.checkBlacklist("safe-domain.com", "Safe Corp", "hr@safe-domain.com");
        assertFalse(result.isBlacklisted());
        assertEquals(0, result.getRiskScore());
    }

    @Test
    void testBlacklistedDomainMatch() {
        BlacklistEntry entry = new BlacklistEntry("DOMAIN", "scam-domain.com", "Multiple scam reports", "CRITICAL", "INTERNAL_REPORTS");
        Mockito.when(blacklistRepository.findFirstByTypeAndValueIgnoreCaseAndActiveTrue(eq("DOMAIN"), eq("scam-domain.com")))
                .thenReturn(Optional.of(entry));

        BlacklistVerificationResult result = blacklistService.checkBlacklist("scam-domain.com", "Scam Corp", "hr@scam-domain.com");
        assertTrue(result.isBlacklisted());
        assertEquals("DOMAIN", result.getMatchedType());
        assertEquals(95, result.getRiskScore());
    }
}
