package com.wisecamp.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BoardDtos {
        public record BoardRequest(String name, String description, Boolean isPublic, Long projectId) {
        }

        public record BoardSummaryResponse(
                        Long id,
                        String name,
                        String description,
                        Boolean isPublic,
                        Integer memberCount,
                        Integer cardCount,
                        LocalDateTime createdAt) {
        }

        public record FullBoardResponse(
                        Long id,
                        String name,
                        String description,
                        Boolean isPublic,
                        Long ownerId,
                        List<ColumnResponse> columns,
                        LocalDateTime createdAt,
                        LocalDateTime updatedAt) {
        }

        public record ColumnResponse(
                        Long id,
                        String name,
                        Long position,
                        List<CardResponse> cards) {
        }

        public record CardResponse(
                        Long id,
                        String name,
                        String title,
                        String description,
                        Integer position,
                        Boolean isActive,
                        LocalDateTime createdAt) {
        }
}
