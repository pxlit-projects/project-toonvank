package com.pxl.services;

import com.pxl.services.domain.Comment;
import com.pxl.services.exceptions.CommentCreationException;
import com.pxl.services.exceptions.CommentDeletionException;
import com.pxl.services.exceptions.CommentNotFoundException;
import com.pxl.services.exceptions.CommentUpdateException;
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
        when(commentRepository.save(testComment)).thenReturn(testComment);

        Comment createdComment = commentService.createComment(testComment);

        assertEquals(testComment, createdComment);
        verify(commentRepository).save(testComment);
    }

    @Test
    void createComment_Failure() {
        when(commentRepository.save(testComment)).thenThrow(new RuntimeException("Database error"));

        CommentCreationException exception = assertThrows(CommentCreationException.class,
                () -> commentService.createComment(testComment));

        assertEquals("Failed to create comment: Database error", exception.getMessage());
        verify(commentRepository).save(testComment);
    }

    @Test
    void getCommentById_Success() {
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));

        Optional<Comment> foundComment = commentService.getCommentById(1L);

        assertTrue(foundComment.isPresent());
        assertEquals(testComment, foundComment.get());
        verify(commentRepository).findById(1L);
    }

    @Test
    void getCommentById_NotFound() {
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        CommentNotFoundException exception = assertThrows(CommentNotFoundException.class,
                () -> commentService.getCommentById(1L));

        assertEquals("Comment not found with ID: 1", exception.getMessage());
        verify(commentRepository).findById(1L);
    }

    @Test
    void getCommentsByPostId_Success() {
        List<Comment> postComments = Arrays.asList(testComment,
                Comment.builder()
                        .id(2L)
                        .postId(100L)
                        .content("Another comment")
                        .build());

        when(commentRepository.findByPostId(100L)).thenReturn(postComments);

        List<Comment> foundComments = commentService.getCommentsByPostId(100L);

        assertEquals(2, foundComments.size());
        verify(commentRepository).findByPostId(100L);
    }

    @Test
    void getCommentsByPostId_Failure() {
        when(commentRepository.findByPostId(100L)).thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> commentService.getCommentsByPostId(100L));

        assertEquals("Failed to retrieve comments for post ID 100: Database error", exception.getMessage());
        verify(commentRepository).findByPostId(100L);
    }

    @Test
    void updateComment_Success() {
        String newContent = "Updated comment content";
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment savedComment = invocation.getArgument(0);
            savedComment.setEditedAt(LocalDateTime.now());
            return savedComment;
        });

        Comment updatedComment = commentService.updateComment(1L, newContent);

        assertEquals(newContent, updatedComment.getContent());
        assertNotNull(updatedComment.getEditedAt());
        verify(commentRepository).findById(1L);
        verify(commentRepository).save(testComment);
    }

    @Test
    void updateComment_NotFound() {
        String newContent = "Updated comment content";
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        CommentNotFoundException exception = assertThrows(CommentNotFoundException.class,
                () -> commentService.updateComment(1L, newContent));

        assertEquals("Comment not found with ID: 1", exception.getMessage());
        verify(commentRepository).findById(1L);
        verify(commentRepository, never()).save(any());
    }

    @Test
    void updateComment_SaveFailure() {
        String newContent = "Updated comment content";
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));
        when(commentRepository.save(any(Comment.class))).thenThrow(new RuntimeException("Database error"));

        CommentUpdateException exception = assertThrows(CommentUpdateException.class,
                () -> commentService.updateComment(1L, newContent));

        assertEquals("Failed to update comment: Database error", exception.getMessage());
        verify(commentRepository).findById(1L);
        verify(commentRepository).save(any());
    }

    @Test
    void deleteComment_Success() {
        when(commentRepository.existsById(1L)).thenReturn(true);
        doNothing().when(commentRepository).deleteById(1L);

        assertDoesNotThrow(() -> commentService.deleteComment(1L));

        verify(commentRepository).existsById(1L);
        verify(commentRepository).deleteById(1L);
    }

    @Test
    void deleteComment_NotFound() {
        when(commentRepository.existsById(1L)).thenReturn(false);

        CommentNotFoundException exception = assertThrows(CommentNotFoundException.class,
                () -> commentService.deleteComment(1L));

        assertEquals("Comment not found with ID: 1", exception.getMessage());
        verify(commentRepository).existsById(1L);
        verify(commentRepository, never()).deleteById(any());
    }

    @Test
    void deleteComment_DeletionFailure() {
        when(commentRepository.existsById(1L)).thenReturn(true);
        doThrow(new RuntimeException("Database error")).when(commentRepository).deleteById(1L);

        CommentDeletionException exception = assertThrows(CommentDeletionException.class,
                () -> commentService.deleteComment(1L));

        assertEquals("Failed to delete comment: Database error", exception.getMessage());
        verify(commentRepository).existsById(1L);
        verify(commentRepository).deleteById(1L);
    }
}