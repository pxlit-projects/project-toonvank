package com.pxl.services.services;

import com.pxl.services.domain.Comment;
import com.pxl.services.repository.CommentRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

//TODO add GlobalExceptionHandler
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
        return commentRepository.save(comment);
    }

    public Optional<Comment> getCommentById(Long id) {
        log.info("Getting comment {}", id);
        return commentRepository.findById(id);
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        log.info("Getting comments by post id {}", postId);
        return commentRepository.findByPostId(postId);
    }

    @Transactional
    public Comment updateComment(Long id, String newContent) {
        log.info("Updating comment {}", id);
        Optional<Comment> commentOptional = commentRepository.findById(id);
        if (commentOptional.isPresent()) {
            Comment comment = commentOptional.get();
            comment.setContent(newContent);
            comment.setEditedAt(LocalDateTime.now());
            return commentRepository.save(comment);
        } else {
            throw new RuntimeException("Comment not found with ID: " + id);
        }
    }

    @Transactional
    public void deleteComment(Long id) {
        log.info("Deleting comment {}", id);
        Optional<Comment> commentOptional = commentRepository.findById(id);
        if (commentOptional.isPresent()) {
            commentRepository.deleteById(id);
        } else {
            throw new RuntimeException("Comment not found with ID: " + id);
        }
    }
}