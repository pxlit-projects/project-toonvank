package com.pxl.services;

import com.pxl.services.domain.DTO.ReviewDTO;
import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.ReviewRepository;
import com.pxl.services.services.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private ReviewService reviewService;

    private Review mockReview;
    private Long mockReviewId;
    private Long mockPostId;

    @BeforeEach
    void setUp() {
        mockReviewId = 1L;
        mockPostId = 100L;
        mockReview = Review.builder()
                .id(mockReviewId)
                .postId(mockPostId)
                .status(ReviewStatus.DRAFT)
                .comment("Test review")
                .reviewedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createReview_ShouldSaveReviewAndSendToQueue() {
        // Arrange
        when(reviewRepository.save(any(Review.class))).thenReturn(mockReview);

        // Act
        Review createdReview = reviewService.createReview(mockReview);

        // Assert
        assertNull(mockReview.getId());
        verify(rabbitTemplate).convertAndSend(eq("reviewQueue"), any(ReviewDTO.class));
        verify(reviewRepository).save(mockReview);
        assertEquals(mockReview, createdReview);
    }

    @Test
    void getReviewById_ExistingReview_ShouldReturnReview() {
        // Arrange
        when(reviewRepository.findById(mockReviewId)).thenReturn(Optional.of(mockReview));

        // Act
        Optional<Review> foundReview = reviewService.getReviewById(mockReviewId);

        // Assert
        assertTrue(foundReview.isPresent());
        assertEquals(mockReview, foundReview.get());
    }

    @Test
    void getAllReviews_ShouldReturnListOfReviews() {
        // Arrange
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewRepository.findAll()).thenReturn(mockReviews);

        // Act
        List<Review> reviews = reviewService.getAllReviews();

        // Assert
        assertEquals(mockReviews, reviews);
    }

    @Test
    void updateReview_ExistingReview_ShouldUpdateAndSave() {
        // Arrange
        Review updatedReviewData = Review.builder()
                .postId(200L)
                .status(ReviewStatus.PUBLISHED)
                .comment("Updated review")
                .build();

        when(reviewRepository.findById(mockReviewId)).thenReturn(Optional.of(mockReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(mockReview);

        // Act
        Review updatedReview = reviewService.updateReview(mockReviewId, updatedReviewData);

        // Assert
        assertEquals(200L, updatedReview.getPostId());
        assertEquals(ReviewStatus.PUBLISHED, updatedReview.getStatus());
        assertEquals("Updated review", updatedReview.getComment());
        verify(reviewRepository).save(mockReview);
    }

    @Test
    void updateReview_NonExistingReview_ShouldThrowException() {
        // Arrange
        when(reviewRepository.findById(mockReviewId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
                reviewService.updateReview(mockReviewId, mockReview)
        );
    }

    @Test
    void deleteReview_ExistingReview_ShouldDelete() {
        // Arrange
        when(reviewRepository.existsById(mockReviewId)).thenReturn(true);

        // Act
        reviewService.deleteReview(mockReviewId);

        // Assert
        verify(reviewRepository).deleteById(mockReviewId);
    }

    @Test
    void deleteReview_NonExistingReview_ShouldThrowException() {
        // Arrange
        when(reviewRepository.existsById(mockReviewId)).thenReturn(false);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
                reviewService.deleteReview(mockReviewId)
        );
    }

    @Test
    void getReviewsByPostId_ShouldReturnReviews() {
        // Arrange
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewRepository.findByPostId(mockPostId)).thenReturn(mockReviews);

        // Act
        List<Review> reviews = reviewService.getReviewsByPostId(mockPostId);

        // Assert
        assertEquals(mockReviews, reviews);
    }

    @Test
    void getReviewsByStatus_ShouldReturnReviews() {
        // Arrange
        ReviewStatus status = ReviewStatus.DRAFT;
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewRepository.findByStatus(status)).thenReturn(mockReviews);

        // Act
        List<Review> reviews = reviewService.getReviewsByStatus(status);

        // Assert
        assertEquals(mockReviews, reviews);
    }

    @Test
    void deleteReviewsByPostId_ShouldDeleteReviews() {
        // Act
        reviewService.deleteReviewsByPostId(mockPostId);

        // Assert
        verify(reviewRepository).deleteByPostId(mockPostId);
    }
}