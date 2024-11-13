package com.pxl.services.exceptions;

public class PostCreationException extends RuntimeException {
    public PostCreationException(String message) {
        super(message);
    }
}