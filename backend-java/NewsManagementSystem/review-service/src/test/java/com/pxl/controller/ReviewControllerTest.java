package com.pxl.controller;

import com.pxl.services.controller.ReviewController;
import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.services.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

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
    void createReview_ShouldReturnCreatedReview() {
        when(reviewService.createReview(any(Review.class))).thenReturn(mockReview);

        ResponseEntity<Review> response = reviewController.createReview(mockReview);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockReview, response.getBody());
        verify(reviewService).createReview(mockReview);
    }

    @Test
    void getReviewById_ExistingReview_ShouldReturnReview() {
        when(reviewService.getReviewById(mockReviewId)).thenReturn(Optional.of(mockReview));

        ResponseEntity<Review> response = reviewController.getReviewById(mockReviewId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockReview, response.getBody());
        verify(reviewService).getReviewById(mockReviewId);
    }

    @Test
    void getReviewById_NonExistingReview_ShouldReturnNotFound() {
        when(reviewService.getReviewById(mockReviewId)).thenReturn(Optional.empty());

        ResponseEntity<Review> response = reviewController.getReviewById(mockReviewId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(reviewService).getReviewById(mockReviewId);
    }

    @Test
    void getAllReviews_ShouldReturnListOfReviews() {
        List<Review> mockReviews = Arrays.asList(mockReview,
                Review.builder()
                        .id(2L)
                        .postId(200L)
                        .status(ReviewStatus.PUBLISHED)
                        .comment("Another review")
                        .reviewedAt(LocalDateTime.now())
                        .build()
        );
        when(reviewService.getAllReviews()).thenReturn(mockReviews);

        ResponseEntity<List<Review>> response = reviewController.getAllReviews();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockReviews, response.getBody());
        verify(reviewService).getAllReviews();
    }

    @Test
    void updateReview_ExistingReview_ShouldReturnUpdatedReview() {
        Review updatedReview = Review.builder()
                .id(mockReviewId)
                .postId(mockPostId)
                .status(ReviewStatus.PUBLISHED)
                .comment("Updated review")
                .reviewedAt(LocalDateTime.now())
                .build();
        when(reviewService.updateReview(eq(mockReviewId), any(Review.class))).thenReturn(updatedReview);

        ResponseEntity<Review> response = reviewController.updateReview(mockReviewId, updatedReview);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedReview, response.getBody());
        verify(reviewService).updateReview(eq(mockReviewId), eq(updatedReview));
    }

    @Test
    void updateReview_NonExistingReview_ShouldReturnNotFound() {
        Review updatedReview = Review.builder()
                .id(mockReviewId)
                .postId(mockPostId)
                .status(ReviewStatus.PUBLISHED)
                .comment("Updated review")
                .reviewedAt(LocalDateTime.now())
                .build();
        when(reviewService.updateReview(eq(mockReviewId), any(Review.class)))
                .thenThrow(new IllegalArgumentException("Review not found"));

        ResponseEntity<Review> response = reviewController.updateReview(mockReviewId, updatedReview);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(reviewService).updateReview(eq(mockReviewId), eq(updatedReview));
    }

    @Test
    void deleteReview_ExistingReview_ShouldReturnNoContent() {
        ResponseEntity<Void> response = reviewController.deleteReview(mockReviewId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(reviewService).deleteReview(mockReviewId);
    }

    @Test
    void deleteReview_NonExistingReview_ShouldReturnNotFound() {
        doThrow(new IllegalArgumentException("Review not found"))
                .when(reviewService).deleteReview(mockReviewId);

        ResponseEntity<Void> response = reviewController.deleteReview(mockReviewId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(reviewService).deleteReview(mockReviewId);
    }

    @Test
    void getReviewsByPostId_ShouldReturnReviews() {
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewService.getReviewsByPostId(mockPostId)).thenReturn(mockReviews);

        ResponseEntity<List<Review>> response = reviewController.getReviewsByPostId(mockPostId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockReviews, response.getBody());
        verify(reviewService).getReviewsByPostId(mockPostId);
    }

    @Test
    void getReviewsByStatus_ShouldReturnReviews() {
        ReviewStatus status = ReviewStatus.DRAFT;
        List<Review> mockReviews = Collections.singletonList(mockReview);
        when(reviewService.getReviewsByStatus(status)).thenReturn(mockReviews);

        ResponseEntity<List<Review>> response = reviewController.getReviewsByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockReviews, response.getBody());
        verify(reviewService).getReviewsByStatus(status);
    }

    @Test
    void deleteReviewsByPostId_ShouldReturnNoContent() {
        ResponseEntity<Void> response = reviewController.deleteReviewsByPostId(mockPostId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(reviewService).deleteReviewsByPostId(mockPostId);
    }
}