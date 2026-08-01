package com.hireguard.model.mongodb;

import com.hireguard.enums.RiskLevel;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;
import java.util.List;

/**
 * Why MongoDB: Pre-aggregated report snapshot for fast retrieval, 
 * avoiding complex graph traversals at read-time for standard views.
 */
@Document(collection = "trust_reports")
public class TrustReport {
    @Id
    private String id;
    private String companyId;
    private Double trustScore;
    
    @Field(targetType = FieldType.STRING)
    private RiskLevel riskLevel;
    
    private List<String> reasons;
    private List<String> graphRiskFactors;
    private Instant generatedAt;

    public TrustReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public Double getTrustScore() { return trustScore; }
    public void setTrustScore(Double trustScore) { this.trustScore = trustScore; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }
    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
    public List<String> getGraphRiskFactors() { return graphRiskFactors; }
    public void setGraphRiskFactors(List<String> graphRiskFactors) { this.graphRiskFactors = graphRiskFactors; }
    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
}
