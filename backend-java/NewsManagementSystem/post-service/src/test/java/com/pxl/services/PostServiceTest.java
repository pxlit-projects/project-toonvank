package com.pxl.services;

import com.pxl.services.clients.ReviewClient;
import com.pxl.services.domain.DTO.PostDTO;
import com.pxl.services.domain.DTO.ReviewDTO;
import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.domain.mapper.PostMapper;
import com.pxl.services.exceptions.*;
import com.pxl.services.repository.PostRepository;
import com.pxl.services.services.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@Testcontainers
public class PostServiceTest {

    @Container
    private static final MySQLContainer<?> sqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");

    @MockBean
    private PostRepository postRepository;
    @MockBean
    private PostMapper postMapper;
    @MockBean
    private ReviewClient reviewClient;
    @Autowired
    private PostService postService;

    private PostDTO testPostDTO;
    private Post testPost;

    @DynamicPropertySource
    static void registerMySQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", sqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", sqlContainer::getUsername);
        registry.add("spring.datasource.password", sqlContainer::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

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
        when(postMapper.toPost(testPostDTO)).thenReturn(testPost);
        when(postRepository.save(testPost)).thenReturn(testPost);

        Post createdPost = postService.createPost(testPostDTO);

        assertEquals(testPost, createdPost);
        verify(postMapper).toPost(testPostDTO);
        verify(postRepository).save(testPost);
    }

    @Test
    void createPost_Exception() {
        when(postMapper.toPost(testPostDTO)).thenReturn(testPost);
        when(postRepository.save(testPost)).thenThrow(new RuntimeException("Save failed"));

        assertThrows(PostCreationException.class, () -> postService.createPost(testPostDTO));
    }

    @Test
    void updatePost_Success() {
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

        Optional<Post> result = postService.updatePost(1L, updatedPostData);

        assertTrue(result.isPresent());
        assertEquals("Updated Title", result.get().getTitle());
        assertEquals("Updated Content", result.get().getContent());
        assertEquals("Updated Author", result.get().getAuthor());
        assertEquals("Updated Category", result.get().getCategory());
        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void updateStatus_Success() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        Optional<Post> result = postService.updateStatus(1L, "PUBLISHED");

        assertTrue(result.isPresent());
        assertEquals(ReviewStatus.PUBLISHED, result.get().getStatus());
        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void updateStatus_InvalidStatus() {
        assertThrows(IllegalArgumentException.class,
                () -> postService.updateStatus(1L, "INVALID_STATUS"));
    }

    @Test
    void getPosts_Success() {
        List<Post> posts = Collections.singletonList(testPost);
        when(postRepository.findAll()).thenReturn(posts);

        List<Post> result = postService.getPosts();

        assertEquals(posts, result);
        verify(postRepository).findAll();
    }

    @Test
    void searchPosts_Success() {
        List<Post> posts = Collections.singletonList(testPost);
        when(postRepository.findByContentContainingOrCategoryOrAuthor(
                "content", "category", "author")).thenReturn(posts);

        List<Post> result = postService.searchPosts("content", "category", "author");

        assertEquals(posts, result);
        verify(postRepository).findByContentContainingOrCategoryOrAuthor(
                "content", "category", "author");
    }

    @Test
    void getPostById_Success() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));

        Optional<Post> result = postService.getPostById(1L);

        assertTrue(result.isPresent());
        assertEquals(testPost, result.get());
        verify(postRepository).findById(1L);
    }

    @Test
    void deletePost_Success() {
        when(postRepository.existsById(1L)).thenReturn(true);
        doNothing().when(reviewClient).deleteReviewsByPostId(1L);
        doNothing().when(postRepository).deleteById(1L);

        boolean result = postService.deletePost(1L);

        assertTrue(result);
        verify(postRepository).existsById(1L);
        verify(reviewClient).deleteReviewsByPostId(1L);
        verify(postRepository).deleteById(1L);
    }

    @Test
    void deletePost_PostNotExists() {
        when(postRepository.existsById(1L)).thenReturn(false);

        assertThrows(PostDeletionException.class, () -> postService.deletePost(1L));
    }

    @Test
    void processReviewMessage_Success() {
        ReviewDTO reviewDTO = new ReviewDTO(
                1L,
                ReviewStatus.PUBLISHED,
                "Test Comment",
                LocalDateTime.now()
        );

        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        postService.processReviewMessage(reviewDTO);

        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void processReviewMessage_PostNotFound() {
        ReviewDTO reviewDTO = new ReviewDTO(
                1L,
                ReviewStatus.PUBLISHED,
                "Test Comment",
                LocalDateTime.now()
        );

        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        postService.processReviewMessage(reviewDTO);
        verify(postRepository).findById(1L);
        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    void updatePost_ThrowsException() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenThrow(new RuntimeException("Save failed"));

        assertThrows(PostUpdateException.class, () -> postService.updatePost(1L, testPost));
        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void getPosts_ThrowsException() {
        when(postRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        assertThrows(PostPublishException.class, () -> postService.getPosts());
        verify(postRepository).findAll();
    }

    @Test
    void searchPosts_ThrowsException() {
        when(postRepository.findByContentContainingOrCategoryOrAuthor(anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Search failed"));

        assertThrows(RuntimeException.class,
                () -> postService.searchPosts("content", "category", "author"));
        verify(postRepository).findByContentContainingOrCategoryOrAuthor(
                "content", "category", "author");
    }

    @Test
    void getPostById_ThrowsException() {
        when(postRepository.findById(1L)).thenThrow(new RuntimeException("Database error"));

        assertThrows(PostNotFoundException.class, () -> postService.getPostById(1L));
        verify(postRepository).findById(1L);
    }

    @Test
    void deletePost_ReviewClientThrowsException() {
        when(postRepository.existsById(1L)).thenReturn(true);
        doThrow(RuntimeException.class)
                .when(reviewClient).deleteReviewsByPostId(1L);

        assertThrows(PostDeletionException.class, () -> postService.deletePost(1L));
        verify(postRepository).existsById(1L);
        verify(reviewClient).deleteReviewsByPostId(1L);
        verify(postRepository, never()).deleteById(1L);
    }

    @Test
    void processReviewMessage_ThrowsException() {
        ReviewDTO reviewDTO = new ReviewDTO(
                1L,
                ReviewStatus.PUBLISHED,
                "Test Comment",
                LocalDateTime.now()
        );

        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenThrow(new RuntimeException("Save failed"));

        postService.processReviewMessage(reviewDTO);

        verify(postRepository).findById(1L);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void updatePost_NotFound() {
        LocalDateTime now = LocalDateTime.now();
        when(postRepository.findById(1L)).thenReturn(Optional.empty());
        Post updatedPostData = Post.builder()
                .title("Test Title")
                .content("Test Content")
                .author("Test Author")
                .category("Test Category")
                .createdAt(now)
                .updatedAt(now)
                .status(ReviewStatus.DRAFT)
                .build();

        Optional<Post> result = postService.updatePost(1L, updatedPostData);

        assertTrue(result.isEmpty());
        verify(postRepository).findById(1L);
        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    void updateStatus_NotFound() {
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<Post> result = postService.updateStatus(1L, "PUBLISHED");

        assertTrue(result.isEmpty());
        verify(postRepository).findById(1L);
        verify(postRepository, never()).save(any(Post.class));
    }
}