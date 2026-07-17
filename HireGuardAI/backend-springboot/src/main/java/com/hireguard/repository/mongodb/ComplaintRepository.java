package com.hireguard.repository.mongodb;

import com.hireguard.model.mongodb.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB Repository for Complaint document entities.
 * Supports querying all complaints filed against a specific employer ID.
 */
@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, String> {

    List<Complaint> findByCompanyId(String companyId);
}
