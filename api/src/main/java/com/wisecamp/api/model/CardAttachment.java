package com.wisecamp.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "card_attachments")
public class CardAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String filename;
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id")
    private Card card;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // No-argument constructor required by JPA
    public CardAttachment() {
    }

    // Optional: All-args constructor for convenience
    public CardAttachment(Long id, String filename, String location, Card card, LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.filename = filename;
        this.location = location;
        this.card = card;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}