package com.hireguard.controller;

import com.hireguard.model.mongodb.BlacklistEntry;
import com.hireguard.repository.mongodb.BlacklistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST Controller: BlacklistController
 * Admin management endpoints for active blacklist database entries.
 */
@RestController
@RequestMapping("/api/admin/blacklist")
public class BlacklistController {

    private final BlacklistRepository blacklistRepository;

    public BlacklistController(BlacklistRepository blacklistRepository) {
        this.blacklistRepository = blacklistRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<BlacklistEntry>> getAllBlacklistEntries() {
        return ResponseEntity.ok(blacklistRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BlacklistEntry> addBlacklistEntry(@RequestBody BlacklistEntry entry) {
        if (entry.getCreatedAt() == null) entry.setCreatedAt(Instant.now());
        entry.setUpdatedAt(Instant.now());
        entry.setActive(true);
        BlacklistEntry saved = blacklistRepository.save(entry);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteBlacklistEntry(@PathVariable String id) {
        blacklistRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
