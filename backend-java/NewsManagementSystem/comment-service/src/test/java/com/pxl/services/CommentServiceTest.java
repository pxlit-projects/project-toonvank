package com.pxl.services;

import com.pxl.services.domain.Comment;
import com.pxl.services.repository.CommentRepository;
import com.pxl.services.services.CommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static junit.framework.Assert.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

//these work
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    private Comment comment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        comment = Comment.builder()
                .id(1L)
                .postId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .content("Sample comment")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createComment() {
        when(commentRepository.save(comment)).thenReturn(comment);

        Comment createdComment = commentService.createComment(comment);
        assertEquals(comment, createdComment);
        verify(commentRepository, times(1)).save(comment);
    }

    @Test
    void getCommentById_found() {
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));

        Optional<Comment> foundComment = commentService.getCommentById(comment.getId());
        assertTrue(foundComment.isPresent());
        assertEquals(comment, foundComment.get());
    }

    @Test
    void getCommentById_notFound() {
        when(commentRepository.findById(2L)).thenReturn(Optional.empty());

        Optional<Comment> foundComment = commentService.getCommentById(2L);
        assertFalse(foundComment.isPresent());
    }

    @Test
    void updateComment_found() {
        String updatedContent = "Updated content";
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));
        when(commentRepository.save(comment)).thenReturn(comment);

        Comment updatedComment = commentService.updateComment(comment.getId(), updatedContent);
        assertEquals(updatedContent, updatedComment.getContent());
        assertNotNull(updatedComment.getEditedAt());
    }

    @Test
    void updateComment_notFound() {
        when(commentRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> commentService.updateComment(2L, "Updated content"));
    }

    @Test
    void deleteComment_found() {
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));

        commentService.deleteComment(comment.getId());
        assertTrue(comment.isDeleted());
        verify(commentRepository, times(1)).save(comment);
    }

    @Test
    void deleteComment_notFound() {
        when(commentRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> commentService.deleteComment(2L));
    }
}
