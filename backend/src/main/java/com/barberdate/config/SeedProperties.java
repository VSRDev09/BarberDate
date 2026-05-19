package com.barberdate.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.seed")
public record SeedProperties(
    String adminName,
    String adminUsername,
    String adminPassword
) {
}
