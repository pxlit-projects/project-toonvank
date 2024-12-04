package com.pxl.services.services;

import com.pxl.services.domain.DTO.PostDTO;
import com.pxl.services.domain.Post;
import com.pxl.services.domain.PostStatus;
import com.pxl.services.domain.mapper.PostMapper;
import com.pxl.services.exceptions.*;
import com.pxl.services.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    private final PostRepository postRepository;
    private final PostMapper postMapper;

    @Autowired
    public PostService(PostRepository postRepository, PostMapper postMapper) {
        this.postRepository = postRepository;
        this.postMapper = postMapper;
    }

    public Post createPost(PostDTO postDTO) {
        log.info("Creating new post");
        try {
            Post post = postMapper.toPost(postDTO);
            return postRepository.save(post);
        } catch (Exception e) {
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
            throw new PostUpdateException("Failed to update posts: " + e.getMessage());
        }
    }

    public Optional<Post> updateStatus(Long id, String newStatus) {
        log.info("Updating status");
        try {
            PostStatus status = PostStatus.valueOf(newStatus);

            return postRepository.findById(id)
                    .map(post -> {
                        post.setStatus(status);
                        post.setUpdatedAt(LocalDateTime.now());
                        return postRepository.save(post);
                    });
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        } catch (Exception e) {
            throw new PostPublishException("Failed to publish post: " + e.getMessage());
        }
    }

    public List<Post> getPosts() {
        log.info("Getting posts");
        try {
            return postRepository.findAll();
        } catch (Exception e) {
            throw new PostPublishException("Failed to retrieve PUBLISHED posts: " + e.getMessage());
        }
    }

    public List<Post> searchPosts(String content, String category, String author) {
        log.info("Searching posts");
        try {
            return postRepository.findByContentContainingOrCategoryOrAuthor(content, category, author);
        } catch (Exception e) {
            throw new RuntimeException("Failed to search posts: " + e.getMessage());
        }
    }

    public Optional<Post> getPostById(Long id) {
        log.info("Getting post by id");
        try {
            return postRepository.findById(id);
        } catch (Exception e) {
            throw new PostNotFoundException("Post with ID " + id + " not found.");
        }
    }

    public boolean deletePost(Long id) {
        log.info("Deleting post by id");
        if (postRepository.existsById(id)) {
            try {
                postRepository.deleteById(id);
                return true;
            } catch (Exception e) {
                throw new PostDeletionException("Failed to delete post with ID " + id + ": " + e.getMessage());
            }
        } else {
            throw new PostDeletionException("Post with ID " + id + " not found.");
        }
    }

    @RabbitListener(queues = "reviewQueue")
    public void processReviewMessage(String message) {
        System.out.println("Received: " + message);
    }
}
