package com.hireguard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB Configuration
 * Enables auditing to automatically populate @CreatedDate and @LastModifiedDate.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
