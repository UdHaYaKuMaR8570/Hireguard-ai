package com.hireguard.service;

import com.hireguard.dto.request.LoginRequest;
import com.hireguard.dto.request.RegisterRequest;
import com.hireguard.dto.response.AuthResponse;
import com.hireguard.exception.InvalidRequestException;
import com.hireguard.exception.ResourceNotFoundException;
import com.hireguard.model.mongodb.User;
import com.hireguard.repository.mongodb.UserRepository;
import com.hireguard.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * Service Layer: UserService
 * Encapsulates authentication, user registration with BCrypt hashing, and JWT token issuance.
 * Follows strict layering and converts internal entities into safe DTOs.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidRequestException("User already exists with email: " + request.getEmail());
        }

        User.Role role = User.Role.JOB_SEEKER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidRequestException("Invalid role specified: " + request.getRole());
            }
        }

        User user = new User();
        user.setId("usr-" + UUID.randomUUID().toString().substring(0, 8));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name(), savedUser.getCreatedAt());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password credentials");
        }

        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            throw new InvalidRequestException("Account is suspended. Please contact platform administrators.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getCreatedAt());
    }

    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for email: " + email));

        return new AuthResponse(null, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getCreatedAt());
    }
}
