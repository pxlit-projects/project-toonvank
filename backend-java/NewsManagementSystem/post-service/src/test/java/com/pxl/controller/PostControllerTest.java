package com.pxl.controller;

import com.pxl.services.controller.PostController;
import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.services.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    @Mock
    private PostService postService;

    @InjectMocks
    private PostController postController;

    private Post post;

    @BeforeEach
    void setUp() {
        post = new Post(1L, "Test Title", "Test Content", "Author", LocalDateTime.now(), LocalDateTime.now(), ReviewStatus.DRAFT, "Category");
    }

    @Test
    void createPost_ShouldReturnCreatedPost() {
        when(postService.createPost(post)).thenReturn(post);

        ResponseEntity<Post> response = postController.createPost(post);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(post, response.getBody());
        verify(postService, times(1)).createPost(post);
    }

    @Test
    void updatePost_ShouldReturnUpdatedPost() {
        Post updatedPost = new Post(1L, "Updated Title", "Updated Content", "Updated Author", LocalDateTime.now(), LocalDateTime.now(), ReviewStatus.DRAFT, "Updated Category");
        when(postService.updatePost(1L, updatedPost)).thenReturn(Optional.of(updatedPost));

        ResponseEntity<Post> response = postController.updatePost(1L, updatedPost);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(updatedPost, response.getBody());
        verify(postService, times(1)).updatePost(1L, updatedPost);
    }

    @Test
    void updatePost_ShouldReturnNotFound_WhenPostDoesNotExist() {
        Post updatedPost = new Post(1L, "Updated Title", "Updated Content", "Updated Author", LocalDateTime.now(), LocalDateTime.now(), ReviewStatus.DRAFT, "Updated Category");
        when(postService.updatePost(1L, updatedPost)).thenReturn(Optional.empty());

        ResponseEntity<Post> response = postController.updatePost(1L, updatedPost);

        assertEquals(404, response.getStatusCodeValue());
        verify(postService, times(1)).updatePost(1L, updatedPost);
    }

    @Test
    void publishPost_ShouldReturnPUBLISHEDPost() {
        when(postService.updateStatus(1L)).thenReturn(Optional.of(post));

        ResponseEntity<Post> response = postController.publishPost(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(post, response.getBody());
        verify(postService, times(1)).updateStatus(1L);
    }

    @Test
    void publishPost_ShouldReturnNotFound_WhenPostDoesNotExist() {
        when(postService.updateStatus(1L)).thenReturn(Optional.empty());

        ResponseEntity<Post> response = postController.publishPost(1L);

        assertEquals(404, response.getStatusCodeValue());
        verify(postService, times(1)).updateStatus(1L);
    }

    @Test
    void getPostById_ShouldReturnPost_WhenPostExists() {
        when(postService.getPostById(1L)).thenReturn(Optional.of(post));

        ResponseEntity<Post> response = postController.getPostById(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(post, response.getBody());
        verify(postService, times(1)).getPostById(1L);
    }

    @Test
    void getPostById_ShouldReturnNotFound_WhenPostDoesNotExist() {
        when(postService.getPostById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Post> response = postController.getPostById(1L);

        assertEquals(404, response.getStatusCodeValue());
        verify(postService, times(1)).getPostById(1L);
    }

    @Test
    void deletePost_ShouldReturnNoContent_WhenPostDeleted() {
        when(postService.deletePost(1L)).thenReturn(true);

        ResponseEntity<Void> response = postController.deletePost(1L);

        assertEquals(204, response.getStatusCodeValue());
        verify(postService, times(1)).deletePost(1L);
    }

    @Test
    void deletePost_ShouldReturnNotFound_WhenPostDoesNotExist() {
        when(postService.deletePost(1L)).thenReturn(false);

        ResponseEntity<Void> response = postController.deletePost(1L);

        assertEquals(404, response.getStatusCodeValue());
        verify(postService, times(1)).deletePost(1L);
    }
}

