package com.hireguard.model.mongodb;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * MongoDB Document Entity: ScamPattern
 * Stores comprehensive descriptions and trigger keyword arrays for known employment
 * scam archetypes used during NLP classification and explainability reporting.
 */
@Document(collection = "scam_patterns")
public class ScamPattern {

    @Id
    private String id;

    @Indexed
    private String patternName;

    private String description;

    private List<String> exampleKeywords;

    private Double severityWeight;

    public ScamPattern() {
    }

    public ScamPattern(String id, String patternName, String description, List<String> exampleKeywords, Double severityWeight) {
        this.id = id;
        this.patternName = patternName;
        this.description = description;
        this.exampleKeywords = exampleKeywords;
        this.severityWeight = severityWeight;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatternName() {
        return patternName;
    }

    public void setPatternName(String patternName) {
        this.patternName = patternName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getExampleKeywords() {
        return exampleKeywords;
    }

    public void setExampleKeywords(List<String> exampleKeywords) {
        this.exampleKeywords = exampleKeywords;
    }

    public Double getSeverityWeight() {
        return severityWeight;
    }

    public void setSeverityWeight(Double severityWeight) {
        this.severityWeight = severityWeight;
    }

    @Override
    public String toString() {
        return "ScamPattern{" +
                "id='" + id + '\'' +
                ", patternName='" + patternName + '\'' +
                ", severityWeight=" + severityWeight +
                '}';
    }
}
