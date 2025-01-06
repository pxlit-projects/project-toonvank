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
        when(reviewRepository.save(any(Review.class))).thenReturn(mockReview);

        Review createdReview = reviewService.createReview(mockReview);

        verify(rabbitTemplate).convertAndSend(eq("reviewQueue"), any(ReviewDTO.class));
        verify(reviewRepository).save(mockReview);
        assertEquals(mockReview, createdReview);
    }

    @Test
    void getReviewById_ExistingReview_ShouldReturnReview() {
        when(reviewRepository.findById(mockReviewId)).thenReturn(Optional.of(mockReview));

        Optional<Review> foundReview = reviewService.getReviewById(mockReviewId);

        assertTrue(foundReview.isPresent());
        assertEquals(mockReview, foundReview.get());
    }

    @Test
    void getAllReviews_ShouldReturnListOfReviews() {
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewRepository.findAll()).thenReturn(mockReviews);

        List<Review> reviews = reviewService.getAllReviews();

        assertEquals(mockReviews, reviews);
    }

    @Test
    void updateReview_ExistingReview_ShouldUpdateAndSave() {
        Review updatedReviewData = Review.builder()
                .postId(200L)
                .status(ReviewStatus.PUBLISHED)
                .comment("Updated review")
                .build();

        when(reviewRepository.findById(mockReviewId)).thenReturn(Optional.of(mockReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(mockReview);

        Review updatedReview = reviewService.updateReview(mockReviewId, updatedReviewData);

        assertEquals(200L, updatedReview.getPostId());
        assertEquals(ReviewStatus.PUBLISHED, updatedReview.getStatus());
        assertEquals("Updated review", updatedReview.getComment());
        verify(reviewRepository).save(mockReview);
    }

    @Test
    void updateReview_NonExistingReview_ShouldThrowException() {
        when(reviewRepository.findById(mockReviewId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.updateReview(mockReviewId, mockReview)
        );
    }

    @Test
    void deleteReview_ExistingReview_ShouldDelete() {
        when(reviewRepository.existsById(mockReviewId)).thenReturn(true);

        reviewService.deleteReview(mockReviewId);

        verify(reviewRepository).deleteById(mockReviewId);
    }

    @Test
    void deleteReview_NonExistingReview_ShouldThrowException() {
        when(reviewRepository.existsById(mockReviewId)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.deleteReview(mockReviewId)
        );
    }

    @Test
    void getReviewsByPostId_ShouldReturnReviews() {
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewRepository.findByPostId(mockPostId)).thenReturn(mockReviews);

        List<Review> reviews = reviewService.getReviewsByPostId(mockPostId);

        assertEquals(mockReviews, reviews);
    }

    @Test
    void getReviewsByStatus_ShouldReturnReviews() {
        ReviewStatus status = ReviewStatus.DRAFT;
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewRepository.findByStatus(status)).thenReturn(mockReviews);

        List<Review> reviews = reviewService.getReviewsByStatus(status);

        assertEquals(mockReviews, reviews);
    }

    @Test
    void deleteReviewsByPostId_ShouldDeleteReviews() {
        reviewService.deleteReviewsByPostId(mockPostId);

        verify(reviewRepository).deleteByPostId(mockPostId);
    }
}