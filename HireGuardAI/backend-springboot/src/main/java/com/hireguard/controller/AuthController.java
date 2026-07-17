package com.hireguard.controller;

import com.hireguard.dto.request.LoginRequest;
import com.hireguard.dto.request.RegisterRequest;
import com.hireguard.dto.response.AuthResponse;
import com.hireguard.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller: AuthController
 * Exposes endpoints for user registration (`POST /api/auth/register`), login (`POST /api/auth/login`),
 * and profile retrieval (`GET /api/auth/me`).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        AuthResponse response = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
