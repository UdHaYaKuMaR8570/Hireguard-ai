package com.hireguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point for HireGuard AI Backend.
 * Bootstraps dual-database configurations (MongoDB + Neo4j) and REST API controllers.
 */
@SpringBootApplication
public class HireGuardApplication {

    public static void main(String[] args) {
        SpringApplication.run(HireGuardApplication.class, args);
    }
}
