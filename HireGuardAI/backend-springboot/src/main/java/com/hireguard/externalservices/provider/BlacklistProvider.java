package com.hireguard.externalservices.provider;

import com.hireguard.dto.response.BlacklistVerificationResult;

/**
 * Interface contract for blacklist database verification providers.
 */
public interface BlacklistProvider {

    BlacklistVerificationResult check(String domain, String companyName, String email);
}
