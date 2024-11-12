package com.pxl.services.repository;

import com.pxl.services.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(UUID postId);
    List<Comment> findByUserId(UUID userId);
}
