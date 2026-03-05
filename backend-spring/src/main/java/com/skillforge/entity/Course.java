package com.skillforge.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Course Entity - Maps to PostgreSQL courses table
 * Replaces MongoDB Course schema.
 * 
 * Includes all course details: title, category, level, modules structure,
 * and metadata. Modules are stored as JSON column via @Column annotation.
 */
@Entity
@Table(name = "courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = "title"),
    @UniqueConstraint(columnNames = "slug")
})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String title;

    @Column(nullable = false, unique = true, length = 500)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseLevel level;

    @Column(nullable = false)
    private Integer durationHours;

    @Column(columnDefinition = "DECIMAL(3,1) DEFAULT 0")
    private Double rating;

    @Column(nullable = false, length = 1000)
    private String thumbnailUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * Tags stored as JSON array (e.g., ["Arrays", "Trees", "Graphs"])
     */
    @Column(columnDefinition = "TEXT")
    private String tags;

    /**
     * Syllabus modules stored as JSON array
     * Structure: [{"title": "...", "contentType": "video|text", "durationMin": 45}]
     */
    @Column(columnDefinition = "TEXT")
    private String syllabusModules;

    /**
     * Prerequisites (course IDs that must be completed before this course)
     * Stored as JSON array of IDs
     */
    @Column(columnDefinition = "TEXT")
    private String prerequisites;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Course() {
    }

    public Course(String title, String slug, CourseCategory category, CourseLevel level, 
                  Integer durationHours, Double rating, String thumbnailUrl, String description,
                  String tags, String syllabusModules, String prerequisites) {
        this.title = title;
        this.slug = slug;
        this.category = category;
        this.level = level;
        this.durationHours = durationHours;
        this.rating = rating;
        this.thumbnailUrl = thumbnailUrl;
        this.description = description;
        this.tags = tags;
        this.syllabusModules = syllabusModules;
        this.prerequisites = prerequisites;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public CourseCategory getCategory() {
        return category;
    }

    public void setCategory(CourseCategory category) {
        this.category = category;
    }

    public CourseLevel getLevel() {
        return level;
    }

    public void setLevel(CourseLevel level) {
        this.level = level;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getSyllabusModules() {
        return syllabusModules;
    }

    public void setSyllabusModules(String syllabusModules) {
        this.syllabusModules = syllabusModules;
    }

    public String getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(String prerequisites) {
        this.prerequisites = prerequisites;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Course Categories - matches original MongoDB enum values exactly
     */
    public enum CourseCategory {
        DSA,
        DBMS,
        OS,
        CN,
        OOP,
        SYSTEM_DESIGN,
        AI_ML_BASICS,
        CYBER_SECURITY,
        ML,
        ML_PLATFORM  // For meta courses about SkillForge ML
    }

    /**
     * Course Levels - matches original MongoDB enum values
     */
    public enum CourseLevel {
        Beginner,
        Intermediate,
        Advanced
    }

    // Builder pattern
    public static CourseBuilder builder() {
        return new CourseBuilder();
    }

    public static class CourseBuilder {
        private Long id;
        private String title;
        private String slug;
        private CourseCategory category;
        private CourseLevel level;
        private Integer durationHours;
        private Double rating;
        private String thumbnailUrl;
        private String description;
        private String tags;
        private String syllabusModules;
        private String prerequisites;

        public CourseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CourseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public CourseBuilder slug(String slug) {
            this.slug = slug;
            return this;
        }

        public CourseBuilder category(CourseCategory category) {
            this.category = category;
            return this;
        }

        public CourseBuilder level(CourseLevel level) {
            this.level = level;
            return this;
        }

        public CourseBuilder durationHours(Integer durationHours) {
            this.durationHours = durationHours;
            return this;
        }

        public CourseBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public CourseBuilder thumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
            return this;
        }

        public CourseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CourseBuilder tags(String tags) {
            this.tags = tags;
            return this;
        }

        public CourseBuilder syllabusModules(String syllabusModules) {
            this.syllabusModules = syllabusModules;
            return this;
        }

        public CourseBuilder prerequisites(String prerequisites) {
            this.prerequisites = prerequisites;
            return this;
        }

        public Course build() {
            Course course = new Course();
            course.id = this.id;
            course.title = this.title;
            course.slug = this.slug;
            course.category = this.category;
            course.level = this.level;
            course.durationHours = this.durationHours;
            course.rating = this.rating;
            course.thumbnailUrl = this.thumbnailUrl;
            course.description = this.description;
            course.tags = this.tags;
            course.syllabusModules = this.syllabusModules;
            course.prerequisites = this.prerequisites;
            return course;
        }
    }
}
