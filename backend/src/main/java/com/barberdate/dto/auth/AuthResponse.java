package com.barberdate.dto.auth;

public record AuthResponse(
    String token,
    Long expiresInMinutes,
    String adminName,
    String role
) {
}
