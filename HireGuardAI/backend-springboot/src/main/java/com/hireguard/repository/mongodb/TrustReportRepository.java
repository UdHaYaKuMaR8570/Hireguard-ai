package com.hireguard.repository.mongodb;

import com.hireguard.model.mongodb.TrustReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data MongoDB Repository for TrustReport document entities.
 * Fetches existing calculated trust scores and explainability factors by companyId.
 */
@Repository
public interface TrustReportRepository extends MongoRepository<TrustReport, String> {

    Optional<TrustReport> findFirstByCompanyIdOrderByGeneratedAtDesc(String companyId);
}
