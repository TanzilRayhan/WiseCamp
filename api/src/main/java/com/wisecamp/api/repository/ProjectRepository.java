package com.wisecamp.api.repository;

import com.wisecamp.api.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByMembers_Id(Long memberId);
}