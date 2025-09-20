package com.wisecamp.api.repository;

import com.wisecamp.api.model.Board;
import com.wisecamp.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByMembers_Id(Long userId);

    List<Board> findByMembersContaining(User user);

    List<Board> findByProjectId(Long projectId);
}