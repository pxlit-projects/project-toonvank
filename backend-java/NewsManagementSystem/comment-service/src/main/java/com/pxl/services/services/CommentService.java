package com.pxl.services.services;

import com.pxl.services.domain.Comment;
import com.pxl.services.exceptions.CommentCreationException;
import com.pxl.services.exceptions.CommentDeletionException;
import com.pxl.services.exceptions.CommentNotFoundException;
import com.pxl.services.exceptions.CommentUpdateException;
import com.pxl.services.repository.CommentRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {
    private static final Logger log = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment createComment(Comment comment) {
        log.info("Creating comment {}", comment);
        try {
            return commentRepository.save(comment);
        } catch (Exception e) {
            throw new CommentCreationException("Failed to create comment: " + e.getMessage());
        }
    }

    public Optional<Comment> getCommentById(Long id) {
        log.info("Getting comment {}", id);
        try {
            Optional<Comment> comment = commentRepository.findById(id);
            if (comment.isEmpty()) {
                throw new CommentNotFoundException("Comment not found with ID: " + id);
            }
            return comment;
        } catch (CommentNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving comment: " + e.getMessage());
        }
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        log.info("Getting comments by post id {}", postId);
        try {
            return commentRepository.findByPostId(postId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve comments for post ID " + postId + ": " + e.getMessage());
        }
    }

    @Transactional
    public Comment updateComment(Long id, String newContent) {
        log.info("Updating comment {}", id);
        try {
            Optional<Comment> commentOptional = commentRepository.findById(id);
            if (commentOptional.isPresent()) {
                Comment comment = commentOptional.get();
                comment.setContent(newContent);
                comment.setEditedAt(LocalDateTime.now());
                return commentRepository.save(comment);
            } else {
                throw new CommentNotFoundException("Comment not found with ID: " + id);
            }
        } catch (CommentNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentUpdateException("Failed to update comment: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteComment(Long id) {
        log.info("Deleting comment {}", id);
        try {
            if (!commentRepository.existsById(id)) {
                throw new CommentNotFoundException("Comment not found with ID: " + id);
            }
            commentRepository.deleteById(id);
        } catch (CommentNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CommentDeletionException("Failed to delete comment: " + e.getMessage());
        }
    }
}