package com.wisecamp.api.repository;

import com.wisecamp.api.model.Column;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ColumnRepository extends JpaRepository<Column, Long> { }