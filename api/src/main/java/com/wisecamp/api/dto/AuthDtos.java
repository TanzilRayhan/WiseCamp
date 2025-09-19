package com.wisecamp.api.dto;

public class AuthDtos {
    public record RegisterRequest(String name, String username, String email, String password) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record UserResponse(Long id, String name, String email, String username) {
    }

    public record AuthResponse(String token, UserResponse user) {
    }

    public record UpdateUserRequest(String name, String username, String email) {
    }
}