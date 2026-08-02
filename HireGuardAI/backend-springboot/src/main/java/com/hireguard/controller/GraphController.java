package com.hireguard.controller;

import com.hireguard.model.neo4j.CompanyNode;
import com.hireguard.model.neo4j.RecruiterNode;
import com.hireguard.repository.neo4j.CompanyNodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * REST Controller: GraphController (Phase 5 — Neo4j Graph Topology Visualization)
 *
 * Exposes graph topology data derived from Neo4j for the React Flow visualization
 * component in the frontend. Returns serialized node and edge JSON compatible
 * with the @xyflow/react library's node/edge schema.
 *
 * Endpoint:
 *   GET /api/graph/{id}/topology — Returns React Flow compatible nodes & edges for company
 */
@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private static final Logger log = LoggerFactory.getLogger(GraphController.class);

    private final CompanyNodeRepository companyNodeRepository;

    public GraphController(CompanyNodeRepository companyNodeRepository) {
        this.companyNodeRepository = companyNodeRepository;
    }

    /**
     * Returns Neo4j graph topology data serialized for React Flow rendering.
     * If the company node does not exist in Neo4j yet, returns a baseline
     * single-node placeholder so the UI always renders something meaningful.
     *
     * GET /api/graph/{id}/topology
     */
    @GetMapping("/{id}/topology")
    public ResponseEntity<Map<String, Object>> getCompanyGraphTopology(@PathVariable String id) {
        log.info("GET /api/graph/{}/topology — Fetching Neo4j graph topology", id);

        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();

        try {
            Optional<CompanyNode> companyNodeOpt = companyNodeRepository.findById(id);

            if (companyNodeOpt.isPresent()) {
                CompanyNode company = companyNodeOpt.get();

                // Add the central company node
                nodes.add(buildNode(
                        "company-" + id,
                        "Company: " + truncate(company.getName(), 30),
                        250, 60,
                        "#0284c7", "#fff", "#38bdf8"
                ));

                // Add recruiter nodes and edges
                Set<RecruiterNode> recruiters = company.getRecruiters();
                int recruiterX = 80;
                int recruiterIndex = 0;

                for (RecruiterNode recruiter : recruiters) {
                    String nodeId = "recruiter-" + recruiter.getId();
                    nodes.add(buildNode(
                            nodeId,
                            "Recruiter: " + truncate(recruiter.getName(), 28),
                            recruiterX + (recruiterIndex * 200), 220,
                            "#1e293b", "#94a3b8", "#475569"
                    ));
                    edges.add(buildEdge(
                            "e-company-recruiter-" + recruiterIndex,
                            "company-" + id, nodeId,
                            "HAS_RECRUITER", "#38bdf8", false
                    ));
                    recruiterIndex++;
                }

                // If no recruiters — add info node
                if (recruiters.isEmpty()) {
                    nodes.add(buildNode(
                            "info-no-recruiter",
                            "No recruiter nodes linked yet",
                            80, 220,
                            "#0f172a", "#64748b", "#334155"
                    ));
                    edges.add(buildEdge("e-company-info", "company-" + id, "info-no-recruiter", "PENDING", "#64748b", true));
                }

                log.info("[GraphController] Topology built from Neo4j: {} nodes, {} edges for companyId={}", nodes.size(), edges.size(), id);

            } else {
                // Company node not yet in Neo4j — return informational stub
                log.info("[GraphController] CompanyNode not found in Neo4j for id={}. Returning stub topology.", id);
                nodes.add(buildNode("company-" + id, "Company ID: " + truncate(id, 12), 250, 60, "#0284c7", "#fff", "#38bdf8"));
                nodes.add(buildNode("pending-sync", "Graph Sync Pending — Verify company to populate", 200, 220, "#1e293b", "#94a3b8", "#475569"));
                edges.add(buildEdge("e-pending", "company-" + id, "pending-sync", "SYNC_NEEDED", "#64748b", true));
            }

        } catch (Exception e) {
            log.warn("[GraphController] Neo4j topology query failed for id={}: {}. Returning fallback stub.", id, e.getMessage());
            nodes.add(buildNode("company-" + id, "Graph Engine: Connection Notice", 250, 60, "#0284c7", "#fff", "#38bdf8"));
            nodes.add(buildNode("neo4j-notice", "Neo4j: " + e.getMessage().substring(0, Math.min(e.getMessage().length(), 50)), 200, 220, "#450a0a", "#fca5a5", "#f87171"));
            edges.add(buildEdge("e-notice", "company-" + id, "neo4j-notice", "ERROR", "#f87171", true));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("companyId", id);
        result.put("nodes", nodes);
        result.put("edges", edges);
        result.put("isLiveData", companyNodeRepository.existsById(id));

        return ResponseEntity.ok(result);
    }

    // =========================================================================
    // Private builder helpers — produce React Flow compatible node/edge maps
    // =========================================================================

    private Map<String, Object> buildNode(String id, String label, int x, int y,
                                          String bgColor, String textColor, String borderColor) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", id);
        node.put("type", "default");
        Map<String, Object> data = new HashMap<>();
        data.put("label", label);
        node.put("data", data);
        Map<String, Object> position = new HashMap<>();
        position.put("x", x);
        position.put("y", y);
        node.put("position", position);
        Map<String, Object> style = new LinkedHashMap<>();
        style.put("background", bgColor);
        style.put("color", textColor);
        style.put("border", "2px solid " + borderColor);
        style.put("borderRadius", "8px");
        style.put("padding", "10px");
        style.put("fontWeight", "600");
        style.put("fontSize", "12px");
        style.put("maxWidth", "200px");
        node.put("style", style);
        return node;
    }

    private Map<String, Object> buildEdge(String id, String source, String target,
                                          String label, String strokeColor, boolean dashed) {
        Map<String, Object> edge = new LinkedHashMap<>();
        edge.put("id", id);
        edge.put("source", source);
        edge.put("target", target);
        edge.put("label", label);
        edge.put("animated", !dashed);
        Map<String, Object> style = new HashMap<>();
        style.put("stroke", strokeColor);
        if (dashed) style.put("strokeDasharray", "5,5");
        edge.put("style", style);
        return edge;
    }

    private String truncate(String s, int maxLen) {
        if (s == null) return "Unknown";
        return s.length() > maxLen ? s.substring(0, maxLen) + "…" : s;
    }
}
