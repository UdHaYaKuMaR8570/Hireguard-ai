package com.hireguard.client;

import com.hireguard.config.AiServiceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * HTTP Client: AiServiceClient
 * Communicates with the standalone Python FastAPI AI microservice container over Docker networking (`http://ai-service:8001/predict`).
 * Implements GRACEFUL DEGRADATION: If the AI microservice container is offline, unreachable, or times out,
 * this client catches the exception, logs a warning, and returns a clean fallback result (degraded state)
 * without crashing the backend or fabricating fake ML probability numbers.
 */
@Component
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;
    private final AiServiceConfig aiServiceConfig;

    public AiServiceClient(RestTemplate aiRestTemplate, AiServiceConfig aiServiceConfig) {
        this.restTemplate = aiRestTemplate;
        this.aiServiceConfig = aiServiceConfig;
    }

    public AiPredictionResult predictScam(String jobDescription, String companyName, String recruiterEmail) {
        String endpoint = aiServiceConfig.getAiServiceUrl() + "/predict";

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("jobDescription", (jobDescription != null && !jobDescription.isBlank()) ? jobDescription : "Standard employment profile lookup.");
        requestPayload.put("companyName", companyName != null ? companyName : "");
        requestPayload.put("recruiterEmail", recruiterEmail != null ? recruiterEmail : "");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                int scamProb = ((Number) body.getOrDefault("scamProbability", 0)).intValue();
                String riskLevel = (String) body.getOrDefault("riskLevel", "LOW");
                List<String> reasons = (List<String>) body.getOrDefault("reasons", Collections.emptyList());

                return new AiPredictionResult(true, scamProb, riskLevel, reasons);
            }
        } catch (Exception e) {
            log.warn("GRACEFUL DEGRADATION: Failed to reach Python AI service at '{}': {}. Proceeding without AI penalty.", endpoint, e.getMessage());
        }

        // Fallback for degraded state (AI Service unavailable)
        return new AiPredictionResult(
                false,
                0,
                "DEGRADED",
                Collections.singletonList("Python AI Service notice: NLP container unreachable or degraded. AI text probability scan skipped.")
        );
    }

    public static class AiPredictionResult {
        private final boolean serviceAvailable;
        private final int scamProbability;
        private final String riskLevel;
        private final List<String> reasons;

        public AiPredictionResult(boolean serviceAvailable, int scamProbability, String riskLevel, List<String> reasons) {
            this.serviceAvailable = serviceAvailable;
            this.scamProbability = scamProbability;
            this.riskLevel = riskLevel;
            this.reasons = reasons != null ? reasons : Collections.emptyList();
        }

        public boolean isServiceAvailable() {
            return serviceAvailable;
        }

        public int getScamProbability() {
            return scamProbability;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public List<String> getReasons() {
            return reasons;
        }
    }
}
