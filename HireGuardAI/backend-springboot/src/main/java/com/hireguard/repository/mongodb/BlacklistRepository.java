package com.hireguard.repository.mongodb;

import com.hireguard.model.mongodb.BlacklistEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB Repository: BlacklistRepository
 * Manages queries against the `blacklist_entries` document collection.
 */
@Repository
public interface BlacklistRepository extends MongoRepository<BlacklistEntry, String> {

    Optional<BlacklistEntry> findFirstByTypeAndValueIgnoreCaseAndActiveTrue(String type, String value);

    List<BlacklistEntry> findByActiveTrue();

    List<BlacklistEntry> findByTypeAndActiveTrue(String type);
}
