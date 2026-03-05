package com.skillforge.repository;

import com.skillforge.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Course Repository - JPA repository for Course entity
 * Extends JpaSpecificationExecutor for dynamic filtering and sorting
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    
    /**
     * Find course by slug
     */
    Optional<Course> findBySlug(String slug);
    
    /**
     * Find course by title
     */
    Optional<Course> findByTitle(String title);
    
    /**
     * Check if course exists by title
     */
    boolean existsByTitle(String title);
}
