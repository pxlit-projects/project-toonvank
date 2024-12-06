package com.pxl.services.domain.DTO;


import com.pxl.services.domain.ReviewStatus;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private final Long postId;
    private final Long reviewerId;
    private final ReviewStatus status;
    private final String comment;
    private final LocalDateTime reviewedAt;

    public ReviewDTO(Long postId, Long reviewerId, ReviewStatus status, String comment, LocalDateTime reviewedAt) {
        this.postId = postId;
        this.reviewerId = reviewerId;
        this.status = status;
        this.comment = comment;
        this.reviewedAt = reviewedAt;
    }
}
