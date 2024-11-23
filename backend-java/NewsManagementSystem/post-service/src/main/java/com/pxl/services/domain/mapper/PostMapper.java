package com.pxl.services.domain.mapper;

import com.pxl.services.domain.DTO.PostDTO;
import com.pxl.services.domain.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {

    Post toPost(PostDTO postDTO);
}