package com.courseselling.coursemanagement.repository;

import com.courseselling.coursemanagement.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
