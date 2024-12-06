package com.pxl.services.controller;

import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private static final Logger log = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        log.info("Creating review: {}", review);
        Review createdReview = reviewService.createReview(review);
        return ResponseEntity.ok(createdReview);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        log.info("Get review by id: {}", id);
        Optional<Review> review = reviewService.getReviewById(id);
        return review.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        log.info("Get all reviews");
        List<Review> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review updatedReview) {
        log.info("Update review: {}", updatedReview);
        try {
            Review review = reviewService.updateReview(id, updatedReview);
            return ResponseEntity.ok(review);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        log.info("Delete review: {}", id);
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Review>> getReviewsByPostId(@PathVariable Long postId) {
        log.info("Get reviews by post id: {}", postId);
        List<Review> reviews = reviewService.getReviewsByPostId(postId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Review>> getReviewsByStatus(@PathVariable ReviewStatus status) {
        log.info("Get reviews by status: {}", status);
        List<Review> reviews = reviewService.getReviewsByStatus(status);
        return ResponseEntity.ok(reviews);
    }
}