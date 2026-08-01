package com.hireguard.service;

import com.hireguard.dto.response.TrustScoreResponse;

/**
 * Service Interface: TrustScoreService
 * Contract for employer trust score retrieval and explainable fraud risk evaluation.
 */
public interface TrustScoreService {
    TrustScoreResponse getTrustScore(String companyId);
}
