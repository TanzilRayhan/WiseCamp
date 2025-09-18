package com.wisecamp.api.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import com.wisecamp.api.model.Card;
import com.wisecamp.api.model.Board;
import com.wisecamp.api.model.Column;
import com.wisecamp.api.model.User;
import com.wisecamp.api.repository.CardRepository;
import com.wisecamp.api.repository.ColumnRepository;
import com.wisecamp.api.repository.UserRepository;

import java.util.Optional;

@Service
public class CardService {
    private final CardRepository cardRepository;
    private final ColumnRepository columnRepository;
    private final UserRepository userRepository;

    public CardService(CardRepository cardRepository, ColumnRepository columnRepository,
            UserRepository userRepository) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void checkBoardAccess(Card card) {
        User currentUser = getCurrentUser();
        Board board = card.getColumn().getBoard();
        if (board.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
            throw new AccessDeniedException("Access denied to this board");
        }
    }

    private void checkBoardAccess(Long columnId) {
        User currentUser = getCurrentUser();
        Column column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));
        Board board = column.getBoard();
        if (board.getMembers().stream().noneMatch(member -> member.getId().equals(currentUser.getId()))) {
            throw new AccessDeniedException("Access denied to this board");
        }
    }

    @Transactional
    public Card createCard(Long columnId, String title, String name, String description) {
        checkBoardAccess(columnId);
        Column col = columnRepository.findById(columnId).orElseThrow(() -> new RuntimeException("Column not found"));

        Card card = new Card();
        card.setTitle(title);
        card.setName(name != null ? name : title);
        card.setDescription(description);
        card.setIsActive(true);
        card.setColumn(col);

        int maxPos = 0;
        if (col.getCards() != null && !col.getCards().isEmpty()) {
            for (Card c : col.getCards()) {
                if (c.getPosition() != null && c.getPosition() > maxPos)
                    maxPos = c.getPosition();
            }
        }
        card.setPosition(maxPos + 1);

        return cardRepository.save(card);
    }

    @Transactional
    public Card updateCard(Long cardId, String title, String name, String description) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("Card not found"));
        checkBoardAccess(card);
        if (title != null)
            card.setTitle(title);
        if (name != null)
            card.setName(name);
        if (description != null)
            card.setDescription(description);
        return cardRepository.save(card);
    }

    @Transactional
    public void deleteCard(Long cardId) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("Card not found"));
        checkBoardAccess(card);
        cardRepository.delete(card);
    }

    @Transactional
    public Card moveCard(Long cardId, Long toColumnId, Integer position) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("Card not found"));
        checkBoardAccess(card);

        Column toCol = columnRepository.findById(toColumnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        checkBoardAccess(toColumnId);

        card.setColumn(toCol);
        card.setPosition(position != null ? position : 0);

        return cardRepository.save(card);
    }
}
