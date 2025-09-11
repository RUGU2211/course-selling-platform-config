package com.example.content_delivery_service.repository;

import com.example.content_delivery_service.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    List<Content> findByCourseId(Long courseId);
    List<Content> findByType(String type);
}
