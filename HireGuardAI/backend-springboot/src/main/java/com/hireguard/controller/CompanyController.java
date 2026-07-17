package com.hireguard.controller;

import com.hireguard.dto.request.CompanyVerifyRequest;
import com.hireguard.dto.response.CompanyResponse;
import com.hireguard.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller: CompanyController
 * Exposes endpoints for employer verification onboarding (`POST /api/company/verify`),
 * company details retrieval (`GET /api/company/{id}`), and name searching (`GET /api/company/search?name=`).
 */
@RestController
@RequestMapping("/api/company")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/verify")
    public ResponseEntity<CompanyResponse> verifyCompany(@Valid @RequestBody CompanyVerifyRequest request) {
        CompanyResponse response = companyService.verifyCompany(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable String id) {
        CompanyResponse response = companyService.getCompanyById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<CompanyResponse>> searchCompanies(@RequestParam(required = false) String name) {
        List<CompanyResponse> responses = companyService.searchCompaniesByName(name);
        return ResponseEntity.ok(responses);
    }
}
