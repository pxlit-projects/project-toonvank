package com.pxl.services;

import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.exceptions.PostCreationException;
import com.pxl.services.repository.PostRepository;
import com.pxl.services.services.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static junit.framework.Assert.assertFalse;
import static junit.framework.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private PostService postService;

    private Post post;

    @BeforeEach
    void setUp() {
        post = new Post(1L, "Test Title", "Test Content", "Author", LocalDateTime.now(), LocalDateTime.now(), ReviewStatus.DRAFT, "Category");
    }

    @Test
    void createPost_ShouldReturnPost() {
        when(postRepository.save(post)).thenReturn(post);

        Post result = postService.createPost(post);

        assertEquals(post, result);
        verify(postRepository, times(1)).save(post);
    }

    @Test
    void createPost_ShouldThrowException_WhenPostCreationFails() {
        when(postRepository.save(post)).thenThrow(new RuntimeException("Error"));

        assertThrows(PostCreationException.class, () -> postService.createPost(post));
    }

    @Test
    void updatePost_ShouldReturnUpdatedPost_WhenPostExists() {
        Post updatedPost = new Post(1L, "Updated Title", "Updated Content", "Updated Author", LocalDateTime.now(), LocalDateTime.now(), ReviewStatus.DRAFT, "Updated Category");
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(post)).thenReturn(updatedPost);

        Optional<Post> result = postService.updatePost(1L, updatedPost);

        assertTrue(result.isPresent());
        assertEquals(updatedPost, result.get());
        verify(postRepository, times(1)).findById(1L);
        verify(postRepository, times(1)).save(post);
    }

    @Test
    void updatePost_ShouldReturnEmpty_WhenPostDoesNotExist() {
        Post updatedPost = new Post(1L, "Updated Title", "Updated Content", "Updated Author", LocalDateTime.now(), LocalDateTime.now(), ReviewStatus.DRAFT, "Updated Category");
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<Post> result = postService.updatePost(1L, updatedPost);

        assertFalse(result.isPresent());
        verify(postRepository, times(1)).findById(1L);
    }

    @Test
    void publishPost_ShouldReturnPUBLISHEDPost_WhenPostExists() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(post)).thenReturn(post);

        Optional<Post> result = postService.updateStatus(1L);

        assertTrue(result.isPresent());
        assertEquals(ReviewStatus.PUBLISHED, result.get().getStatus());
        verify(postRepository, times(1)).findById(1L);
        verify(postRepository, times(1)).save(post);
    }

    @Test
    void publishPost_ShouldReturnEmpty_WhenPostDoesNotExist() {
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<Post> result = postService.updateStatus(1L);

        assertFalse(result.isPresent());
        verify(postRepository, times(1)).findById(1L);
    }

    @Test
    void deletePost_ShouldReturnTrue_WhenPostExists() {
        when(postRepository.existsById(1L)).thenReturn(true);

        boolean result = postService.deletePost(1L);

        assertTrue(result);
        verify(postRepository, times(1)).existsById(1L);
        verify(postRepository, times(1)).deleteById(1L);
    }

    @Test
    void deletePost_ShouldReturnFalse_WhenPostDoesNotExist() {
        when(postRepository.existsById(1L)).thenReturn(false);

        boolean result = postService.deletePost(1L);

        assertFalse(result);
        verify(postRepository, times(1)).existsById(1L);
    }
}