package com.example.content_delivery_service.repository;


import com.example.content_delivery_service.entity.ContentAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentAccessLogRepository extends JpaRepository<ContentAccessLog, Long> {
    List<ContentAccessLog> findByUserId(Long userId);
}

