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

        when(postService.createPost(testPostDTO)).thenReturn(testPost);


        ResponseEntity<?> response = postController.createPost(testPostDTO);


        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).createPost(testPostDTO);
    }

    @Test
    void createPost_Exception() {

        when(postService.createPost(testPostDTO)).thenThrow(new RuntimeException("Creation failed"));


        ResponseEntity<?> response = postController.createPost(testPostDTO);


        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(((java.util.Map<?, ?>) response.getBody()).containsKey("message"));
        verify(postService, times(1)).createPost(testPostDTO);
    }

    @Test
    void updatePost_Success() {

        when(postService.updatePost(1L, testPost)).thenReturn(Optional.of(testPost));


        ResponseEntity<?> response = postController.updatePost(1L, testPost);


        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).updatePost(1L, testPost);
    }

    @Test
    void updatePost_NotFound() {

        when(postService.updatePost(1L, testPost)).thenReturn(Optional.empty());


        ResponseEntity<?> response = postController.updatePost(1L, testPost);


        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).updatePost(1L, testPost);
    }

    @Test
    void updateStatus_Success() {

        when(postService.updateStatus(1L, "PUBLISHED")).thenReturn(Optional.of(testPost));


        ResponseEntity<?> response = postController.updateStatus(1L, "PUBLISHED");


        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).updateStatus(1L, "PUBLISHED");
    }

    @Test
    void updateStatus_NotFound() {

        when(postService.updateStatus(1L, "PUBLISHED")).thenReturn(Optional.empty());


        ResponseEntity<?> response = postController.updateStatus(1L, "PUBLISHED");


        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).updateStatus(1L, "PUBLISHED");
    }

    @Test
    void getPosts_Success() {

        List<Post> posts = Collections.singletonList(testPost);
        when(postService.getPosts()).thenReturn(posts);


        List<?> response = postController.getPosts();


        assertEquals(posts, response);
        verify(postService, times(1)).getPosts();
    }

    @Test
    void searchPosts_Success() {

        List<Post> posts = Collections.singletonList(testPost);
        when(postService.searchPosts("content", "category", "author")).thenReturn(posts);


        List<?> response = postController.searchPosts("content", "category", "author");


        assertEquals(posts, response);
        verify(postService, times(1)).searchPosts("content", "category", "author");
    }

    @Test
    void getPostById_Success() {

        when(postService.getPostById(1L)).thenReturn(Optional.of(testPost));


        ResponseEntity<?> response = postController.getPostById(1L);


        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testPost, response.getBody());
        verify(postService, times(1)).getPostById(1L);
    }

    @Test
    void getPostById_NotFound() {

        when(postService.getPostById(1L)).thenReturn(Optional.empty());


        ResponseEntity<?> response = postController.getPostById(1L);


        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).getPostById(1L);
    }

    @Test
    void deletePost_Success() {

        when(postService.deletePost(1L)).thenReturn(true);


        ResponseEntity<?> response = postController.deletePost(1L);


        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(postService, times(1)).deletePost(1L);
    }

    @Test
    void deletePost_NotFound() {

        when(postService.deletePost(1L)).thenReturn(false);


        ResponseEntity<?> response = postController.deletePost(1L);


        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(postService, times(1)).deletePost(1L);
    }
}