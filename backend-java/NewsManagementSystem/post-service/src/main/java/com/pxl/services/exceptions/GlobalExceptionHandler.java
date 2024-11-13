package com.pxl.services.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Map<Class<? extends RuntimeException>, HttpStatus> exceptionStatusMap = Map.of(
            PostCreationException.class, HttpStatus.UNPROCESSABLE_ENTITY,
            PostDeletionException.class, HttpStatus.FORBIDDEN,
            PostNotFoundException.class, HttpStatus.NOT_FOUND,
            PostPublishException.class, HttpStatus.FORBIDDEN,
            PostUpdateException.class, HttpStatus.CONFLICT
    );

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handlePostException(RuntimeException ex) {
        HttpStatus status = exceptionStatusMap.getOrDefault(ex.getClass(), HttpStatus.INTERNAL_SERVER_ERROR);
        return new ResponseEntity<>(ex.getMessage(), status);
    }
}
