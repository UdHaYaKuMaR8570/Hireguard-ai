package com.hireguard.controller;

import com.hireguard.dto.response.TrustScoreResponse;
import com.hireguard.service.TrustScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller: TrustScoreController
 * Exposes employer trust score explainability reports (`GET /api/company/{id}/trust-score`).
 *
 * TODO: Per Phase 2 development rules, this endpoint currently returns existing trust_reports
 * documents from MongoDB if present, or a rule-based temporary stub if absent.
 * In later phases (Phase 4 AI & Phase 5 Graph Engine), this endpoint will trigger live
 * transformer probability classification and multi-hop Neo4j graph anomaly traversals.
 */
@RestController
@RequestMapping("/api/company")
public class TrustScoreController {

    private final TrustScoreService trustScoreService;

    public TrustScoreController(TrustScoreService trustScoreService) {
        this.trustScoreService = trustScoreService;
    }

    @GetMapping("/{id}/trust-score")
    public ResponseEntity<TrustScoreResponse> getTrustScore(@PathVariable String id) {
        TrustScoreResponse response = trustScoreService.getTrustScore(id);
        return ResponseEntity.ok(response);
    }
}
