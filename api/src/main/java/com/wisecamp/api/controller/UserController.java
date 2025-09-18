package com.wisecamp.api.controller;

import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wisecamp.api.dto.AuthDtos.UserResponse;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<java.util.List<UserResponse>> listUsers() {
        java.util.List<UserResponse> users = userRepository.findAll().stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getUsername(),
                        user.getRole(),
                        user.getAvatarUrl()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        UserResponse dto = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getAvatarUrl());
        return ResponseEntity.ok(dto);
    }

    public record UpdateUserRequest(String name, String username, String email) {
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@AuthenticationPrincipal UserDetails principal,
            @RequestBody UpdateUserRequest request) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (request.name() != null)
            user.setName(request.name());
        if (request.username() != null)
            user.setUsername(request.username());
        if (request.email() != null)
            user.setEmail(request.email());
        // role/avatar updates intentionally omitted for safety
        userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getUsername(), user.getRole(),
                user.getAvatarUrl()));
    }
}
