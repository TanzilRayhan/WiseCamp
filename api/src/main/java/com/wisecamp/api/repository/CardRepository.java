package com.wisecamp.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wisecamp.api.model.Card;

public interface CardRepository extends JpaRepository<Card, Long> {
}