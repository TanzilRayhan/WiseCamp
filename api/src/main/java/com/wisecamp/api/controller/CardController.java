package com.wisecamp.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.wisecamp.api.dto.CardRequest;
import com.wisecamp.api.dto.CardResponse;
import com.wisecamp.api.model.Card;
import com.wisecamp.api.service.CardService;

@RestController
@RequestMapping("/api/cards")
@PreAuthorize("isAuthenticated()")
public class CardController {
    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping
    public ResponseEntity<CardResponse> createCard(@RequestBody CardRequest req) {
        Card c = cardService.createCard(req.columnId(), req.title(), req.name(), req.description());
        return ResponseEntity.ok(new CardResponse(c.getId(), c.getTitle(), c.getName(), c.getDescription(),
                c.getPosition(), c.getIsActive(), c.getDueDate(), c.getComments() != null ? c.getComments().size() : 0, c.getAttachments() != null ? c.getAttachments().size() : 0));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<CardResponse> updateCard(@PathVariable Long cardId, @RequestBody CardRequest req) {
        Card c = cardService.updateCard(cardId, req.title(), req.name(), req.description());
        return ResponseEntity.ok(new CardResponse(c.getId(), c.getTitle(), c.getName(), c.getDescription(),
                c.getPosition(), c.getIsActive(), c.getDueDate(), c.getComments().size(), c.getAttachments().size()));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.noContent().build();
    }

    public record MoveRequest(Long columnId, Integer position) {
    }

    @PatchMapping("/{cardId}/move")
    public ResponseEntity<CardResponse> moveCard(@PathVariable Long cardId, @RequestBody MoveRequest req) {
        Card c = cardService.moveCard(cardId, req.columnId(), req.position());
        return ResponseEntity.ok(new CardResponse(c.getId(), c.getTitle(), c.getName(), c.getDescription(),
                c.getPosition(), c.getIsActive(), c.getDueDate(), c.getComments().size(), c.getAttachments().size()));
    }
}
