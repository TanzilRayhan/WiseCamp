package com.wisecamp.api.dto;

import java.time.LocalDate;

public class Dtos {

        // --- Auth ---
        public record RegisterRequest(String name, String email, String password) {
        }

        public record LoginRequest(String email, String password) {
        }

        public record AuthResponse(String token) {
        }

        public record UserSummary(Long id, String name, String avatarUrl) {
        }

        // --- Cards ---
        public record CardSummary(Long id, String name, LocalDate dueDate) {
        }
}
