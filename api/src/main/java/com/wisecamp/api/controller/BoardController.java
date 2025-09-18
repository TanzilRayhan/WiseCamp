package com.wisecamp.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wisecamp.api.dto.Dtos.BoardRequest;
import com.wisecamp.api.dto.Dtos.BoardSummaryResponse;
import com.wisecamp.api.dto.Dtos.FullBoardResponse;
import com.wisecamp.api.service.BoardService;

@RestController
@RequestMapping("/api/boards")
@PreAuthorize("isAuthenticated()")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public ResponseEntity<List<BoardSummaryResponse>> getUserBoards() {
        return ResponseEntity.ok(boardService.getBoardsForCurrentUser());
    }

    @PostMapping
    public ResponseEntity<FullBoardResponse> createBoard(@RequestBody BoardRequest request) {
        return ResponseEntity.ok(boardService.createBoard(request));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<FullBoardResponse> getBoardById(@PathVariable Long boardId) {
        return ResponseEntity.ok(boardService.getBoardById(boardId));
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<FullBoardResponse> updateBoard(
            @PathVariable Long boardId,
            @RequestBody BoardRequest request) {
        return ResponseEntity.ok(boardService.updateBoard(boardId, request));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build();
    }

    public record ColumnRequest(String name, Integer position) {
    }

    @PostMapping("/{boardId}/columns")
    public ResponseEntity<Void> createColumn(@PathVariable Long boardId, @RequestBody ColumnRequest req) {
        boardService.createColumn(boardId, req.name(), req.position());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{boardId}/columns/{columnId}")
    public ResponseEntity<Void> updateColumn(@PathVariable Long boardId, @PathVariable Long columnId,
            @RequestBody ColumnRequest req) {
        boardService.updateColumn(boardId, columnId, req.name(), req.position());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{boardId}/columns/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long boardId, @PathVariable Long columnId) {
        boardService.deleteColumn(boardId, columnId);
        return ResponseEntity.noContent().build();
    }

    public record MemberRequest(Long userId) {
    }

    @PostMapping("/{boardId}/members")
    public ResponseEntity<Void> addMember(@PathVariable Long boardId, @RequestBody MemberRequest req) {
        boardService.addMember(boardId, req.userId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{boardId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long boardId, @PathVariable Long userId) {
        boardService.removeMember(boardId, userId);
        return ResponseEntity.noContent().build();
    }
}
