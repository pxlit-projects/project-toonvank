package com.pxl.services;

import com.pxl.services.domain.Review;
import com.pxl.services.repository.ReviewRepository;
import com.pxl.services.services.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static junit.framework.Assert.assertNotNull;
import static junit.framework.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createReview_ShouldSaveReview() {
        Review review = new Review();
        when(reviewRepository.save(review)).thenReturn(review);

        Review result = reviewService.createReview(review);

        assertNotNull(result);
        verify(reviewRepository, times(1)).save(review);
    }

    @Test
    void getReviewById_ShouldReturnReview() {
        Review review = new Review();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        Optional<Review> result = reviewService.getReviewById(1L);

        assertTrue(result.isPresent());
        assertEquals(review, result.get());
    }

    @Test
    void getAllReviews_ShouldReturnList() {
        Review review1 = new Review();
        Review review2 = new Review();
        List<Review> reviews = Arrays.asList(review1, review2);
        when(reviewRepository.findAll()).thenReturn(reviews);

        List<Review> result = reviewService.getAllReviews();

        assertEquals(2, result.size());
        verify(reviewRepository, times(1)).findAll();
    }

    @Test
    void updateReview_ShouldUpdateReview() {
        Review existingReview = new Review();
        Review updatedReview = new Review();
        updatedReview.setComment("Updated comment");

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(existingReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(updatedReview);

        Review result = reviewService.updateReview(1L, updatedReview);

        assertNotNull(result);
        assertEquals("Updated comment", result.getComment());
    }

    @Test
    void deleteReview_ShouldDeleteReview() {
        when(reviewRepository.existsById(1L)).thenReturn(true);

        reviewService.deleteReview(1L);

        verify(reviewRepository, times(1)).deleteById(1L);
    }
}