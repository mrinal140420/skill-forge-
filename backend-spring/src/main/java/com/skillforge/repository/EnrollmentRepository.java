package com.skillforge.repository;

import com.skillforge.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Enrollment Repository - JPA repository for Enrollment entity
 * Custom queries for enrollment-specific operations
 */
@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    /**
     * Find enrollment by user ID and course ID
     * Used to check if user is already enrolled in a course
     */
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    
    /**
     * Find all enrollments for a specific user
     * Ordered by enrollment date descending
     */
    @Query("SELECT e FROM Enrollment e WHERE e.user.id = :userId ORDER BY e.enrolledAt DESC")
    List<Enrollment> findAllByUserIdOrderByEnrolledAtDesc(@Param("userId") Long userId);
    
    /**
     * Check if user is enrolled in a course
     */
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}
