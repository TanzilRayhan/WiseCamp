package com.wisecamp.api.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wisecamp.api.dto.AuthDtos.UserResponse;
import com.wisecamp.api.dto.BoardDtos.BoardRequest;
import com.wisecamp.api.dto.BoardDtos.BoardSummaryResponse;
import com.wisecamp.api.dto.BoardDtos.CardResponse;
import com.wisecamp.api.dto.BoardDtos.ColumnResponse;
import com.wisecamp.api.dto.BoardDtos.FullBoardResponse;
import com.wisecamp.api.model.Board;
import com.wisecamp.api.model.Project;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.BoardRepository;
import com.wisecamp.api.repository.ProjectRepository;
import com.wisecamp.api.repository.UserRepository;

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
                // Get boards user is a member of
                List<Board> memberBoards = boardRepository.findByMembers_Id(currentUser.getId());
                // Get all public boards
                List<Board> publicBoards = boardRepository.findAll().stream().filter(Board::isPublic).toList();

                // Combine and remove duplicates
                java.util.Set<Board> visibleBoards = new java.util.HashSet<>(memberBoards);
                visibleBoards.addAll(publicBoards);

                return visibleBoards.stream()
                                .map(board -> new BoardSummaryResponse(
                                                board.getId(),
                                                board.getName(),
                                                board.getDescription(),
                                                board.getIsPublic(),
                                                board.getOwner().getId(),
                                                board.getMembers().size(),
                                                board.getColumns() != null ? board.getColumns().stream()
                                                                .mapToInt(c -> c.getCards() != null
                                                                                ? c.getCards().size()
                                                                                : 0)
                                                                .sum() : 0,
                                                board.getCreatedAt()))
                                .collect(Collectors.toList());
        }

        @Transactional
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
                        if (project.getMembers().stream()
                                        .noneMatch(member -> member.getId().equals(currentUser.getId()))) {
                                throw new AccessDeniedException("Access denied to this project");
                        }

                        board.setProject(project);
                        // Add all project members to the new board
                        board.getMembers().addAll(project.getMembers());
                }

                Board savedBoard = boardRepository.save(board);
                return convertToFullBoardResponse(savedBoard);
        }

        public FullBoardResponse getBoardById(Long boardId) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));

                // Check access
                if (board.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
                        throw new AccessDeniedException("Access denied to this board");
                }

                return convertToFullBoardResponse(board);
        }

        public FullBoardResponse updateBoard(Long boardId, BoardRequest request) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));

                // Check if user is the owner
                if (!board.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only board owner can update the board");
                }

                board.setName(request.name());
                board.setDescription(request.description());
                board.setIsPublic(request.isPublic());

                Board savedBoard = boardRepository.save(board);
                return convertToFullBoardResponse(savedBoard);
        }

        @Transactional
        public ColumnResponse createColumn(Long boardId, String name, Integer position) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));

                if (board.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
                        throw new AccessDeniedException("Only board members can add columns");
                }

                com.wisecamp.api.model.Column col = new com.wisecamp.api.model.Column();
                col.setName(name);
                col.setPosition(position != null ? position.longValue()
                                : (long) (board.getColumns() != null ? board.getColumns().size() : 0));
                col.setBoard(board);

                if (board.getColumns() == null)
                        board.setColumns(new java.util.ArrayList<>());
                board.getColumns().add(col);
                boardRepository.save(board);
                return convertToColumnResponse(col);
        }

        @Transactional
        public ColumnResponse updateColumn(Long boardId, Long columnId, String name, Integer position) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));

                if (board.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
                        throw new AccessDeniedException("Only board members can update columns");
                }

                com.wisecamp.api.model.Column col = board.getColumns().stream().filter(c -> c.getId().equals(columnId))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Column not found"));
                if (name != null)
                        col.setName(name);
                if (position != null)
                        col.setPosition(position.longValue());
                boardRepository.save(board);
                return convertToColumnResponse(col);
        }

        @Transactional
        public void deleteColumn(Long boardId, Long columnId) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));

                if (board.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
                        throw new AccessDeniedException("Only board members can delete columns");
                }

                boolean removed = board.getColumns().removeIf(c -> c.getId().equals(columnId));
                if (!removed)
                        throw new RuntimeException("Column not found");
                boardRepository.save(board);
        }

        public void deleteBoard(Long boardId) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));

                // Check if user is the owner
                if (!board.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only board owner can delete the board");
                }

                boardRepository.delete(board);
        }

        @Transactional
        public void addMember(Long boardId, Long userId) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));
                if (!board.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only board owner can add members");
                }
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                board.getMembers().add(user);
                boardRepository.save(board);
        }

        @Transactional
        public void removeMember(Long boardId, Long userId) {
                User currentUser = getCurrentUser();
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new RuntimeException("Board not found"));
                if (!board.getOwner().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException("Only board owner can remove members");
                }
                // prevent removing owner
                if (board.getOwner().getId().equals(userId)) {
                        throw new RuntimeException("Cannot remove board owner");
                }
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                board.getMembers().remove(user);
                boardRepository.save(board);
        }

        private ColumnResponse convertToColumnResponse(com.wisecamp.api.model.Column column) {
                return new ColumnResponse(
                                column.getId(),
                                column.getName(),
                                column.getPosition(),
                                column.getCards() != null
                                                ? column.getCards().stream()
                                                                .map(card -> new CardResponse(
                                                                                card.getId(),
                                                                                card.getName(),
                                                                                card.getTitle(),
                                                                                card.getDescription(),
                                                                                card.getPosition(),
                                                                                card.getIsActive(),
                                                                                card.getCreatedAt()))
                                                                .collect(Collectors.toList())
                                                : new ArrayList<>());
        }

        private FullBoardResponse convertToFullBoardResponse(Board board) {
                List<ColumnResponse> columnResponses = board.getColumns() != null
                                ? board.getColumns().stream()
                                                .map(column -> new ColumnResponse(
                                                                column.getId(),
                                                                column.getName(),
                                                                column.getPosition(),
                                                                column.getCards() != null
                                                                                ? column.getCards().stream()
                                                                                                .map(card -> new CardResponse(
                                                                                                                card.getId(),
                                                                                                                card.getName(),
                                                                                                                card.getTitle(),
                                                                                                                card.getDescription(),
                                                                                                                card.getPosition(),
                                                                                                                card.getIsActive(),
                                                                                                                card.getCreatedAt()))
                                                                                                .collect(Collectors
                                                                                                                .toList())
                                                                                : new ArrayList<CardResponse>()))
                                                .collect(Collectors.toList())
                                : new ArrayList<>();

                List<UserResponse> memberResponses = board.getMembers().stream()
                                .map(member -> new UserResponse(
                                                member.getId(),
                                                member.getName(),
                                                member.getEmail(),
                                                member.getUsername()))
                                .collect(Collectors.toList());

                UserResponse ownerResponse = new UserResponse(
                                board.getOwner().getId(),
                                board.getOwner().getName(),
                                board.getOwner().getEmail(),
                                board.getOwner().getUsername());

                return new FullBoardResponse(
                                board.getId(),
                                board.getName(),
                                board.getDescription(),
                                board.getIsPublic(),
                                board.getOwner().getId(),
                                ownerResponse,
                                memberResponses,
                                columnResponses,
                                board.getCreatedAt(),
                                board.getUpdatedAt());
        }
}
