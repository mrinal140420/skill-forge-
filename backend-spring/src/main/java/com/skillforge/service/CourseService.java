package com.skillforge.service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.skillforge.dto.CourseDTO;
import com.skillforge.entity.Course;
import com.skillforge.entity.CourseAdminAssignment;
import com.skillforge.repository.CourseAdminAssignmentRepository;
import com.skillforge.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Course Service - Handles course operations: retrieval, filtering, sorting
 * 
 * Implements dynamic filtering by:
 * - Search term (title, description, tags)
 * - Category
 * - Level
 * - Sorting (newest, rating, popularity)
 * - Featured courses (limit to 6)
 * 
 * Matches Express backend filtering logic exactly.
 */
@Service
public class CourseService {
    
    private static final Logger log = LoggerFactory.getLogger(CourseService.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseAdminAssignmentRepository courseAdminAssignmentRepository;

    private static final Gson gson = new Gson();

    /**
     * Get all courses with advanced filtering and sorting
     * 
     * @param search Optional search term (searches title, description, tags)
     * @param category Optional category filter
     * @param level Optional level filter (Beginner, Intermediate, Advanced)
     * @param sort Optional sort order (newest, rating, popularity)
     * @param featured If true, limits results to 6 featured courses
     * @return List of filtered and sorted courses
     */
    public List<CourseDTO> getAllCourses(String search, String category, String level, 
                                        String sort, Boolean featured) {
        
        // Build specification for filtering
        Specification<Course> spec = Specification.where(null);

        // Search filter (searches title, description, tags)
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), "%" + searchLower + "%"),
                cb.like(cb.lower(root.get("description")), "%" + searchLower + "%"),
                cb.like(root.get("tags"), "%" + searchLower + "%")
            ));
        }

        // Category filter
        if (category != null && !category.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category));
        }

        // Level filter
        if (level != null && !level.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("level"), level));
        }

        // Determine sort order
        Sort sortOrder = getSortOrder(sort);

        // Execute query
        List<Course> courses = courseRepository.findAll(spec, sortOrder);

        // Apply featured limit if requested
        if (featured != null && featured) {
            courses = courses.stream().limit(6).collect(Collectors.toList());
        }

        // Convert to DTOs
        return courses.stream()
                .map(this::convertCourseToDTOWithParsedData)
                .collect(Collectors.toList());
    }

    /**
     * Get a single course by ID
     * 
     * @param id Course ID
     * @return CourseDTO with populated course data
     * @throws IllegalArgumentException if course not found
     */
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        return convertCourseToDTOWithParsedData(course);
    }

    /**
     * Create a new course (admin only)
     * 
     * @param courseDTO Course data
     * @return Created CourseDTO
     */
    public CourseDTO createCourse(CourseDTO courseDTO) {
        // Check for duplicate title
        if (courseRepository.existsByTitle(courseDTO.getTitle())) {
            throw new IllegalArgumentException("Course with this title already exists");
        }

        // Convert JSON fields
        String tagsJson = gson.toJson(courseDTO.getTags());
        String modulesJson = gson.toJson(courseDTO.getSyllabusModules());
        String prerequisitesJson = gson.toJson(courseDTO.getPrerequisites());

        Course course = Course.builder()
                .title(courseDTO.getTitle())
                .slug(generateSlug(courseDTO.getTitle()))
                .category(Course.CourseCategory.valueOf(courseDTO.getCategory()))
                .level(Course.CourseLevel.valueOf(courseDTO.getLevel()))
            .status(courseDTO.getStatus() != null
                ? Course.CourseStatus.valueOf(courseDTO.getStatus())
                : Course.CourseStatus.DRAFT)
                .durationHours(courseDTO.getDurationHours())
                .rating(courseDTO.getRating() != null ? courseDTO.getRating() : 0.0)
                .thumbnailUrl(courseDTO.getThumbnailUrl())
                .description(courseDTO.getDescription())
                .tags(tagsJson)
                .syllabusModules(modulesJson)
                .prerequisites(prerequisitesJson)
                .build();

        course = courseRepository.save(course);
        log.info("Course created: {}", course.getTitle());

        return convertCourseToDTOWithParsedData(course);
    }

    public CourseDTO updateCourse(Long courseId, CourseDTO courseDTO) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (courseDTO.getTitle() != null && !courseDTO.getTitle().isBlank()) {
            course.setTitle(courseDTO.getTitle());
            course.setSlug(generateSlug(courseDTO.getTitle()));
        }
        if (courseDTO.getCategory() != null && !courseDTO.getCategory().isBlank()) {
            course.setCategory(Course.CourseCategory.valueOf(courseDTO.getCategory()));
        }
        if (courseDTO.getLevel() != null && !courseDTO.getLevel().isBlank()) {
            course.setLevel(Course.CourseLevel.valueOf(courseDTO.getLevel()));
        }
        if (courseDTO.getStatus() != null && !courseDTO.getStatus().isBlank()) {
            course.setStatus(Course.CourseStatus.valueOf(courseDTO.getStatus()));
        }
        if (courseDTO.getDurationHours() != null) {
            course.setDurationHours(courseDTO.getDurationHours());
        }
        if (courseDTO.getRating() != null) {
            course.setRating(courseDTO.getRating());
        }
        if (courseDTO.getThumbnailUrl() != null) {
            course.setThumbnailUrl(courseDTO.getThumbnailUrl());
        }
        if (courseDTO.getDescription() != null) {
            course.setDescription(courseDTO.getDescription());
        }
        if (courseDTO.getTags() != null) {
            course.setTags(gson.toJson(courseDTO.getTags()));
        }
        if (courseDTO.getSyllabusModules() != null) {
            course.setSyllabusModules(gson.toJson(courseDTO.getSyllabusModules()));
        }
        if (courseDTO.getPrerequisites() != null) {
            course.setPrerequisites(gson.toJson(courseDTO.getPrerequisites()));
        }

        course = courseRepository.save(course);
        log.info("Course updated: {}", course.getTitle());
        return convertCourseToDTOWithParsedData(course);
    }

    /**
     * Determine sort order from sort parameter
     * - newest: by createdAt descending
     * - rating: by rating descending
     * - popularity: by rating descending then durationHours ascending
     */
    private Sort getSortOrder(String sort) {
        if ("rating".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "rating");
        } else if ("popularity".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "rating")
                    .and(Sort.by(Sort.Direction.ASC, "durationHours"));
        } else {
            // Default: newest
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
    }

    /**
     * Convert Course entity to CourseDTO with JSON parsing
     * Parses tags, modules, and prerequisites from JSON format
     * Public method to allow other services to use this conversion
     */
    public CourseDTO convertCourseToDTOWithParsedData(Course course) {
        // Parse JSON fields
        Type stringListType = new TypeToken<List<String>>(){}.getType();
        Type moduleListType = new TypeToken<List<CourseDTO.ModuleDTO>>(){}.getType();
        Type longListType = new TypeToken<List<Long>>(){}.getType();

        List<String> tags = course.getTags() != null ? 
                gson.fromJson(course.getTags(), stringListType) : List.of();
        List<CourseDTO.ModuleDTO> modules = course.getSyllabusModules() != null ?
                gson.fromJson(course.getSyllabusModules(), moduleListType) : List.of();
        List<Long> prerequisites = course.getPrerequisites() != null ?
                gson.fromJson(course.getPrerequisites(), longListType) : List.of();
        List<CourseAdminAssignment> assignments = courseAdminAssignmentRepository.findByCourseId(course.getId());
        CourseAdminAssignment primaryAssignment = assignments.isEmpty() ? null : assignments.get(0);

        return CourseDTO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .category(course.getCategory().name())
                .level(course.getLevel().name())
                .status(course.getStatus() != null ? course.getStatus().name() : Course.CourseStatus.DRAFT.name())
                .durationHours(course.getDurationHours())
                .rating(course.getRating())
                .thumbnailUrl(course.getThumbnailUrl())
                .description(course.getDescription())
                .instructor(primaryAssignment != null ? primaryAssignment.getAdmin().getName() : "SkillForge Faculty")
                .assignedInstructorId(primaryAssignment != null ? primaryAssignment.getAdmin().getId() : null)
                .instructorAvatar(primaryAssignment != null ? primaryAssignment.getAdmin().getAvatar() : null)
                .instructorBio(primaryAssignment != null ? primaryAssignment.getAdmin().getBio() : null)
                .instructorLinkedin(primaryAssignment != null ? primaryAssignment.getAdmin().getLinkedin() : null)
                .instructorGithub(primaryAssignment != null ? primaryAssignment.getAdmin().getGithub() : null)
                .tags(tags)
                .syllabusModules(modules)
                .prerequisites(prerequisites)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    /**
     * Generate URL-friendly slug from title
     * Matches Express implementation: lowercase, replace spaces/special chars with hyphen
     */
    private String generateSlug(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
