package com.pxl.services.services;

import com.pxl.services.clients.ReviewClient;
import com.pxl.services.domain.DTO.PostDTO;
import com.pxl.services.domain.DTO.ReviewDTO;
import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.domain.mapper.PostMapper;
import com.pxl.services.exceptions.PostCreationException;
import com.pxl.services.exceptions.PostDeletionException;
import com.pxl.services.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostMapper postMapper;

    @Mock
    private ReviewClient reviewClient;

    @InjectMocks
    private PostService postService;

    private PostDTO testPostDTO;
    private Post testPost;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        testPostDTO = PostDTO.builder()
                .title("Test Title")
                .content("Test Content")
                .author("Test Author")
                .createdAt(now)
                .updatedAt(now)
                .status("DRAFT")
                .category("Test Category")
                .build();

        testPost = Post.builder()
                .id(1L)
                .title("Test Title")
                .content("Test Content")
                .author("Test Author")
                .createdAt(now)
                .updatedAt(now)
                .status(ReviewStatus.DRAFT)
                .category("Test Category")
                .build();
    }

    @Test
    void createPost_Success() {
        // Arrange
        when(postMapper.toPost(testPostDTO)).thenReturn(testPost);
        when(postRepository.save(testPost)).thenReturn(testPost);

        // Act
        Post createdPost = postService.createPost(testPostDTO);

        // Assert
        assertEquals(testPost, createdPost);
        verify(postMapper).toPost(testPostDTO);
        verify(postRepository).save(testPost);
    }

    @Test
    void createPost_Exception() {
        // Arrange
        when(postMapper.toPost(testPostDTO)).thenReturn(testPost);
        when(postRepository.save(testPost)).thenThrow(new RuntimeException("Save failed"));

        // Act & Assert
        assertThrows(PostCreationException.class, () -> postService.createPost(testPostDTO));
    }

    @Test
    void updatePost_Success() {
        // Arrange
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        LocalDateTime now = LocalDateTime.now();
        Post updatedPostData = Post.builder()
                .id(1L)
                .title("Updated Title")
                .content("Updated Content")
                .author("Updated Author")
                .category("Updated Category")
                .createdAt(now)
                .updatedAt(now)
                .status(ReviewStatus.DRAFT)
                .build();

        // Act
        Optional<Post> result = postService.updatePost(1L, updatedPostData);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Updated Title", result.get().getTitle());
        assertEquals("Updated Content", result.get().getContent());
        assertEquals("Updated Author", result.get().getAuthor());
        assertEquals("Updated Category", result.get().getCategory());
        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

/*    @Test
    void updatePost_NotFound() {
        // Arrange
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        Post updatedPostData = Post.builder().build();

        // Act
        Optional<Post> result = postService.updatePost(1L, updatedPostData);

        // Assert
        assertTrue(result.isEmpty());
        verify(postRepository).findById(1L);
    }*/

    @Test
    void updateStatus_Success() {
        // Arrange
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        // Act
        Optional<Post> result = postService.updateStatus(1L, "PUBLISHED");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(ReviewStatus.PUBLISHED, result.get().getStatus());
        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void updateStatus_InvalidStatus() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> postService.updateStatus(1L, "INVALID_STATUS"));
    }

    @Test
    void getPosts_Success() {
        // Arrange
        List<Post> posts = Collections.singletonList(testPost);
        when(postRepository.findAll()).thenReturn(posts);

        // Act
        List<Post> result = postService.getPosts();

        // Assert
        assertEquals(posts, result);
        verify(postRepository).findAll();
    }

    @Test
    void searchPosts_Success() {
        // Arrange
        List<Post> posts = Collections.singletonList(testPost);
        when(postRepository.findByContentContainingOrCategoryOrAuthor(
                "content", "category", "author")).thenReturn(posts);

        // Act
        List<Post> result = postService.searchPosts("content", "category", "author");

        // Assert
        assertEquals(posts, result);
        verify(postRepository).findByContentContainingOrCategoryOrAuthor(
                "content", "category", "author");
    }

    @Test
    void getPostById_Success() {
        // Arrange
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));

        // Act
        Optional<Post> result = postService.getPostById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testPost, result.get());
        verify(postRepository).findById(1L);
    }

    @Test
    void deletePost_Success() {
        // Arrange
        when(postRepository.existsById(1L)).thenReturn(true);
        doNothing().when(reviewClient).deleteReviewsByPostId(1L);
        doNothing().when(postRepository).deleteById(1L);

        // Act
        boolean result = postService.deletePost(1L);

        // Assert
        assertTrue(result);
        verify(postRepository).existsById(1L);
        verify(reviewClient).deleteReviewsByPostId(1L);
        verify(postRepository).deleteById(1L);
    }

    @Test
    void deletePost_PostNotExists() {
        // Arrange
        when(postRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        assertThrows(PostDeletionException.class, () -> postService.deletePost(1L));
    }

    @Test
    void processReviewMessage_Success() {
        // Arrange
        ReviewDTO reviewDTO = new ReviewDTO(
                1L,
                ReviewStatus.PUBLISHED,
                "Test Comment",
                LocalDateTime.now()
        );

        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        // Act
        postService.processReviewMessage(reviewDTO);

        // Assert
        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void processReviewMessage_PostNotFound() {
        // Arrange
        ReviewDTO reviewDTO = new ReviewDTO(
                1L,
                ReviewStatus.PUBLISHED,
                "Test Comment",
                LocalDateTime.now()
        );

        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        postService.processReviewMessage(reviewDTO); // Should not throw exception
        verify(postRepository).findById(1L);
        verify(postRepository, never()).save(any(Post.class));
    }
}