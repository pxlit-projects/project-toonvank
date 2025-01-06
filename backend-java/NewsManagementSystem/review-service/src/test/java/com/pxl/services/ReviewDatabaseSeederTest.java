package com.pxl.services;

import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.ReviewRepository;
import com.pxl.services.services.ReviewDatabaseSeeder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
class ReviewDatabaseSeederTest {

    @Container
    private static final MySQLContainer<?> sqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ReviewDatabaseSeeder seeder;

    @DynamicPropertySource
    static void registerMySQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", sqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", sqlContainer::getUsername);
        registry.add("spring.datasource.password", sqlContainer::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
    }

    @Test
    void run_ShouldSeedReviewsWhenDatabaseEmpty() throws Exception {
        seeder.run();

        List<Review> reviews = reviewRepository.findAll();
        assertEquals(3, reviews.size());

        Review firstReview = reviews.get(0);
        assertAll("First Review",
                () -> assertEquals(1L, firstReview.getPostId()),
                () -> assertEquals(ReviewStatus.PUBLISHED, firstReview.getStatus()),
                () -> assertEquals("Great post! Very informative.", firstReview.getComment()),
                () -> assertNotNull(firstReview.getReviewedAt())
        );

        Review secondReview = reviews.get(1);
        assertAll("Second Review",
                () -> assertEquals(1L, secondReview.getPostId()),
                () -> assertEquals(ReviewStatus.PENDING, secondReview.getStatus()),
                () -> assertEquals("Needs more details on the topic.", secondReview.getComment())
        );
    }

    @Test
    void run_ShouldNotSeedWhenDatabaseNotEmpty() throws Exception {
        reviewRepository.save(Review.builder()
                .postId(1L)
                .status(ReviewStatus.DRAFT)
                .comment("Existing review")
                .build());

        seeder.run();

        assertEquals(1, reviewRepository.count());
    }

    @Test
    void seedReviews_ShouldSetCorrectTimestamps() throws Exception {
        LocalDateTime beforeTest = LocalDateTime.now();
        seeder.run();
        LocalDateTime afterTest = LocalDateTime.now();

        List<Review> reviews = reviewRepository.findAll();
        reviews.forEach(review ->
                assertTrue(isTimestampInRange(review.getReviewedAt(), beforeTest, afterTest))
        );
    }

    private boolean isTimestampInRange(LocalDateTime timestamp, LocalDateTime start, LocalDateTime end) {
        return !timestamp.isBefore(start) && !timestamp.isAfter(end);
    }
}