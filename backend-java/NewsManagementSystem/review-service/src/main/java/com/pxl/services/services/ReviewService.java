package com.pxl.services.services;

import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public Review createReview(Review review) {
        review.setId(null);
        return reviewRepository.save(review);
    }

    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review updateReview(Long id, Review updatedReview) {
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setPostId(updatedReview.getPostId());
                    review.setReviewerId(updatedReview.getReviewerId());
                    review.setStatus(updatedReview.getStatus());
                    review.setComment(updatedReview.getComment());
                    return reviewRepository.save(review);
                })
                .orElseThrow(() -> new IllegalArgumentException("Review not found with ID: " + id));
    }

    public void deleteReview(Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Review not found with ID: " + id);
        }
    }

    public List<Review> getReviewsByPostId(Long postId) {
        return reviewRepository.findByPostId(postId);
    }

    public List<Review> getReviewsByReviewerId(Long reviewerId) {
        return reviewRepository.findByReviewerId(reviewerId);
    }

    public List<Review> getReviewsByStatus(ReviewStatus status) {
        return reviewRepository.findByStatus(status);
    }
}
