package com.wisecamp.api.dto;

import com.wisecamp.api.model.Role;

public class AuthDtos {
    public record RegisterRequest(String name, String username, String email, String password, Role role) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record UserResponse(Long id, String name, String email, String username, Role role, String avatarUrl) {
    }

    public record AuthResponse(String token, UserResponse user) {
    }
}