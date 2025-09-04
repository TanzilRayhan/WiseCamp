package com.wisecamp.api.dto;

import java.time.LocalDate;
import java.util.List;

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

    public record UserResponse(Long id, String name, String email) {
    }

    // --- Cards ---
    public record CardSummary(Long id, String name, LocalDate dueDate) {
    }

    public record CardResponse(Long id, String title, String description, Integer position, LocalDate dueDate) {
    }

    // --- Columns ---
    public record ColumnResponse(Long id, String name, Integer position, List<CardResponse> cards) {
    }

    // --- Boards ---
    public record BoardSummaryResponse(Long id, String name, String description) {
    }

    public record BoardRequest(String name, String description, Boolean isPublic) {
    }

    public record FullBoardResponse(Long id, String name, String description, List<UserResponse> members,
            List<ColumnResponse> columns) {
    }

}
