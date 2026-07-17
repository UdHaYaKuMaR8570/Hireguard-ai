package com.hireguard.repository.mongodb;

import com.hireguard.model.mongodb.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data MongoDB Repository for Company document entities.
 * Supports case-insensitive name searching and exact domain lookups during verification.
 */
@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {

    List<Company> findByNameContainingIgnoreCase(String name);

    Optional<Company> findByNameIgnoreCase(String name);

    Optional<Company> findByWebsiteIgnoreCase(String website);
}
