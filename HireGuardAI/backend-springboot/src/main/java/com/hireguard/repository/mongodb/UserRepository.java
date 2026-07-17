package com.hireguard.repository.mongodb;

import com.hireguard.model.mongodb.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data MongoDB Repository for User document entities.
 * Extends MongoRepository to inherit CRUD operations and query method derivation.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
