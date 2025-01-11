package com.pxl.services.services;

import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReviewDatabaseSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);
    private final ReviewRepository reviewRepository;

    @Override
    public void run(String... args) throws Exception {
        seedReviews();
        log.info("Database seeding has been completed.");
    }

    private void seedReviews() {
        if (reviewRepository.count() == 0) {
            Review review1 = Review.builder()
                    .postId(1L)
                    .status(ReviewStatus.PUBLISHED)
                    .comment("Great post! Very informative.")
                    .reviewedAt(LocalDateTime.now())
                    .build();

            Review review2 = Review.builder()
                    .postId(1L)
                    .status(ReviewStatus.PENDING)
                    .comment("Needs more details on the topic.")
                    .reviewedAt(LocalDateTime.now())
                    .build();

            Review review3 = Review.builder()
                    .postId(2L)
                    .status(ReviewStatus.REJECTED)
                    .comment("The post is not relevant.")
                    .reviewedAt(LocalDateTime.now())
                    .build();

            reviewRepository.saveAll(List.of(review1, review2, review3));

            log.info("Sample reviews have been added to the database.");
        } else {
            log.info("Reviews already exist in the database.");
        }
    }
}
