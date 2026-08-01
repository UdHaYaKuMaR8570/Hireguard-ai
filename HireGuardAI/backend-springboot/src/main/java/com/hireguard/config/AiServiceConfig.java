package com.hireguard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Spring Configuration: AiServiceConfig
 * Configures RestTemplate bean with connection timeouts for communicating with the Python AI microservice container.
 * Default URL targets the Docker service name (`http://ai-service:8001`).
 */
@Configuration
public class AiServiceConfig {

    @Value("${ai.service.url:http://ai-service:8001}")
    private String aiServiceUrl;

    public String getAiServiceUrl() {
        return aiServiceUrl;
    }

    @Bean
    public RestTemplate aiRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000); // 3 seconds timeout
        factory.setReadTimeout(5000);    // 5 seconds read timeout
        return new RestTemplate(factory);
    }
}
