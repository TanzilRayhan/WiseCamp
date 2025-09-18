package com.wisecamp.api.service;

import com.wisecamp.api.dto.ProjectDtos.*;
import com.wisecamp.api.model.Project;
import com.wisecamp.api.model.Board;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.ProjectRepository;
import com.wisecamp.api.repository.BoardRepository;
import com.wisecamp.api.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {
        private final ProjectRepository projectRepository;
        private final UserRepository userRepository;
        private final BoardRepository boardRepository;

        public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                        BoardRepository boardRepository) {
                this.projectRepository = projectRepository;
                this.userRepository = userRepository;
                this.boardRepository = boardRepository;
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
                project.setCreatedAt(LocalDateTime.now());
                project.setUpdatedAt(LocalDateTime.now());

                Project savedProject = projectRepository.save(project);
                return new ProjectResponse(
                                savedProject.getId(),
                                savedProject.getName(),
                                savedProject.getDescription(),
                                savedProject.getOwner().getId(),
                                savedProject.getOwner().getName(),
                                savedProject.getMembers().size(),
                                savedProject.getBoards() != null ? savedProject.getBoards().size() : 0,
                                savedProject.getCreatedAt());
        }

        public List<ProjectResponse> getUserProjects() {
                User currentUser = getCurrentUser();
                return projectRepository.findByMembers_Id(currentUser.getId()).stream()
                                .map(p -> new ProjectResponse(
                                                p.getId(),
                                                p.getName(),
                                                p.getDescription(),
                                                p.getOwner().getId(),
                                                p.getOwner().getName(),
                                                p.getMembers().size(),
                                                p.getBoards() != null ? p.getBoards().size() : 0,
                                                p.getCreatedAt()))
                                .collect(Collectors.toList());
        }

        public ProjectDetailResponse getProjectById(Long projectId) {
                User currentUser = getCurrentUser();
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                // Check if user has access to this project
                if (project.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
                        throw new AccessDeniedException("Access denied to this project");
                }

                List<ProjectMemberResponse> memberResponses = project.getMembers().stream()
                                .map(member -> new ProjectMemberResponse(
                                                member.getId(),
                                                member.getName(),
                                                member.getEmail(),
                                                member.getUsername(),
                                                member.getAvatarUrl(),
                                                member.getCreatedAt() // Using createdAt as joinedAt for now
                                ))
                                .collect(Collectors.toList());

                List<ProjectBoardResponse> boardResponses = project.getBoards() != null
                                ? project.getBoards().stream()
                                                .map(board -> new ProjectBoardResponse(
                                                                board.getId(),
                                                                board.getName(),
                                                                board.getDescription(),
                                                                board.isPublic(),
                                                                board.getCreatedAt()))
                                                .collect(Collectors.toList())
                                : List.of();

                return new ProjectDetailResponse(
                                project.getId(),
                                project.getName(),
                                project.getDescription(),
                                project.getOwner().getId(),
                                project.getOwner().getName(),
                                memberResponses,
                                boardResponses,
                                project.getCreatedAt(),
                                project.getUpdatedAt());
        }

        public ProjectResponse updateProject(Long projectId, UpdateProjectRequest request) {
                User currentUser = getCurrentUser();
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                // Check if user is the owner
                if (!project.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only project owner can update the project");
                }

                project.setName(request.name());
                project.setDescription(request.description());

                Project savedProject = projectRepository.save(project);

                return new ProjectResponse(
                                savedProject.getId(),
                                savedProject.getName(),
                                savedProject.getDescription(),
                                savedProject.getOwner().getId(),
                                savedProject.getOwner().getName(),
                                savedProject.getMembers().size(),
                                savedProject.getBoards() != null ? savedProject.getBoards().size() : 0,
                                savedProject.getCreatedAt());
        }

        public void deleteProject(Long projectId) {
                User currentUser = getCurrentUser();
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                // Check if user is the owner
                if (!project.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only project owner can delete the project");
                }

                projectRepository.delete(project);
        }

        @Transactional
        public void addMember(Long projectId, AddMemberRequest request) {
                User currentUser = getCurrentUser();
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                // Check if user is the owner
                if (!project.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only project owner can add members");
                }

                User newMember = userRepository.findByEmail(request.email())
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found with email: " + request.email()));
                if (project.getMembers().stream().noneMatch(member -> member.getId().equals(newMember.getId()))) {
                        project.getMembers().add(newMember);
                        // Also add the new member to all boards within this project
                        List<Board> boards = boardRepository.findByProjectId(projectId);
                        for (Board board : boards) {
                                board.getMembers().add(newMember);
                                // No need to call save on each board, @Transactional will handle it
                                // if the relationship is correctly configured. But being explicit is safer.
                                boardRepository.save(board);
                        }
                        projectRepository.save(project);
                }
        }

        @Transactional
        public void removeMember(Long projectId, Long userId) {
                User currentUser = getCurrentUser();
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                // Check if user is the owner
                if (!project.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only project owner can remove members");
                }

                // Prevent removing the owner
                if (project.getOwner().getId().equals(userId)) {
                        throw new RuntimeException("Cannot remove project owner");
                }

                User memberToRemove = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (project.getMembers().remove(memberToRemove)) {
                        // Also remove the member from all boards within this project
                        List<Board> boards = boardRepository.findByProjectId(projectId);
                        for (Board board : boards) {
                                board.getMembers().remove(memberToRemove);
                                boardRepository.save(board);
                        }
                        projectRepository.save(project);
                }
        }
}