package com.barberdate.service;

import com.barberdate.config.JwtProperties;
import com.barberdate.domain.entity.Admin;
import com.barberdate.dto.auth.AuthResponse;
import com.barberdate.dto.auth.LoginRequest;
import com.barberdate.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(
        AuthenticationManager authenticationManager,
        JwtService jwtService,
        JwtProperties jwtProperties
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    public AuthResponse login(LoginRequest request) {
        Admin admin = (Admin) authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        ).getPrincipal();

        return new AuthResponse(
            jwtService.generateToken(admin),
            jwtProperties.expirationMinutes(),
            admin.getName(),
            admin.getRole().name()
        );
    }
}
