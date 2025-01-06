package com.pxl.services;

import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.ReviewRepository;
import com.pxl.services.services.ReviewDatabaseSeeder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReviewDatabaseSeederTest {

    @Mock
    private ReviewRepository reviewRepository;

    private ReviewDatabaseSeeder seeder;

    @Captor
    private ArgumentCaptor<List<Review>> reviewListCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        seeder = new ReviewDatabaseSeeder(reviewRepository);
    }

    @Test
    void run_ShouldCallSeedReviews() throws Exception {
        when(reviewRepository.count()).thenReturn(0L);

        seeder.run();

        verify(reviewRepository).count();
        verify(reviewRepository).saveAll(any());
    }

    @Test
    void seedReviews_WhenDatabaseEmpty_ShouldSaveReviews() throws Exception {
        when(reviewRepository.count()).thenReturn(0L);

        seeder.run();

        verify(reviewRepository).saveAll(reviewListCaptor.capture());
        List<Review> savedReviews = reviewListCaptor.getValue();

        assertEquals(3, savedReviews.size());

        Review firstReview = savedReviews.get(0);
        assertAll("First Review Verification",
                () -> assertEquals(1L, firstReview.getPostId()),
                () -> assertEquals(ReviewStatus.PUBLISHED, firstReview.getStatus()),
                () -> assertEquals("Great post! Very informative.", firstReview.getComment()),
                () -> assertNotNull(firstReview.getReviewedAt())
        );

        Review secondReview = savedReviews.get(1);
        assertAll("Second Review Verification",
                () -> assertEquals(1L, secondReview.getPostId()),
                () -> assertEquals(ReviewStatus.PENDING, secondReview.getStatus()),
                () -> assertEquals("Needs more details on the topic.", secondReview.getComment()),
                () -> assertNotNull(secondReview.getReviewedAt())
        );

        Review thirdReview = savedReviews.get(2);
        assertAll("Third Review Verification",
                () -> assertEquals(2L, thirdReview.getPostId()),
                () -> assertEquals(ReviewStatus.REJECTED, thirdReview.getStatus()),
                () -> assertEquals("The post is not relevant.", thirdReview.getComment()),
                () -> assertNotNull(thirdReview.getReviewedAt())
        );
    }

    @Test
    void seedReviews_WhenDatabaseNotEmpty_ShouldNotSaveReviews() throws Exception {
        when(reviewRepository.count()).thenReturn(1L);

        seeder.run();

        verify(reviewRepository, never()).saveAll(any());
    }

    @Test
    void seedReviews_ShouldSetCorrectTimestamps() throws Exception {
        when(reviewRepository.count()).thenReturn(0L);
        LocalDateTime beforeTest = LocalDateTime.now();

        seeder.run();

        verify(reviewRepository).saveAll(reviewListCaptor.capture());
        List<Review> savedReviews = reviewListCaptor.getValue();

        LocalDateTime afterTest = LocalDateTime.now();

        assertAll("Timestamp Verifications",
                () -> assertTrue(isTimestampInRange(savedReviews.get(0).getReviewedAt(), beforeTest, afterTest)),
                () -> assertTrue(isTimestampInRange(savedReviews.get(1).getReviewedAt(), beforeTest, afterTest)),
                () -> assertTrue(isTimestampInRange(savedReviews.get(2).getReviewedAt(), beforeTest, afterTest))
        );
    }

    private boolean isTimestampInRange(LocalDateTime timestamp, LocalDateTime start, LocalDateTime end) {
        return !timestamp.isBefore(start) && !timestamp.isAfter(end);
    }

    @Test
    void seedReviews_ShouldUseBuilderPattern() throws Exception {
        when(reviewRepository.count()).thenReturn(0L);

        seeder.run();

        verify(reviewRepository).saveAll(reviewListCaptor.capture());
        List<Review> savedReviews = reviewListCaptor.getValue();

        assertAll("Builder Pattern Verification",
                () -> assertNotNull(savedReviews.get(0)),
                () -> assertNotNull(savedReviews.get(1)),
                () -> assertNotNull(savedReviews.get(2))
        );
    }
}