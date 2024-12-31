package com.pxl.services;

import com.pxl.services.domain.Comment;
import com.pxl.services.repository.CommentRepository;
import com.pxl.services.services.CommentDatabaseSeeder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommentDatabaseSeederTest {

    @Mock
    private CommentRepository commentRepository;

    private CommentDatabaseSeeder seeder;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        seeder = new CommentDatabaseSeeder(commentRepository);
    }

    @Test
    void seedComments_WhenDatabaseEmpty_ShouldSaveComments() {
        // Arrange
        when(commentRepository.count()).thenReturn(0L);

        // Act
        seeder.seedComments();

        // Assert
        verify(commentRepository, times(6)).save(commentCaptor.capture());
        var savedComments = commentCaptor.getAllValues();

        // Verify first comment
        assertEquals("This introduction to Spring Boot is exactly what I needed!",
                savedComments.get(0).getContent());
        assertEquals("John Doe", savedComments.get(0).getPostedBy());
        assertEquals(12L, savedComments.get(0).getPostId());
        assertNotNull(savedComments.get(0).getCreatedAt());

        // Verify second comment
        assertEquals("Great explanation of the basics. Looking forward to more content!",
                savedComments.get(1).getContent());
        assertEquals("Uncle Rick", savedComments.get(1).getPostedBy());
        assertEquals(13L, savedComments.get(1).getPostId());
        assertNotNull(savedComments.get(1).getCreatedAt());

        // Verify third comment (with edited date)
        assertEquals("The security concepts are well explained. Would love to see more examples.",
                savedComments.get(2).getContent());
        assertEquals("Miles Davis", savedComments.get(2).getPostedBy());
        assertEquals(13L, savedComments.get(2).getPostId());
        assertNotNull(savedComments.get(2).getCreatedAt());
        assertNotNull(savedComments.get(2).getEditedAt());

        // Verify number of saves
        verify(commentRepository, times(6)).save(any(Comment.class));
    }

    @Test
    void seedComments_WhenDatabaseNotEmpty_ShouldNotSaveComments() {
        // Arrange
        when(commentRepository.count()).thenReturn(1L);

        // Act
        seeder.seedComments();

        // Assert
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void seedComments_ShouldSetCorrectTimestamps() {
        // Arrange
        when(commentRepository.count()).thenReturn(0L);

        // Act
        seeder.seedComments();

        // Assert
        verify(commentRepository, times(6)).save(commentCaptor.capture());
        var savedComments = commentCaptor.getAllValues();

        // Check that timestamps are set correctly
        assertAll(
                () -> assertTrue(savedComments.get(0).getCreatedAt().isBefore(savedComments.get(0).getCreatedAt().plusSeconds(1))),
                () -> assertTrue(savedComments.get(1).getCreatedAt().isBefore(savedComments.get(0).getCreatedAt())),
                () -> assertTrue(savedComments.get(2).getCreatedAt().isBefore(savedComments.get(1).getCreatedAt())),
                () -> assertNotNull(savedComments.get(2).getEditedAt()),
                () -> assertNotNull(savedComments.get(5).getEditedAt())
        );
    }
}