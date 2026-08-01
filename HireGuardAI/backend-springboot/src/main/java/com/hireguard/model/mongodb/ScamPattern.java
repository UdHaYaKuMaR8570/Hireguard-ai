package com.hireguard.model.mongodb;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "scam_patterns")
public class ScamPattern {
    @Id
    private String id;
    private String patternName;
    private String description;
    private List<String> exampleKeywords;

    public ScamPattern() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPatternName() { return patternName; }
    public void setPatternName(String patternName) { this.patternName = patternName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getExampleKeywords() { return exampleKeywords; }
    public void setExampleKeywords(List<String> exampleKeywords) { this.exampleKeywords = exampleKeywords; }
}
