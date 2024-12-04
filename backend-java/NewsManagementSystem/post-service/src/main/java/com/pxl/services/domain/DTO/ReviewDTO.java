package com.pxl.services.domain.DTO;


import java.io.Serializable;
import java.time.LocalDateTime;

public class ReviewDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private final Long id;
    private final Long postId;
    private final Long reviewerId;
    private final ReviewStatus status;
    private final String comment;
    private final LocalDateTime reviewedAt;

    public ReviewDTO(Long id, Long postId, Long reviewerId, ReviewStatus status, String comment, LocalDateTime reviewedAt) {
        this.id = id;
        this.postId = postId;
        this.reviewerId = reviewerId;
        this.status = status;
        this.comment = comment;
        this.reviewedAt = reviewedAt;
    }
}
