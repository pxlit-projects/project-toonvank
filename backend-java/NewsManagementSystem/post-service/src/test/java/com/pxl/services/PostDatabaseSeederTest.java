package com.pxl.services;

import com.pxl.services.domain.Post;
import com.pxl.services.domain.ReviewStatus;
import com.pxl.services.repository.PostRepository;
import com.pxl.services.services.PostDatabaseSeeder;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@Testcontainers
class PostDatabaseSeederTest {

    @Container
    private static final MySQLContainer<?> sqlContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");

    @MockBean
    private PostRepository postRepository;
    @Autowired
    private PostDatabaseSeeder seeder;

    @Captor
    private ArgumentCaptor<Post> postCaptor;

    @DynamicPropertySource
    static void registerMySQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", sqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", sqlContainer::getUsername);
        registry.add("spring.datasource.password", sqlContainer::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
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
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(savedPosts.get(2).getUpdatedAt())),
                () -> assertTrue(savedPosts.get(2).getCreatedAt().isBefore(LocalDateTime.now().minusMonths(1)))
        );
    }
}