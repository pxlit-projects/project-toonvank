package com.pxl.controller;

import com.pxl.services.controller.CommentController;
import com.pxl.services.domain.Comment;
import com.pxl.services.services.CommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentControllerTest {

    @Mock
    private CommentService commentService;

    @InjectMocks
    private CommentController commentController;

    private Comment testComment;

    @BeforeEach
    void setUp() {
        testComment = Comment.builder()
                .id(1L)
                .postId(100L)
                .content("Test comment content")
                .createdAt(LocalDateTime.now())
                .postedBy("testUser")
                .build();
    }

    @Test
    void createComment_Success() {
        // Arrange
        when(commentService.createComment(testComment)).thenReturn(testComment);

        // Act
        ResponseEntity<Comment> response = commentController.createComment(testComment);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testComment, response.getBody());
        verify(commentService).createComment(testComment);
    }

    @Test
    void getCommentById_Exists() {
        // Arrange
        when(commentService.getCommentById(1L)).thenReturn(Optional.of(testComment));

        // Act
        ResponseEntity<Comment> response = commentController.getCommentById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testComment, response.getBody());
        verify(commentService).getCommentById(1L);
    }

    @Test
    void getCommentById_NotFound() {
        // Arrange
        when(commentService.getCommentById(1L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Comment> response = commentController.getCommentById(1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(commentService).getCommentById(1L);
    }

    @Test
    void getCommentsByPostId_Success() {
        // Arrange
        List<Comment> postComments = Arrays.asList(testComment,
                Comment.builder()
                        .id(2L)
                        .postId(100L)
                        .content("Another test comment")
                        .build());

        when(commentService.getCommentsByPostId(100L)).thenReturn(postComments);

        // Act
        ResponseEntity<List<Comment>> response = commentController.getCommentsByPostId(100L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        verify(commentService).getCommentsByPostId(100L);
    }

    /*@Test
    void updateComment_Success() {
        // Arrange
        String newContent = "Updated comment content";
        Comment updatedComment = testComment.toBuilder()
                .content(newContent)
                .editedAt(LocalDateTime.now())
                .build();

        when(commentService.updateComment(1L, newContent)).thenReturn(updatedComment);

        // Act
        ResponseEntity<Comment> response = commentController.updateComment(1L, newContent);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(newContent, response.getBody().getContent());
        verify(commentService).updateComment(1L, newContent);
    }*/

    @Test
    void updateComment_NotFound() {
        // Arrange
        String newContent = "Updated comment content";
        when(commentService.updateComment(1L, newContent)).thenThrow(new RuntimeException());

        // Act
        ResponseEntity<Comment> response = commentController.updateComment(1L, newContent);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(commentService).updateComment(1L, newContent);
    }

    @Test
    void deleteComment_Success() {
        // Arrange
        doNothing().when(commentService).deleteComment(1L);

        // Act
        ResponseEntity<Void> response = commentController.deleteComment(1L);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(commentService).deleteComment(1L);
    }

    @Test
    void deleteComment_NotFound() {
        // Arrange
        doThrow(new RuntimeException()).when(commentService).deleteComment(1L);

        // Act
        ResponseEntity<Void> response = commentController.deleteComment(1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(commentService).deleteComment(1L);
    }
}