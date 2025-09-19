package com.wisecamp.api.dto;

import java.time.LocalDate;

public record CardResponse(Long id, String title, String name, String description, Integer position,
        Boolean isActive, LocalDate dueDate, int commentCount, int attachmentCount) {
}
