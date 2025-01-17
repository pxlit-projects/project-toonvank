package com.pxl.services.services;

import com.pxl.services.clients.ReviewClient;
import com.pxl.services.domain.DTO.PostDTO;
import com.pxl.services.domain.DTO.ReviewDTO;
import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.domain.mapper.PostMapper;
import com.pxl.services.exceptions.*;
import com.pxl.services.repository.PostRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RabbitListener
@Service
public class PostService {
    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final ReviewClient reviewClient;

    public PostService(PostRepository postRepository, PostMapper postMapper, ReviewClient reviewClient) {
        this.postRepository = postRepository;
        this.postMapper = postMapper;
        this.reviewClient = reviewClient;
    }

    public Post createPost(PostDTO postDTO) {
        log.info("Creating new post");
        try {
            Post post = postMapper.toPost(postDTO);
            return postRepository.save(post);
        } catch (Exception e) {
            log.error("Failed to create posts: {}", e.getMessage());
            throw new PostCreationException("Failed to create posts: " + e.getMessage());
        }
    }

    public Optional<Post> updatePost(Long id, Post updatedPost) {
        log.info("Updating post");
        try {
            return postRepository.findById(id)
                    .map(post -> {
                        post.setTitle(updatedPost.getTitle());
                        post.setContent(updatedPost.getContent());
                        post.setAuthor(updatedPost.getAuthor());
                        post.setCategory(updatedPost.getCategory());
                        post.setUpdatedAt(LocalDateTime.now());
                        return postRepository.save(post);
                    });
        } catch (Exception e) {
            log.error("Failed to update posts: {}", e.getMessage());
            throw new PostUpdateException("Failed to update posts: " + e.getMessage());
        }
    }

    public Optional<Post> updateStatus(Long id, String newStatus) {
        log.info("Updating status");
        try {
            ReviewStatus status = ReviewStatus.valueOf(newStatus);

            return postRepository.findById(id)
                    .map(post -> {
                        post.setStatus(status);
                        post.setUpdatedAt(LocalDateTime.now());
                        return postRepository.save(post);
                    });
        } catch (IllegalArgumentException e) {
            log.error("Invalid status: {}", newStatus);
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        } catch (Exception e) {
            log.error("Failed to update status: {}", e.getMessage());
            throw new PostPublishException("Failed to publish post: " + e.getMessage());
        }
    }

    public List<Post> getPosts() {
        log.info("Getting posts");
        try {
            return postRepository.findAll();
        } catch (Exception e) {
            log.error("Failed to retrieve posts: {}", e.getMessage());
            throw new PostPublishException("Failed to retrieve PUBLISHED posts: " + e.getMessage());
        }
    }

    public List<Post> searchPosts(String content, String category, String author) {
        log.info("Searching posts");
        try {
            return postRepository.findByContentContainingOrCategoryOrAuthor(content, category, author);
        } catch (Exception e) {
            log.error("Failed to search posts: {}", e.getMessage());
            throw new RuntimeException("Failed to search posts: " + e.getMessage());
        }
    }

    public Optional<Post> getPostById(Long id) {
        log.info("Getting post by id");
        try {
            return postRepository.findById(id);
        } catch (Exception e) {
            log.error("Post with ID {} not found", id);
            throw new PostNotFoundException("Post with ID " + id + " not found.");
        }
    }

    public boolean deletePost(Long id) {
        log.info("Deleting post by id");
        if (postRepository.existsById(id)) {
            try {
                reviewClient.deleteReviewsByPostId(id);
                postRepository.deleteById(id);
                return true;
            } catch (FeignException e) {
                throw new PostDeletionException("Failed to delete associated reviews: " + e.getMessage());
            } catch (Exception e) {
                throw new PostDeletionException("Failed to delete post with ID " + id + ": " + e.getMessage());
            }
        } else {
            log.error("Post with ID {} not found", id);
            throw new PostDeletionException("Post with ID " + id + " not found.");
        }
    }

    @RabbitListener(queues = "reviewQueue")
    public void processReviewMessage(ReviewDTO review) {
        try {
            log.info("Processing review message");
            Optional<Post> post = postRepository.findById(review.getPostId());
            if (post.isPresent()) {
                post.get().setStatus(review.getStatus());
                postRepository.save(post.get());
            } else {
                throw new PostNotFoundException("Post with ID " + review.getPostId() + " not found.");
            }
        } catch (Exception e) {
            log.error("Failed to process review message: " + e.getMessage());
        }
    }
}
