package com.wisecamp.api.dto;

public class ProjectDtos {
    public record CreateProjectRequest(String name, String description) {}
    public record ProjectResponse(Long id, String name, String description, Long ownerId) {}
}