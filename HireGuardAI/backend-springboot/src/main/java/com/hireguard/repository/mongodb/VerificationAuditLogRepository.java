package com.hireguard.repository.mongodb;

import com.hireguard.model.mongodb.VerificationAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB Repository for VerificationAuditLog document entities.
 * Stores historical audit checks (WHOIS, SSL, website reachability, email validation).
 */
@Repository
public interface VerificationAuditLogRepository extends MongoRepository<VerificationAuditLog, String> {

    List<VerificationAuditLog> findByCompanyId(String companyId);
}
