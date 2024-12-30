package com.pxl.controller;

import com.pxl.services.controller.PostController;
import com.pxl.services.domain.DTO.PostDTO;
import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.services.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostControllerTest {

    @Mock
    private PostService postService;

    @InjectMocks
    private PostController postController;

    private PostDTO testPostDTO;
    private Post testPost;

    @BeforeEach
    void setUp() {
        testPostDTO = PostDTO.builder()
                .title("Test Title")
                .content("Test Content")
                .author("Test Author")
                .createdAt(LocalDateTime.now())
                .status("DRAFT")
                .category("Test Category")
                .build();

        testPost = Post.builder()
                .id(1L)
                .title(testPostDTO.getTitle())
                .content(testPostDTO.getContent())
                .author(testPostDTO.getAuthor())
                .createdAt(testPostDTO.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .status(ReviewStatus.DRAFT)
                .category(testPostDTO.getCategory())
                .build();
    }

    @Test
    void createPost_Success() {
        // Arrange
        when(postService.createPost(testPostDTO)).thenReturn(testPost);

        // Act
        ResponseEntity<?> response = postController.createPost(testPostDTO);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).createPost(testPostDTO);
    }

    @Test
    void createPost_Exception() {
        // Arrange
        when(postService.createPost(testPostDTO)).thenThrow(new RuntimeException("Creation failed"));

        // Act
        ResponseEntity<?> response = postController.createPost(testPostDTO);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(((java.util.Map<?, ?>) response.getBody()).containsKey("message"));
        verify(postService, times(1)).createPost(testPostDTO);
    }

    @Test
    void updatePost_Success() {
        // Arrange
        when(postService.updatePost(1L, testPost)).thenReturn(Optional.of(testPost));

        // Act
        ResponseEntity<?> response = postController.updatePost(1L, testPost);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).updatePost(1L, testPost);
    }

    @Test
    void updatePost_NotFound() {
        // Arrange
        when(postService.updatePost(1L, testPost)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = postController.updatePost(1L, testPost);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).updatePost(1L, testPost);
    }

    @Test
    void updateStatus_Success() {
        // Arrange
        when(postService.updateStatus(1L, "PUBLISHED")).thenReturn(Optional.of(testPost));

        // Act
        ResponseEntity<?> response = postController.updateStatus(1L, "PUBLISHED");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).updateStatus(1L, "PUBLISHED");
    }

    @Test
    void updateStatus_NotFound() {
        // Arrange
        when(postService.updateStatus(1L, "PUBLISHED")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = postController.updateStatus(1L, "PUBLISHED");

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).updateStatus(1L, "PUBLISHED");
    }

    @Test
    void getPosts_Success() {
        // Arrange
        List<Post> posts = Collections.singletonList(testPost);
        when(postService.getPosts()).thenReturn(posts);

        // Act
        List<?> response = postController.getPosts();

        // Assert
        assertEquals(posts, response);
        verify(postService, times(1)).getPosts();
    }

    @Test
    void searchPosts_Success() {
        // Arrange
        List<Post> posts = Collections.singletonList(testPost);
        when(postService.searchPosts("content", "category", "author")).thenReturn(posts);

        // Act
        List<?> response = postController.searchPosts("content", "category", "author");

        // Assert
        assertEquals(posts, response);
        verify(postService, times(1)).searchPosts("content", "category", "author");
    }

    @Test
    void getPostById_Success() {
        // Arrange
        when(postService.getPostById(1L)).thenReturn(Optional.of(testPost));

        // Act
        ResponseEntity<?> response = postController.getPostById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).getPostById(1L);
    }

    @Test
    void getPostById_NotFound() {
        // Arrange
        when(postService.getPostById(1L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = postController.getPostById(1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).getPostById(1L);
    }

    @Test
    void deletePost_Success() {
        // Arrange
        when(postService.deletePost(1L)).thenReturn(true);

        // Act
        ResponseEntity<?> response = postController.deletePost(1L);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(postService, times(1)).deletePost(1L);
    }

    @Test
    void deletePost_NotFound() {
        // Arrange
        when(postService.deletePost(1L)).thenReturn(false);

        // Act
        ResponseEntity<?> response = postController.deletePost(1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).deletePost(1L);
    }
}