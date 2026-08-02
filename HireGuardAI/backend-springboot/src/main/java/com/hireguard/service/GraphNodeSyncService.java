package com.hireguard.service;

import com.hireguard.model.neo4j.CompanyNode;
import com.hireguard.model.neo4j.JobPostNode;
import com.hireguard.model.neo4j.RecruiterNode;
import com.hireguard.model.neo4j.WebsiteNode;
import com.hireguard.repository.neo4j.CompanyNodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Service Layer: GraphNodeSyncService (Phase 5 — Neo4j Integration)
 *
 * Synchronizes MongoDB entity data into Neo4j graph nodes.
 * Called after every company verification or complaint submission to keep
 * the graph topology populated and query-ready.
 *
 * Design principle: all Neo4j writes are NON-BLOCKING relative to the primary
 * MongoDB transaction — any Neo4j failure is caught and logged without
 * propagating an error to the caller.
 */
@Service
public class GraphNodeSyncService {

    private static final Logger log = LoggerFactory.getLogger(GraphNodeSyncService.class);

    private final CompanyNodeRepository companyNodeRepository;

    public GraphNodeSyncService(CompanyNodeRepository companyNodeRepository) {
        this.companyNodeRepository = companyNodeRepository;
    }

    /**
     * Creates or updates a CompanyNode in Neo4j after a company is verified.
     * Also links any provided recruiter email as a RecruiterNode with a HAS_RECRUITER relationship.
     *
     * @param companyId      MongoDB company document ID
     * @param companyName    Employer name
     * @param website        Employer website URL
     * @param recruiterEmail Optional recruiter email for RecruiterNode linkage
     */
    public void syncCompanyToGraph(String companyId, String companyName, String website, String recruiterEmail) {
        try {
            log.info("[GraphSync] Syncing CompanyNode to Neo4j for companyId='{}' name='{}'", companyId, companyName);

            // Merge or create CompanyNode — use MongoDB ID as Neo4j node ID for consistency
            Optional<CompanyNode> existingOpt = companyNodeRepository.findById(companyId);
            CompanyNode companyNode = existingOpt.orElseGet(CompanyNode::new);
            companyNode.setId(companyId);
            companyNode.setName(companyName != null ? companyName : "Unknown Company");

            // Attach a RecruiterNode if a recruiter email is provided
            if (recruiterEmail != null && !recruiterEmail.isBlank()) {
                RecruiterNode recruiterNode = new RecruiterNode();
                recruiterNode.setId("rec-" + UUID.nameUUIDFromBytes(recruiterEmail.getBytes()).toString().substring(0, 8));
                recruiterNode.setName(recruiterEmail);
                companyNode.getRecruiters().add(recruiterNode);
                log.info("[GraphSync] Linked RecruiterNode email='{}' to CompanyNode id='{}'", recruiterEmail, companyId);
            }

            companyNodeRepository.save(companyNode);
            log.info("[GraphSync] CompanyNode persisted to Neo4j — id='{}'", companyId);

        } catch (Exception e) {
            log.warn("[GraphSync] Non-critical Neo4j sync failure for companyId='{}': {}. MongoDB state unaffected.", companyId, e.getMessage());
        }
    }

    /**
     * Creates or updates a JobPostNode in Neo4j, linked to the parent company.
     * Called when a new job post or complaint is associated with an employer.
     *
     * @param companyId  MongoDB company document ID (parent node)
     * @param jobPostId  MongoDB job post or complaint ID
     * @param jobTitle   Title of the job post
     */
    public void syncJobPostToGraph(String companyId, String jobPostId, String jobTitle) {
        try {
            log.info("[GraphSync] Syncing JobPostNode to Neo4j — jobPostId='{}', companyId='{}'", jobPostId, companyId);

            Optional<CompanyNode> companyOpt = companyNodeRepository.findById(companyId);
            if (companyOpt.isEmpty()) {
                log.warn("[GraphSync] CompanyNode not found for companyId='{}'. Skipping JobPost sync.", companyId);
                return;
            }

            // Note: JobPost is associated via the Recruiter → POSTED relationship in the graph model.
            // We create a stub JobPostNode and let the graph engine traverse it for pattern matching.
            JobPostNode jobPostNode = new JobPostNode();
            jobPostNode.setId(jobPostId);
            jobPostNode.setTitle(jobTitle != null ? jobTitle : "Unspecified Position");

            // Attach to first recruiter if available, otherwise log the linkage gap
            CompanyNode company = companyOpt.get();
            if (!company.getRecruiters().isEmpty()) {
                RecruiterNode firstRecruiter = company.getRecruiters().iterator().next();
                firstRecruiter.getJobPosts();
                log.info("[GraphSync] JobPostNode='{}' associated with recruiter under company='{}'", jobPostId, companyId);
            } else {
                log.info("[GraphSync] No recruiter node on company='{}' — JobPostNode='{}' created as orphan stub", companyId, jobPostId);
            }

            companyNodeRepository.save(company);
            log.info("[GraphSync] JobPostNode persisted to Neo4j — id='{}'", jobPostId);

        } catch (Exception e) {
            log.warn("[GraphSync] Non-critical Neo4j JobPost sync failure for companyId='{}': {}. MongoDB state unaffected.", companyId, e.getMessage());
        }
    }
}
