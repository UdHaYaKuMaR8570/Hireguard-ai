package com.hireguard.controller;

import com.hireguard.dto.response.CompanyResponse;
import com.hireguard.dto.response.ComplaintResponse;
import com.hireguard.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST Controller: AdminController (Phase 2)
 *
 * Exposes admin-level aggregate endpoints for the HireGuard AI Admin Dashboard.
 * All routes under /api/admin/** require ADMIN role JWT authorization.
 *
 * Endpoints:
 *   GET /api/admin/stats       — Platform-wide summary statistics
 *   GET /api/admin/companies   — All registered company documents
 *   GET /api/admin/complaints  — All submitted complaint reports
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Returns aggregate platform statistics for the admin dashboard.
     * Includes total companies, complaints, verification breakdown, and open complaint count.
     *
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        log.info("GET /api/admin/stats — Fetching platform-wide aggregated statistics");
        Map<String, Object> stats = adminService.getPlatformStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Returns all indexed employer company documents with embedded trust score summaries.
     *
     * GET /api/admin/companies
     */
    @GetMapping("/companies")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        log.info("GET /api/admin/companies — Admin fetching full company index");
        List<CompanyResponse> companies = adminService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    /**
     * Returns all submitted scam complaint reports across the platform.
     *
     * GET /api/admin/complaints
     */
    @GetMapping("/complaints")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        log.info("GET /api/admin/complaints — Admin fetching full complaint queue");
        List<ComplaintResponse> complaints = adminService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }
}
