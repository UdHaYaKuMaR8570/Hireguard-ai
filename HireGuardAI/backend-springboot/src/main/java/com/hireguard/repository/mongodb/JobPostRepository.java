package com.hireguard.repository.mongodb;

import com.hireguard.model.mongodb.JobPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB Repository for JobPost document entities.
 * Supports querying all job posts associated with a specific employer company ID.
 */
@Repository
public interface JobPostRepository extends MongoRepository<JobPost, String> {

    List<JobPost> findByCompanyId(String companyId);
}
