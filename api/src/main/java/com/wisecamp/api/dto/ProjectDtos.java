package com.wisecamp.api.dto;

import com.wisecamp.api.model.Role;
import java.time.LocalDateTime;
import java.util.List;

public class ProjectDtos {

    public record CreateProjectRequest(String name, String description) {
    }

    public record UpdateProjectRequest(String name, String description) {
    }

    public record ProjectResponse(
            Long id,
            String name,
            String description,
            Long ownerId,
            String ownerName,
            int memberCount,
            int boardCount,
            LocalDateTime createdAt) {
    }

    public record ProjectDetailResponse(
            Long id,
            String name,
            String description,
            Long ownerId,
            String ownerName,
            List<ProjectMemberResponse> members,
            List<ProjectBoardResponse> boards,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record ProjectMemberResponse(
            Long id,
            String name,
            String email,
            String username,
            Role role,
            String avatarUrl,
            LocalDateTime joinedAt) {
    }

    public record ProjectBoardResponse(
            Long id,
            String name,
            String description,
            boolean isPublic,
            LocalDateTime createdAt) {
    }

    public record AddMemberRequest(String email) {
    }
}