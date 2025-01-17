package com.pxl.services.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final Map<Class<? extends RuntimeException>, HttpStatus> exceptionStatusMap = Map.of(
            CommentCreationException.class, HttpStatus.UNPROCESSABLE_ENTITY,
            CommentNotFoundException.class, HttpStatus.NOT_FOUND,
            CommentUpdateException.class, HttpStatus.CONFLICT,
            CommentDeletionException.class, HttpStatus.FORBIDDEN
    );

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleCommentException(RuntimeException ex) {
        log.error(ex.getMessage(), ex);
        HttpStatus status = exceptionStatusMap.getOrDefault(ex.getClass(), HttpStatus.INTERNAL_SERVER_ERROR);
        return new ResponseEntity<>(ex.getMessage(), status);
    }
}