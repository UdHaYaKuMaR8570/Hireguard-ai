package com.hireguard.controller;

import com.hireguard.dto.request.ComplaintRequest;
import com.hireguard.dto.response.ComplaintResponse;
import com.hireguard.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller: ComplaintController
 * Exposes endpoints for submitting evidence-backed scam complaints (`POST /api/complaints`),
 * listing complaints for an employer (`GET /api/company/{id}/complaints`), and fetching individual
 * complaint reports (`GET /api/complaints/{id}`).
 */
@RestController
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping("/api/complaints")
    public ResponseEntity<ComplaintResponse> submitComplaint(@Valid @RequestBody ComplaintRequest request,
                                                             Authentication authentication) {
        ComplaintResponse response = complaintService.submitComplaint(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/company/{id}/complaints")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByCompanyId(@PathVariable String id) {
        List<ComplaintResponse> responses = complaintService.getComplaintsByCompanyId(id);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/api/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable String id) {
        ComplaintResponse response = complaintService.getComplaintById(id);
        return ResponseEntity.ok(response);
    }
}
