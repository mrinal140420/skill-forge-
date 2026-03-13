package com.skillforge.repository;

import com.skillforge.entity.CourseAdminAssignment;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseAdminAssignmentRepository extends JpaRepository<CourseAdminAssignment, Long> {
    
    /**
     * Find all courses assigned to an admin
     */
    List<CourseAdminAssignment> findByAdmin(User admin);
    
    /**
     * Find all admins assigned to a course
     */
    List<CourseAdminAssignment> findByCourse(Course course);
    
    /**
     * Check if an admin is assigned to a specific course
     */
    Optional<CourseAdminAssignment> findByCourseAndAdmin(Course course, User admin);
    
    /**
     * Check if an admin is assigned to a course by IDs
     */
    Optional<CourseAdminAssignment> findByCourseIdAndAdminId(Long courseId, Long adminId);
    
    /**
     * Find all assignments for a course by course ID
     */
    List<CourseAdminAssignment> findByCourseId(Long courseId);
    
    /**
     * Find all assignments for an admin by admin ID
     */
    List<CourseAdminAssignment> findByAdminId(Long adminId);
}
