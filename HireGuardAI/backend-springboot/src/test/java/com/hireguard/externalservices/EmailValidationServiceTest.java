package com.hireguard.externalservices;

import com.hireguard.dto.response.EmailValidationResult;
import com.hireguard.repository.mongodb.ComplaintRepository;
import com.hireguard.repository.neo4j.RecruiterGraphRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class EmailValidationServiceTest {

    private EmailValidationService emailValidationService;
    private RecruiterGraphRepository recruiterGraphRepository;
    private ComplaintRepository complaintRepository;

    @BeforeEach
    void setUp() {
        recruiterGraphRepository = Mockito.mock(RecruiterGraphRepository.class);
        complaintRepository = Mockito.mock(ComplaintRepository.class);
        emailValidationService = new EmailValidationService(recruiterGraphRepository, complaintRepository);
    }

    @Test
    void testValidMatchingEmailDomain() {
        EmailValidationResult result = emailValidationService.validateRecruiterEmail("hr@google.com", "google.com", "c123");
        assertTrue(result.isSyntaxValid());
        assertTrue(result.isDomainMatch());
        assertFalse(result.isFreeEmailProvider());
        assertFalse(result.isPossibleDomainMismatch());
        assertEquals("LOW", result.getRiskLevel());
    }

    @Test
    void testFreeEmailProvider() {
        EmailValidationResult result = emailValidationService.validateRecruiterEmail("recruiter@gmail.com", "google.com", "c123");
        assertTrue(result.isSyntaxValid());
        assertFalse(result.isDomainMatch());
        assertTrue(result.isFreeEmailProvider());
        assertEquals("MEDIUM", result.getRiskLevel());
    }

    @Test
    void testTypoSquattedDomainMismatch() {
        EmailValidationResult result = emailValidationService.validateRecruiterEmail("hr@cornpany.com", "company.com", "c123");
        assertTrue(result.isSyntaxValid());
        assertFalse(result.isDomainMatch());
        assertTrue(result.isPossibleDomainMismatch());
        assertEquals("HIGH", result.getRiskLevel());
    }

    @Test
    void testInvalidEmailSyntax() {
        EmailValidationResult result = emailValidationService.validateRecruiterEmail("invalid-email-string", "company.com", "c123");
        assertFalse(result.isSyntaxValid());
        assertEquals("HIGH", result.getRiskLevel());
    }
}
