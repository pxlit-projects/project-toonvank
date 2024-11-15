package com.pxl.controller;

import com.pxl.services.controller.ReviewController;
import com.pxl.services.domain.Review;
import com.pxl.services.services.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createReview_ShouldReturnCreatedReview() {
        Review review = new Review();
        when(reviewService.createReview(review)).thenReturn(review);

        ResponseEntity<Review> response = reviewController.createReview(review);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(review, response.getBody());
    }

    @Test
    void getReviewById_ShouldReturnReviewIfExists() {
        Review review = new Review();
        when(reviewService.getReviewById(1L)).thenReturn(Optional.of(review));

        ResponseEntity<Review> response = reviewController.getReviewById(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(review, response.getBody());
    }

    @Test
    void getReviewById_ShouldReturnNotFoundIfDoesNotExist() {
        when(reviewService.getReviewById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Review> response = reviewController.getReviewById(1L);

        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void getAllReviews_ShouldReturnListOfReviews() {
        Review review1 = new Review();
        Review review2 = new Review();
        List<Review> reviews = Arrays.asList(review1, review2);
        when(reviewService.getAllReviews()).thenReturn(reviews);

        ResponseEntity<List<Review>> response = reviewController.getAllReviews();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void updateReview_ShouldReturnUpdatedReview() {
        Review updatedReview = new Review();
        updatedReview.setComment("Updated comment");
        when(reviewService.updateReview(1L, updatedReview)).thenReturn(updatedReview);

        ResponseEntity<Review> response = reviewController.updateReview(1L, updatedReview);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Updated comment", response.getBody().getComment());
    }

    @Test
    void deleteReview_ShouldReturnNoContent() {
        doNothing().when(reviewService).deleteReview(1L);

        ResponseEntity<Void> response = reviewController.deleteReview(1L);

        assertEquals(204, response.getStatusCodeValue());
    }
}