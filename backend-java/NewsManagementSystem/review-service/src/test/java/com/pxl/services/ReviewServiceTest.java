package com.pxl.services;

import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.ReviewRepository;
import com.pxl.services.services.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
class ReviewServiceTest {

    @Container
    private static final MySQLContainer<?> sqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private ReviewService reviewService;

    private Review testReview;
    private Long testReviewId;
    private Long testPostId;

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
        testReviewId = 1L;
        testPostId = 100L;
        testReview = Review.builder()
                .postId(testPostId)
                .status(ReviewStatus.DRAFT)
                .comment("Test review")
                .build();
    }

    @Test
    void createReview_ShouldSaveReviewAndSendToQueue() {
        Review createdReview = reviewService.createReview(testReview);

        assertNotNull(createdReview.getId());
        assertEquals(testReview.getPostId(), createdReview.getPostId());
        assertEquals(testReview.getStatus(), createdReview.getStatus());
        assertEquals(testReview.getComment(), createdReview.getComment());

        Review savedReview = reviewRepository.findById(createdReview.getId()).orElse(null);
        assertNotNull(savedReview);
    }

    @Test
    void getReviewById_ExistingReview_ShouldReturnReview() {
        Review savedReview = reviewRepository.save(testReview);

        Optional<Review> foundReview = reviewService.getReviewById(savedReview.getId());

        assertTrue(foundReview.isPresent());
        assertEquals(savedReview, foundReview.get());
    }

    @Test
    void getReviewById_NonExistingReview_ShouldReturnEmpty() {
        Optional<Review> foundReview = reviewService.getReviewById(999L);
        assertTrue(foundReview.isEmpty());
    }

    @Test
    void getAllReviews_ShouldReturnListOfReviews() {
        reviewRepository.save(testReview);

        List<Review> reviews = reviewService.getAllReviews();

        assertFalse(reviews.isEmpty());
        assertEquals(1, reviews.size());
    }

    @Test
    void updateReview_ExistingReview_ShouldUpdateAndSave() {
        Review savedReview = reviewRepository.save(testReview);
        Review updateData = Review.builder()
                .postId(200L)
                .status(ReviewStatus.PUBLISHED)
                .comment("Updated review")
                .build();

        Review updatedReview = reviewService.updateReview(savedReview.getId(), updateData);

        assertEquals(200L, updatedReview.getPostId());
        assertEquals(ReviewStatus.PUBLISHED, updatedReview.getStatus());
        assertEquals("Updated review", updatedReview.getComment());
    }

    @Test
    void updateReview_NonExistingReview_ShouldThrowException() {
        Review updateData = Review.builder()
                .postId(200L)
                .status(ReviewStatus.PUBLISHED)
                .comment("Updated review")
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.updateReview(999L, updateData)
        );
    }

    @Test
    void deleteReview_ExistingReview_ShouldDelete() {
        Review savedReview = reviewRepository.save(testReview);

        reviewService.deleteReview(savedReview.getId());

        Optional<Review> deletedReview = reviewRepository.findById(savedReview.getId());
        assertTrue(deletedReview.isEmpty());
    }

    @Test
    void deleteReview_NonExistingReview_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class, () ->
                reviewService.deleteReview(999L)
        );
    }

    @Test
    void getReviewsByPostId_ShouldReturnReviews() {
        reviewRepository.save(testReview);

        List<Review> reviews = reviewService.getReviewsByPostId(testPostId);

        assertFalse(reviews.isEmpty());
        assertEquals(testPostId, reviews.get(0).getPostId());
    }

    @Test
    void getReviewsByStatus_ShouldReturnReviews() {
        reviewRepository.save(testReview);

        List<Review> reviews = reviewService.getReviewsByStatus(ReviewStatus.DRAFT);

        assertFalse(reviews.isEmpty());
        assertEquals(ReviewStatus.DRAFT, reviews.get(0).getStatus());
    }

    @Test
    void deleteReviewsByPostId_ShouldDeleteReviews() {
        reviewRepository.save(testReview);

        reviewService.deleteReviewsByPostId(testPostId);

        List<Review> remainingReviews = reviewRepository.findByPostId(testPostId);
        assertTrue(remainingReviews.isEmpty());
    }
}