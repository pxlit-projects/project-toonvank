package com.pxl.services.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId; // References the Post being reviewed

    @Column(nullable = false)
    private Long reviewerId; // ID of the reviewer (user)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status; // Status of the review (PENDING, APPROVED, REJECTED)

    @Column(length = 1000)
    private String comment; // Optional review comment

    @Column(nullable = false)
    private LocalDateTime reviewedAt; // Timestamp of when the review was made

    @PrePersist
    @PreUpdate
    protected void onPersistOrUpdate() {
        this.reviewedAt = LocalDateTime.now();
    }
}