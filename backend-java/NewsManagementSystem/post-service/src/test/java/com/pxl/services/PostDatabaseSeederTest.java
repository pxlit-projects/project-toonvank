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

        when(postRepository.count()).thenReturn(0L);


        seeder.seedPosts();


        verify(postRepository, times(3)).save(postCaptor.capture());
        var savedPosts = postCaptor.getAllValues();

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
        when(postRepository.count()).thenReturn(1L);

        seeder.seedPosts();

        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    void seedPosts_ShouldSetCorrectTimestamps() {
        when(postRepository.count()).thenReturn(0L);

        seeder.seedPosts();

        verify(postRepository, times(3)).save(postCaptor.capture());
        var savedPosts = postCaptor.getAllValues();

        assertAll("Timestamp Verifications",
                () -> assertEquals(savedPosts.get(0).getCreatedAt(), savedPosts.get(0).getUpdatedAt()),
                () -> assertEquals(savedPosts.get(1).getCreatedAt(), savedPosts.get(1).getUpdatedAt()),

                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(savedPosts.get(2).getUpdatedAt())),

                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(LocalDateTime.now())),
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isAfter(LocalDateTime.now().minusMonths(3))),
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(LocalDateTime.now().minusMonths(1)))
        );
    }
}