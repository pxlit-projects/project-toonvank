package com.pxl.services.repository;

import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByStatus(ReviewStatus status);

    List<Post> findByCategory(String category);

    List<Post> findByAuthor(String author);

    List<Post> findByContentContainingOrCategoryOrAuthor(String content, String category, String author);
}
