package com.pxl.services.services;

import com.pxl.services.domain.DTO.ReviewDTO;
import com.pxl.services.domain.Review;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final RabbitTemplate rabbitTemplate;

    public Review createReview(Review review) {
        log.info("Creating review: {}", review);
        review.setId(null);
        ReviewDTO reviewDTO = new ReviewDTO(review.getPostId(), review.getStatus(), review.getComment(), review.getReviewedAt());
        rabbitTemplate.convertAndSend("reviewQueue", reviewDTO);
        return reviewRepository.save(review);
    }

    public Optional<Review> getReviewById(Long id) {
        log.info("Getting review by id: {}", id);
        return reviewRepository.findById(id);
    }

    public List<Review> getAllReviews() {
        log.info("Getting all reviews");
        return reviewRepository.findAll();
    }

    public Review updateReview(Long id, Review updatedReview) {
        log.info("Updating review: {}", updatedReview);
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setPostId(updatedReview.getPostId());
                    review.setStatus(updatedReview.getStatus());
                    review.setComment(updatedReview.getComment());
                    return reviewRepository.save(review);
                })
                .orElseThrow(() -> new IllegalArgumentException("Review not found with ID: " + id));
    }

    public void deleteReview(Long id) {
        log.info("Deleting review: {}", id);
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Review not found with ID: " + id);
        }
    }

    public List<Review> getReviewsByPostId(Long postId) {
        log.info("Getting reviews by post id: {}", postId);
        return reviewRepository.findByPostId(postId);
    }

    public List<Review> getReviewsByStatus(ReviewStatus status) {
        log.info("Getting reviews by reviewer status: {}", status);
        return reviewRepository.findByStatus(status);
    }

    public void deleteReviewsByPostId(Long postId) {
        log.info("Deleting reviews by post id: {}", postId);
        reviewRepository.deleteByPostId(postId);
    }
}
