package com.pxl.services.exceptions;

public class CommentDeletionException extends RuntimeException {
    public CommentDeletionException(String message) {
        super(message);
    }
}