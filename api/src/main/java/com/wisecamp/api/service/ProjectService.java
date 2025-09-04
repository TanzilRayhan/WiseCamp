package com.wisecamp.api.service;

import com.wisecamp.api.dto.ProjectDtos.*;
import com.wisecamp.api.model.Project;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.ProjectRepository;
import com.wisecamp.api.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public ProjectResponse createProject(CreateProjectRequest request) {
        User currentUser = getCurrentUser();
        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setOwner(currentUser);
        project.setMembers(Set.of(currentUser)); // Owner is also a member

        Project savedProject = projectRepository.save(project);
        return new ProjectResponse(savedProject.getId(), savedProject.getName(), savedProject.getDescription(), savedProject.getOwner().getId());
    }

    public List<ProjectResponse> getUserProjects() {
        User currentUser = getCurrentUser();
        return projectRepository.findByMembers_Id(currentUser.getId()).stream()
                .map(p -> new ProjectResponse(p.getId(), p.getName(), p.getDescription(), p.getOwner().getId()))
                .collect(Collectors.toList());
    }
}