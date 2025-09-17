package com.wisecamp.api.controller;

import com.wisecamp.api.dto.ProjectDtos.*;
import com.wisecamp.api.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@PreAuthorize("isAuthenticated()")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects() {
        return ResponseEntity.ok(projectService.getUserProjects());
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDetailResponse> getProjectById(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long projectId,
            @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(projectId, request));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<Void> addProjectMember(
            @PathVariable Long projectId,
            @RequestBody AddMemberRequest request) {
        projectService.addMember(projectId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<Void> removeProjectMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        projectService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }
}