package com.wisecamp.api.service;

import com.wisecamp.api.dto.Dtos.*;
import com.wisecamp.api.model.Board;
import com.wisecamp.api.model.Project;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.BoardRepository;
import com.wisecamp.api.repository.ProjectRepository;
import com.wisecamp.api.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public BoardService(BoardRepository boardRepository, UserRepository userRepository,
            ProjectRepository projectRepository) {
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<BoardSummaryResponse> getBoardsForCurrentUser() {
        User currentUser = getCurrentUser();
        List<Board> boards = boardRepository.findByMembers_Id(currentUser.getId());
        return boards.stream()
                .map(board -> new BoardSummaryResponse(
                        board.getId(),
                        board.getName(),
                        board.getDescription(),
                        board.getIsPublic(),
                        board.getOwner().getId(),
                        board.getOwner().getName(),
                        board.getMembers().size(),
                        board.getColumns() != null ? board.getColumns().size() : 0,
                        board.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public FullBoardResponse createBoard(BoardRequest request) {
        User currentUser = getCurrentUser();

        Board board = new Board();
        board.setName(request.name());
        board.setDescription(request.description());
        board.setIsPublic(request.isPublic());
        board.setOwner(currentUser);
        board.setMembers(new HashSet<>());
        board.getMembers().add(currentUser);

        // If projectId is provided, associate with project
        if (request.projectId() != null) {
            Project project = projectRepository.findById(request.projectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Check if user has access to the project
            if (!project.getMembers().contains(currentUser)) {
                throw new AccessDeniedException("Access denied to this project");
            }

            board.setProject(project);
        }

        Board savedBoard = boardRepository.save(board);
        return convertToFullBoardResponse(savedBoard);
    }

    public FullBoardResponse getBoardById(Long boardId) {
        User currentUser = getCurrentUser();
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // Check access
        if (!board.getMembers().contains(currentUser)) {
            throw new AccessDeniedException("Access denied to this board");
        }

        return convertToFullBoardResponse(board);
    }

    public FullBoardResponse updateBoard(Long boardId, BoardRequest request) {
        User currentUser = getCurrentUser();
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // Check if user is the owner
        if (!board.getOwner().equals(currentUser)) {
            throw new AccessDeniedException("Only board owner can update the board");
        }

        board.setName(request.name());
        board.setDescription(request.description());
        board.setIsPublic(request.isPublic());

        Board savedBoard = boardRepository.save(board);
        return convertToFullBoardResponse(savedBoard);
    }

    public void deleteBoard(Long boardId) {
        User currentUser = getCurrentUser();
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // Check if user is the owner
        if (!board.getOwner().equals(currentUser)) {
            throw new AccessDeniedException("Only board owner can delete the board");
        }

        boardRepository.delete(board);
    }

    private FullBoardResponse convertToFullBoardResponse(Board board) {
        List<ColumnResponse> columnResponses = board.getColumns() != null
                ? board.getColumns().stream()
                        .map(column -> new ColumnResponse(
                                column.getId(),
                                column.getName(),
                                column.getPosition().intValue(),
                                column.getCards() != null
                                        ? column.getCards().stream()
                                                .map(card -> new CardResponse(
                                                        card.getId(),
                                                        card.getTitle(),
                                                        card.getName(),
                                                        card.getDescription(),
                                                        card.getPosition(),
                                                        card.getIsActive(),
                                                        card.getDueDate(),
                                                        card.getComments() != null ? card.getComments().size() : 0,
                                                        card.getAttachments() != null ? card.getAttachments().size()
                                                                : 0))
                                                .collect(Collectors.toList())
                                        : new ArrayList<>()))
                        .collect(Collectors.toList())
                : new ArrayList<>();

        List<UserResponse> memberResponses = board.getMembers().stream()
                .map(member -> new UserResponse(
                        member.getId(),
                        member.getName(),
                        member.getEmail(),
                        member.getUsername(),
                        member.getRole().name(),
                        member.getAvatarUrl()))
                .collect(Collectors.toList());

        return new FullBoardResponse(
                board.getId(),
                board.getName(),
                board.getDescription(),
                memberResponses,
                columnResponses);
    }
}
