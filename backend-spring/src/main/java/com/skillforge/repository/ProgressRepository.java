package com.skillforge.repository;

import com.skillforge.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Progress Repository - JPA repository for Progress entity
 * Queries for user progress tracking
 */
@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    
    /**
     * Find progress by user, course, and module
     */
    Optional<Progress> findByUserIdAndCourseIdAndModuleId(Long userId, Long courseId, String moduleId);
    
    /**
     * Find all progress records for a user
     */
    @Query("SELECT p FROM Progress p WHERE p.user.id = :userId")
    List<Progress> findAllByUserId(@Param("userId") Long userId);
    
    /**
     * Find all progress records for a specific course
     */
    @Query("SELECT p FROM Progress p WHERE p.course.id = :courseId")
    List<Progress> findAllByCourseId(@Param("courseId") Long courseId);
    
    /**
     * Find all completed modules for a user in a course
     */
    @Query("SELECT p FROM Progress p WHERE p.user.id = :userId AND p.course.id = :courseId AND p.completed = true")
    List<Progress> findCompletedModulesByUserAndCourse(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId
    );
}
