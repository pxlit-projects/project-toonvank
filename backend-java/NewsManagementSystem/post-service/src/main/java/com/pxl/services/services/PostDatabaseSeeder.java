package com.pxl.services.services;

import com.pxl.services.domain.Post;
import com.pxl.services.domain.PostStatus;
import com.pxl.services.repository.PostRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PostDatabaseSeeder {
    private final PostRepository postRepository;

    public PostDatabaseSeeder(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @PostConstruct
    public void seedPosts() {
        if (postRepository.count() == 0) {
            Post post1 = new Post();
            post1.setTitle("Introduction to Spring Boot");
            post1.setContent("This is a beginner's guide to Spring Boot.");
            post1.setAuthor("John Doe");
            post1.setCategory("Tutorial");
            post1.setStatus(PostStatus.published);
            post1.setCreatedAt(LocalDateTime.now());

            Post post2 = new Post();
            post2.setTitle("Advanced Spring Security");
            post2.setContent("Learn about advanced security concepts in Spring.");
            post2.setAuthor("Jane Smith");
            post2.setCategory("Security");
            post2.setStatus(PostStatus.published);
            post2.setCreatedAt(LocalDateTime.now());

            postRepository.save(post1);
            postRepository.save(post2);

            System.out.println("Database has been seeded with sample posts.");
        }
    }
}