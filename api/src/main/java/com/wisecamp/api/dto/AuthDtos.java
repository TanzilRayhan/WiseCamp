package com.wisecamp.api.dto;

import com.wisecamp.api.model.Role;

public class AuthDtos {
    public record RegisterRequest(String username, String email, String password, Role role) {}
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token) {}
}