package com.wisecamp.api.repository;

import com.wisecamp.api.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {
    // Custom query methods can be added here
}