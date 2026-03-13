package com.skillforge.service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.skillforge.dto.CourseDTO;
import com.skillforge.dto.EnrollmentDTO;
import com.skillforge.entity.Course;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.User;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Enrollment Service - Handles user course enrollments
 * 
 * Operations:
 * - Enroll user in a course (prevent duplicates)
 * - Get user's enrollments (with course details)
 * - Get specific enrollment details
 * - Authorization checks (users can only view/access their own enrollments)
 */
@Service
public class EnrollmentService {
    
    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    private static final Gson gson = new Gson();

    /**
     * Enroll user in a course
     * 
     * Validations:
     * - Course must exist
     * - User must not already be enrolled
     * 
     * @param userId User ID (from JWT)
     * @param courseId Course ID to enroll in
     * @return EnrollmentDTO
     * @throws IllegalArgumentException if course not found or already enrolled
     */
    public EnrollmentDTO enrollInCourse(Long userId, String courseId) {
        // Parse course ID
        Long parsedCourseId;
        try {
            parsedCourseId = Long.parseLong(courseId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid course ID");
        }

        // Verify course exists
        Course course = courseRepository.findById(parsedCourseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Check if already enrolled
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, parsedCourseId)) {
            throw new IllegalArgumentException("Already enrolled in this course");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create enrollment
        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .status(Enrollment.EnrollmentStatus.active)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        log.info("User {} enrolled in course {}", userId, parsedCourseId);

        return convertEnrollmentToDTO(enrollment);
    }

    /**
     * Get all enrollments for the current user
     * Returns enrollments with populated course details
     * Ordered by enrollment date descending
     * 
     * @param userId User ID (from JWT)
     * @return List of EnrollmentDTOs
     */
    public List<EnrollmentDTO> getMyEnrollments(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository
                .findAllByUserIdOrderByEnrolledAtDesc(userId);

        return enrollments.stream()
                .map(this::convertEnrollmentToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get specific enrollment details
     * Authorization: user can only access their own enrollments
     * 
     * @param enrollmentId Enrollment ID
     * @param userId User ID (from JWT) for authorization
     * @return EnrollmentDTO
     * @throws IllegalArgumentException if not found or unauthorized
     */
    public EnrollmentDTO getEnrollmentById(Long enrollmentId, Long userId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));

        // Authorization check: user can only view their own enrollments
        if (!enrollment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized: Cannot view other user's enrollment");
        }

        return convertEnrollmentToDTO(enrollment);
    }

    /**
     * Convert Enrollment entity to EnrollmentDTO
     * Populates course details in the response
     */
    private EnrollmentDTO convertEnrollmentToDTO(Enrollment enrollment) {
        Course course = enrollment.getCourse();
        CourseDTO courseDTO = course != null ? convertCourseToDTOWithParsedData(course) : null;
        
        return EnrollmentDTO.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .courseId(courseDTO)
                .status(enrollment.getStatus().name())
                .enrolledAt(enrollment.getEnrolledAt())
                .updatedAt(enrollment.getUpdatedAt())
                .build();
    }

    /**
     * Convert Course to CourseDTO with parsed JSON data
     * Handles null course object
     */
    private CourseDTO convertCourseToDTOWithParsedData(Course course) {
        if (course == null) {
            return null;
        }
        
        Type stringListType = new TypeToken<List<String>>(){}.getType();
        Type moduleListType = new TypeToken<List<CourseDTO.ModuleDTO>>(){}.getType();
        Type longListType = new TypeToken<List<Long>>(){}.getType();

        List<String> tags = course.getTags() != null ? 
                gson.fromJson(course.getTags(), stringListType) : List.of();
        List<CourseDTO.ModuleDTO> modules = course.getSyllabusModules() != null ?
                gson.fromJson(course.getSyllabusModules(), moduleListType) : List.of();
        List<Long> prerequisites = course.getPrerequisites() != null ?
                gson.fromJson(course.getPrerequisites(), longListType) : List.of();

        return CourseDTO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .category(course.getCategory().name())
                .level(course.getLevel().name())
                .durationHours(course.getDurationHours())
                .rating(course.getRating())
                .thumbnailUrl(course.getThumbnailUrl())
                .description(course.getDescription())
                .tags(tags)
                .syllabusModules(modules)
                .prerequisites(prerequisites)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
