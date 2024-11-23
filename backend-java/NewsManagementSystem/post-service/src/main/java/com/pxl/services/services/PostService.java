package com.pxl.services.services;

import com.pxl.services.domain.DTO.PostDTO;
import com.pxl.services.domain.Post;
import com.pxl.services.domain.PostStatus;
import com.pxl.services.domain.mapper.PostMapper;
import com.pxl.services.exceptions.*;
import com.pxl.services.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostMapper postMapper;

    @Autowired
    public PostService(PostRepository postRepository, PostMapper postMapper) {
        this.postRepository = postRepository;
        this.postMapper = postMapper;
    }

    public Post createPost(PostDTO postDTO) {
        try {
            Post post = postMapper.toPost(postDTO);
            return postRepository.save(post);
        } catch (Exception e) {
            throw new PostCreationException("Failed to create posts: " + e.getMessage());
        }
    }

    public Optional<Post> updatePost(Long id, Post updatedPost) {
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

    public Optional<Post> publishPost(Long id) {
        try {
            return postRepository.findById(id)
                    .map(post -> {
                        post.setStatus(PostStatus.published);
                        post.setUpdatedAt(LocalDateTime.now());
                        return postRepository.save(post);
                    });
        } catch (Exception e) {
            throw new PostPublishException("Failed to publish posts: " + e.getMessage());
        }
    }

    public List<Post> getPosts() {
        try {
            return postRepository.findAll();
        } catch (Exception e) {
            throw new PostPublishException("Failed to retrieve published posts: " + e.getMessage());
        }
    }

    public List<Post> searchPosts(String content, String category, String author) {
        try {
            return postRepository.findByContentContainingOrCategoryOrAuthor(content, category, author);
        } catch (Exception e) {
            throw new RuntimeException("Failed to search posts: " + e.getMessage());
        }
    }

    public Optional<Post> getPostById(Long id) {
        try {
            return postRepository.findById(id);
        } catch (Exception e) {
            throw new PostNotFoundException("Post with ID " + id + " not found.");
        }
    }

    public boolean deletePost(Long id) {
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
}
