package com.wisecamp.api.service;

import com.wisecamp.api.dto.Dtos.*;
import com.wisecamp.api.model.Board;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.BoardRepository;
import com.wisecamp.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public List<BoardSummaryResponse> getBoardsForCurrentUser() {
        User currentUser = getCurrentUser();
        List<Board> boards = boardRepository.findByMembersContaining(currentUser);
        return boards.stream()
                .map(board -> new BoardSummaryResponse(
                        board.getId(),
                        board.getName(),
                        board.getDescription()))
                .toList();
    }

    public FullBoardResponse createBoard(BoardRequest request) {
        User currentUser = getCurrentUser();

        Board board = new Board();
        board.setName(request.name());
        board.setDescription(request.description());
        board.getMembers().add(currentUser);

        Board savedBoard = boardRepository.save(board);
        return mapToFullBoardResponse(savedBoard);
    }

    public FullBoardResponse getBoardById(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        return mapToFullBoardResponse(board);
    }

    private FullBoardResponse mapToFullBoardResponse(Board board) {
        return new FullBoardResponse(
                board.getId(),
                board.getName(),
                board.getDescription(),
                board.getMembers().stream()
                        .map(user -> new UserResponse(user.getId(), user.getName(), user.getEmail()))
                        .toList(),
                board.getColumns().stream()
                        .map(column -> new ColumnResponse(
                                column.getId(),
                                column.getName(),
                                column.getPosition().intValue(), // Convert Long to Integer
                                column.getCards().stream()
                                        .map(card -> new CardResponse(
                                                card.getId(),
                                                card.getTitle(),
                                                card.getDescription(),
                                                card.getPosition(),
                                                card.getDueDate()))
                                        .toList()))
                        .toList());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
