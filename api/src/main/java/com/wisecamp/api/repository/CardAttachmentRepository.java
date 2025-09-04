package com.wisecamp.api.repository;

import com.wisecamp.api.model.CardAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardAttachmentRepository extends JpaRepository<CardAttachment, Long> {
}