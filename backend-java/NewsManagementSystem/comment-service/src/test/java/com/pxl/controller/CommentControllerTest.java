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
        when(commentService.createComment(testComment)).thenReturn(testComment);

        ResponseEntity<Comment> response = commentController.createComment(testComment);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testComment, response.getBody());
        verify(commentService).createComment(testComment);
    }

    @Test
    void getCommentById_Exists() {
        when(commentService.getCommentById(1L)).thenReturn(Optional.of(testComment));

        ResponseEntity<Comment> response = commentController.getCommentById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testComment, response.getBody());
        verify(commentService).getCommentById(1L);
    }

    @Test
    void getCommentById_NotFound() {
        when(commentService.getCommentById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Comment> response = commentController.getCommentById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(commentService).getCommentById(1L);
    }

    @Test
    void getCommentsByPostId_Success() {
        List<Comment> postComments = Arrays.asList(testComment,
                Comment.builder()
                        .id(2L)
                        .postId(100L)
                        .content("Another test comment")
                        .build());

        when(commentService.getCommentsByPostId(100L)).thenReturn(postComments);

        ResponseEntity<List<Comment>> response = commentController.getCommentsByPostId(100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        verify(commentService).getCommentsByPostId(100L);
    }

    @Test
    void updateComment_NotFound() {
        String newContent = "Updated comment content";
        when(commentService.updateComment(1L, newContent)).thenThrow(new RuntimeException());

        ResponseEntity<Comment> response = commentController.updateComment(1L, newContent);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(commentService).updateComment(1L, newContent);
    }

    @Test
    void deleteComment_Success() {
        doNothing().when(commentService).deleteComment(1L);

        ResponseEntity<Void> response = commentController.deleteComment(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(commentService).deleteComment(1L);
    }

    @Test
    void deleteComment_NotFound() {
        doThrow(new RuntimeException()).when(commentService).deleteComment(1L);

        ResponseEntity<Void> response = commentController.deleteComment(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(commentService).deleteComment(1L);
    }
}