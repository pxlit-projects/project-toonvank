package com.pxl.services.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "review-service", url = "${review-service.url}")
public interface ReviewClient {
    @DeleteMapping("/api/reviews/post/{postId}")
    void deleteReviewsByPostId(@PathVariable("postId") Long postId);
}