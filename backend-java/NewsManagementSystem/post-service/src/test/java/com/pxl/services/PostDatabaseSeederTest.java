package com.pxl.services;

import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.PostRepository;
import com.pxl.services.services.PostDatabaseSeeder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PostDatabaseSeederTest {

    @Mock
    private PostRepository postRepository;

    private PostDatabaseSeeder seeder;

    @Captor
    private ArgumentCaptor<Post> postCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        seeder = new PostDatabaseSeeder(postRepository);
    }

    @Test
    void seedPosts_WhenDatabaseEmpty_ShouldSavePosts() {
        // Arrange
        when(postRepository.count()).thenReturn(0L);

        // Act
        seeder.seedPosts();

        // Assert
        verify(postRepository, times(3)).save(postCaptor.capture());
        var savedPosts = postCaptor.getAllValues();

        // Verify first post
        Post firstPost = savedPosts.get(0);
        assertAll("First Post Verification",
                () -> assertEquals("Introduction to Spring Boot", firstPost.getTitle()),
                () -> assertEquals("This is a beginner's guide to Spring Boot.", firstPost.getContent()),
                () -> assertEquals("John Doe", firstPost.getAuthor()),
                () -> assertEquals("updates", firstPost.getCategory()),
                () -> assertEquals(ReviewStatus.PUBLISHED, firstPost.getStatus()),
                () -> assertNotNull(firstPost.getCreatedAt()),
                () -> assertNotNull(firstPost.getUpdatedAt())
        );

        // Verify second post
        Post secondPost = savedPosts.get(1);
        assertAll("Second Post Verification",
                () -> assertEquals("Advanced Spring Security", secondPost.getTitle()),
                () -> assertEquals("Learn about advanced security concepts in Spring.", secondPost.getContent()),
                () -> assertEquals("Jane Smith", secondPost.getAuthor()),
                () -> assertEquals("announcements", secondPost.getCategory()),
                () -> assertEquals(ReviewStatus.PUBLISHED, secondPost.getStatus()),
                () -> assertNotNull(secondPost.getCreatedAt()),
                () -> assertNotNull(secondPost.getUpdatedAt())
        );

        // Verify third post (with older creation date)
        Post thirdPost = savedPosts.get(2);
        assertAll("Third Post Verification",
                () -> assertEquals("Advanced Spring Security", thirdPost.getTitle()),
                () -> assertEquals("Learn about advanced security concepts in Spring.", thirdPost.getContent()),
                () -> assertEquals("Jane Smith", thirdPost.getAuthor()),
                () -> assertEquals("announcements", thirdPost.getCategory()),
                () -> assertEquals(ReviewStatus.PUBLISHED, thirdPost.getStatus()),
                () -> assertNotNull(thirdPost.getCreatedAt()),
                () -> assertNotNull(thirdPost.getUpdatedAt()),
                () -> assertTrue(thirdPost.getCreatedAt().isBefore(thirdPost.getUpdatedAt()))
        );
    }

    @Test
    void seedPosts_WhenDatabaseNotEmpty_ShouldNotSavePosts() {
        // Arrange
        when(postRepository.count()).thenReturn(1L);

        // Act
        seeder.seedPosts();

        // Assert
        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    void seedPosts_ShouldSetCorrectTimestamps() {
        // Arrange
        when(postRepository.count()).thenReturn(0L);

        // Act
        seeder.seedPosts();

        // Assert
        verify(postRepository, times(3)).save(postCaptor.capture());
        var savedPosts = postCaptor.getAllValues();

        assertAll("Timestamp Verifications",
                // Verify first two posts have matching created/updated times
                () -> assertEquals(savedPosts.get(0).getCreatedAt(), savedPosts.get(0).getUpdatedAt()),
                () -> assertEquals(savedPosts.get(1).getCreatedAt(), savedPosts.get(1).getUpdatedAt()),

                // Verify third post has earlier created time than updated time
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(savedPosts.get(2).getUpdatedAt())),

                // Verify third post is older (created 2 months ago)
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(LocalDateTime.now())),
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isAfter(LocalDateTime.now().minusMonths(3))),
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(LocalDateTime.now().minusMonths(1)))
        );
    }
}