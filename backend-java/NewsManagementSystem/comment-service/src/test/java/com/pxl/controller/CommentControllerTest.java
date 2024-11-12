package com.pxl.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pxl.services.controller.CommentController;
import com.pxl.services.domain.Comment;
import com.pxl.services.services.CommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

//TODO this one does not work
@WebMvcTest(CommentController.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommentService commentService;

    @Autowired
    private ObjectMapper objectMapper;

    private Comment comment;

    @BeforeEach
    void setUp() {
        comment = Comment.builder()
                .id(1L)
                .postId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .content("Sample comment")
                .build();
    }

    @Test
    void createComment() throws Exception {
        when(commentService.createComment(any(Comment.class))).thenReturn(comment);

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(comment)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Sample comment"));
    }

    @Test
    void getCommentById_found() throws Exception {
        when(commentService.getCommentById(comment.getId())).thenReturn(Optional.of(comment));

        mockMvc.perform(get("/api/comments/{id}", comment.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Sample comment"));
    }

    @Test
    void getCommentById_notFound() throws Exception {
        when(commentService.getCommentById(2L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/comments/{id}", 2L))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateComment() throws Exception {
        comment.setContent("Updated content");
        when(commentService.updateComment(anyLong(), anyString())).thenReturn(comment);

        mockMvc.perform(put("/api/comments/{id}", comment.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\": \"Updated content\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Updated content"));
    }

    @Test
    void deleteComment() throws Exception {
        doNothing().when(commentService).deleteComment(comment.getId());

        mockMvc.perform(delete("/api/comments/{id}", comment.getId()))
                .andExpect(status().isNoContent());
    }
}
