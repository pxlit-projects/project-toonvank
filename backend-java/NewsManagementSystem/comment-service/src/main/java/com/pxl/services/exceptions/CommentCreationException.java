package com.pxl.services.exceptions;

public class CommentCreationException extends RuntimeException {
    public CommentCreationException(String message) {
        super(message);
    }
}