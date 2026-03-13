package com.skillforge.security;

import com.skillforge.entity.User;
import com.skillforge.entity.CourseAdminAssignment;
import com.skillforge.repository.CourseAdminAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Authorization utility for role and permission checks
 * Used by controllers and services to enforce access control
 */
@Component
public class AuthorizationUtil {
    
    @Autowired
    private CourseAdminAssignmentRepository courseAdminAssignmentRepository;
    
    /**
     * Check if user is a SUPER_ADMIN
     */
    public boolean isSuperAdmin(User user) {
        return user != null && (user.getRole() == User.UserRole.SUPER_ADMIN || user.getRole() == User.UserRole.ADMIN);
    }
    
    /**
     * Check if user is a COURSE_ADMIN
     */
    public boolean isCourseAdmin(User user) {
        return user != null && user.getRole() == User.UserRole.COURSE_ADMIN;
    }
    
    /**
     * Check if user is a STUDENT
     */
    public boolean isStudent(User user) {
        return user != null && user.getRole() == User.UserRole.STUDENT;
    }
    
    /**
     * Check if user is any kind of admin (SUPER_ADMIN or COURSE_ADMIN)
     */
    public boolean isAdmin(User user) {
        return isSuperAdmin(user) || isCourseAdmin(user);
    }
    
    /**
     * Check if a COURSE_ADMIN is assigned to a specific course
     */
    public boolean isAssignedToCourse(User admin, Long courseId) {
        if (!isCourseAdmin(admin)) {
            return false;
        }
        Optional<CourseAdminAssignment> assignment = courseAdminAssignmentRepository.findByCourseIdAndAdminId(courseId, admin.getId());
        return assignment.isPresent();
    }
    
    /**
     * Check if user can manage a course
     * SUPER_ADMIN can manage any course
     * COURSE_ADMIN can only manage assigned courses
     */
    public boolean canManageCourse(User user, Long courseId) {
        if (isSuperAdmin(user)) {
            return true;
        }
        if (isCourseAdmin(user)) {
            return isAssignedToCourse(user, courseId);
        }
        return false;
    }
}
