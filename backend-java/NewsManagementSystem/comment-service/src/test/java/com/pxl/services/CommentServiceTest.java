package com.pxl.services;

import com.pxl.services.domain.Comment;
import com.pxl.services.repository.CommentRepository;
import com.pxl.services.services.CommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    private Comment testComment;

    @BeforeEach
    void setUp() {
        testComment = Comment.builder()
                .id(1L)
                .postId(100L)
                .content("Original comment content")
                .createdAt(LocalDateTime.now())
                .postedBy("testUser")
                .build();
    }

    @Test
    void createComment_Success() {
        // Arrange
        when(commentRepository.save(testComment)).thenReturn(testComment);

        // Act
        Comment createdComment = commentService.createComment(testComment);

        // Assert
        assertEquals(testComment, createdComment);
        verify(commentRepository).save(testComment);
    }

    @Test
    void getCommentById_Exists() {
        // Arrange
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));

        // Act
        Optional<Comment> foundComment = commentService.getCommentById(1L);

        // Assert
        assertTrue(foundComment.isPresent());
        assertEquals(testComment, foundComment.get());
        verify(commentRepository).findById(1L);
    }

    @Test
    void getCommentById_NotFound() {
        // Arrange
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Optional<Comment> foundComment = commentService.getCommentById(1L);

        // Assert
        assertFalse(foundComment.isPresent());
        verify(commentRepository).findById(1L);
    }

    @Test
    void getCommentsByPostId_Success() {
        // Arrange
        List<Comment> postComments = Arrays.asList(testComment,
                Comment.builder()
                        .id(2L)
                        .postId(100L)
                        .content("Another comment")
                        .build());

        when(commentRepository.findByPostId(100L)).thenReturn(postComments);

        // Act
        List<Comment> foundComments = commentService.getCommentsByPostId(100L);

        // Assert
        assertEquals(2, foundComments.size());
        verify(commentRepository).findByPostId(100L);
    }

    @Test
    void updateComment_Success() {
        // Arrange
        String newContent = "Updated comment content";
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment savedComment = invocation.getArgument(0);
            savedComment.setEditedAt(LocalDateTime.now());
            return savedComment;
        });

        // Act
        Comment updatedComment = commentService.updateComment(1L, newContent);

        // Assert
        assertEquals(newContent, updatedComment.getContent());
        assertNotNull(updatedComment.getEditedAt());
        verify(commentRepository).findById(1L);
        verify(commentRepository).save(testComment);
    }

    @Test
    void updateComment_NotFound() {
        // Arrange
        String newContent = "Updated comment content";
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> commentService.updateComment(1L, newContent));

        assertEquals("Comment not found with ID: 1", exception.getMessage());
        verify(commentRepository).findById(1L);
    }

    @Test
    void deleteComment_Success() {
        // Arrange
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));
        doNothing().when(commentRepository).deleteById(1L);

        // Act
        commentService.deleteComment(1L);

        // Assert
        verify(commentRepository).findById(1L);
        verify(commentRepository).deleteById(1L);
    }

    @Test
    void deleteComment_NotFound() {
        // Arrange
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> commentService.deleteComment(1L));

        assertEquals("Comment not found with ID: 1", exception.getMessage());
        verify(commentRepository).findById(1L);
        verify(commentRepository, never()).deleteById(1L);
    }
}