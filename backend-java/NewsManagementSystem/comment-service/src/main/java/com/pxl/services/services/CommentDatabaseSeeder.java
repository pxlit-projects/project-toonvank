package com.pxl.services.services;

import com.pxl.services.domain.Comment;
import com.pxl.services.repository.CommentRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CommentDatabaseSeeder {
    private static final Logger log = LoggerFactory.getLogger(CommentDatabaseSeeder.class);
    private final CommentRepository commentRepository;

    public CommentDatabaseSeeder(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    @PostConstruct
    public void seedComments() {
        log.info("Seeding comment database");
        if (commentRepository.count() == 0) {
            Comment comment1 = new Comment();
            comment1.setPostId(12L);
            comment1.setContent("This introduction to Spring Boot is exactly what I needed!");
            comment1.setCreatedAt(LocalDateTime.now());
            comment1.setPostedBy("John Doe");

            Comment comment2 = new Comment();
            comment2.setPostId(13L);
            comment2.setContent("Great explanation of the basics. Looking forward to more content!");
            comment2.setCreatedAt(LocalDateTime.now().minusHours(2));
            comment2.setPostedBy("Uncle Rick");

            Comment comment3 = new Comment();
            comment3.setPostId(13L);
            comment3.setContent("The security concepts are well explained. Would love to see more examples.");
            comment3.setCreatedAt(LocalDateTime.now().minusDays(1));
            comment3.setEditedAt(LocalDateTime.now());
            comment3.setPostedBy("Miles Davis");

            Comment comment4 = new Comment();
            comment4.setPostId(14L);
            comment4.setContent("This helped me understand Spring Security much better.");
            comment4.setCreatedAt(LocalDateTime.now().minusDays(2));
            comment4.setPostedBy("John Doe");

            Comment comment5 = new Comment();
            comment5.setPostId(22L);
            comment5.setContent("Excellent deep dive into Spring Security!");
            comment5.setCreatedAt(LocalDateTime.now().minusMonths(1));
            comment5.setPostedBy("Forest Whitaker");

            Comment comment6 = new Comment();
            comment6.setPostId(22L);
            comment6.setContent("I implemented these concepts in my project and it works great!");
            comment6.setCreatedAt(LocalDateTime.now().minusMonths(1));
            comment6.setEditedAt(LocalDateTime.now().minusWeeks(2));
            comment6.setPostedBy("Paul Artreides");

            commentRepository.save(comment1);
            commentRepository.save(comment2);
            commentRepository.save(comment3);
            commentRepository.save(comment4);
            commentRepository.save(comment5);
            commentRepository.save(comment6);

            log.info("Database has been seeded with sample comments.");
        }
    }
}