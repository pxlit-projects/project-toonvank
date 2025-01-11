package com.pxl.services.services;

import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.PostRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PostDatabaseSeeder {
    private static final Logger log = LoggerFactory.getLogger(PostDatabaseSeeder.class);
    private final PostRepository postRepository;

    public PostDatabaseSeeder(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @PostConstruct
    public void seedPosts() {
        if (postRepository.count() == 0) {
            log.info("Seeding post database");

            Post post1 = new Post();
            post1.setTitle("Introduction to Spring Boot");
            post1.setContent("This is a beginner's guide to Spring Boot.");
            post1.setAuthor("John Doe");
            post1.setCategory("updates");
            post1.setStatus(ReviewStatus.PUBLISHED);
            post1.setCreatedAt(LocalDateTime.of(2024, 1, 1, 0, 0));
            post1.setUpdatedAt(LocalDateTime.of(2024, 1, 1, 0, 0));

            Post post2 = new Post();
            post2.setTitle("Advanced Spring Security");
            post2.setContent("Learn about advanced security concepts in Spring.");
            post2.setAuthor("Jane Smith");
            post2.setCategory("announcements");
            post2.setStatus(ReviewStatus.PUBLISHED);
            post2.setCreatedAt(LocalDateTime.of(2023, 1, 1, 0, 0));
            post2.setUpdatedAt(LocalDateTime.of(2023, 1, 1, 0, 0));

            Post post3 = new Post();
            post3.setTitle("Advanced Spring Security");
            post3.setContent("Learn about advanced security concepts in Spring.");
            post3.setAuthor("Jane Smith");
            post3.setCategory("announcements");
            post3.setStatus(ReviewStatus.PUBLISHED);
            post3.setCreatedAt(LocalDateTime.of(2023, 2, 1, 0, 0));
            post3.setUpdatedAt(LocalDateTime.of(2023, 4, 1, 0, 0));

            postRepository.save(post1);
            postRepository.save(post2);
            postRepository.save(post3);

            log.info("Database has been seeded with sample posts.");
        }
    }
}