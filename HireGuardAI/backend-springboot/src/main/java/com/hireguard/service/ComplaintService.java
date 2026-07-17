package com.hireguard.service;

import com.hireguard.dto.request.ComplaintRequest;
import com.hireguard.dto.response.ComplaintResponse;
import com.hireguard.exception.InvalidRequestException;
import com.hireguard.exception.ResourceNotFoundException;
import com.hireguard.model.mongodb.Complaint;
import com.hireguard.model.mongodb.User;
import com.hireguard.repository.mongodb.CompanyRepository;
import com.hireguard.repository.mongodb.ComplaintRepository;
import com.hireguard.repository.mongodb.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service Layer: ComplaintService
 * Encapsulates submission and retrieval of evidence-backed scam complaints.
 */
@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, CompanyRepository companyRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    public ComplaintResponse submitComplaint(ComplaintRequest request, String authenticatedUserEmail) {
        if (!companyRepository.existsById(request.getCompanyId())) {
            throw new ResourceNotFoundException("Target company not found with ID: " + request.getCompanyId());
        }

        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for email: " + authenticatedUserEmail));

        Complaint.ComplaintReason reasonEnum;
        try {
            reasonEnum = Complaint.ComplaintReason.valueOf(request.getReason().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("Invalid complaint reason enum: " + request.getReason());
        }

        Complaint complaint = new Complaint();
        complaint.setId("cpl-" + UUID.randomUUID().toString().substring(0, 8));
        complaint.setCompanyId(request.getCompanyId());
        complaint.setUserId(user.getId());
        complaint.setReason(reasonEnum);
        complaint.setProof(request.getProof() != null ? request.getProof() : "No external proof link provided.");
        complaint.setDescription(request.getDescription());
        complaint.setStatus(Complaint.ComplaintStatus.SUBMITTED);
        complaint.setCreatedAt(Instant.now());

        Complaint savedComplaint = complaintRepository.save(complaint);
        return mapToResponse(savedComplaint);
    }

    public List<ComplaintResponse> getComplaintsByCompanyId(String companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with ID: " + companyId);
        }

        return complaintRepository.findByCompanyId(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(String id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));
        return mapToResponse(complaint);
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getCompanyId(),
                complaint.getUserId(),
                complaint.getReason() != null ? complaint.getReason().name() : "OTHER",
                complaint.getProof(),
                complaint.getDescription(),
                complaint.getStatus() != null ? complaint.getStatus().name() : "SUBMITTED",
                complaint.getCreatedAt()
        );
    }
}
