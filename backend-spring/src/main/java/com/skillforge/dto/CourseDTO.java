package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

/**
 * CourseDTO - Data Transfer Object for Course entity
 * Matches exact response format from Express backend.
 * 
 * Handles JSON serialization of nested modules and tags from JSON columns.
 * Frontend expects same field names and structures.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDTO {
    
    @JsonProperty("_id")
    private Long id;
    
    private String title;
    private String slug;
    private String category;
    private String level;
    private Integer durationHours;
    private Double rating;
    private String thumbnailUrl;
    private String description;
    
    @JsonProperty("tags")
    private List<String> tags;
    
    @JsonProperty("syllabusModules")
    private List<ModuleDTO> syllabusModules;
    
    @JsonProperty("prerequisites")
    private List<Long> prerequisites;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public CourseDTO() {
    }

    public CourseDTO(Long id, String title, String slug, String category, String level,
                     Integer durationHours, Double rating, String thumbnailUrl, String description,
                     List<String> tags, List<ModuleDTO> syllabusModules, List<Long> prerequisites,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
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

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<ModuleDTO> getSyllabusModules() {
        return syllabusModules;
    }

    public void setSyllabusModules(List<ModuleDTO> syllabusModules) {
        this.syllabusModules = syllabusModules;
    }

    public List<Long> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<Long> prerequisites) {
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

    // Builder pattern
    public static CourseDTOBuilder builder() {
        return new CourseDTOBuilder();
    }

    public static class CourseDTOBuilder {
        private Long id;
        private String title;
        private String slug;
        private String category;
        private String level;
        private Integer durationHours;
        private Double rating;
        private String thumbnailUrl;
        private String description;
        private List<String> tags;
        private List<ModuleDTO> syllabusModules;
        private List<Long> prerequisites;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public CourseDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CourseDTOBuilder title(String title) {
            this.title = title;
            return this;
        }

        public CourseDTOBuilder slug(String slug) {
            this.slug = slug;
            return this;
        }

        public CourseDTOBuilder category(String category) {
            this.category = category;
            return this;
        }

        public CourseDTOBuilder level(String level) {
            this.level = level;
            return this;
        }

        public CourseDTOBuilder durationHours(Integer durationHours) {
            this.durationHours = durationHours;
            return this;
        }

        public CourseDTOBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public CourseDTOBuilder thumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
            return this;
        }

        public CourseDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CourseDTOBuilder tags(List<String> tags) {
            this.tags = tags;
            return this;
        }

        public CourseDTOBuilder syllabusModules(List<ModuleDTO> syllabusModules) {
            this.syllabusModules = syllabusModules;
            return this;
        }

        public CourseDTOBuilder prerequisites(List<Long> prerequisites) {
            this.prerequisites = prerequisites;
            return this;
        }

        public CourseDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public CourseDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public CourseDTO build() {
            return new CourseDTO(id, title, slug, category, level, durationHours, rating,
                    thumbnailUrl, description, tags, syllabusModules, prerequisites,
                    createdAt, updatedAt);
        }
    }

    /**
     * Nested Module DTO - represents a course module within syllabus
     */
    public static class ModuleDTO {
        @JsonProperty("_id")
        private String id;
        private String title;
        private String contentType;  // video or text
        private Integer durationMin;
        private String videoUrl;  // YouTube URL for videos

        // Constructors
        public ModuleDTO() {
        }

        public ModuleDTO(String id, String title, String contentType, Integer durationMin) {
            this.id = id;
            this.title = title;
            this.contentType = contentType;
            this.durationMin = durationMin;
        }

        public ModuleDTO(String id, String title, String contentType, Integer durationMin, String videoUrl) {
            this.id = id;
            this.title = title;
            this.contentType = contentType;
            this.durationMin = durationMin;
            this.videoUrl = videoUrl;
        }

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }

        public Integer getDurationMin() {
            return durationMin;
        }

        public void setDurationMin(Integer durationMin) {
            this.durationMin = durationMin;
        }

        public String getVideoUrl() {
            return videoUrl;
        }

        public void setVideoUrl(String videoUrl) {
            this.videoUrl = videoUrl;
        }

        // Builder pattern
        public static ModuleDTOBuilder builder() {
            return new ModuleDTOBuilder();
        }

        public static class ModuleDTOBuilder {
            private String id;
            private String title;
            private String contentType;
            private Integer durationMin;
            private String videoUrl;

            public ModuleDTOBuilder id(String id) {
                this.id = id;
                return this;
            }

            public ModuleDTOBuilder title(String title) {
                this.title = title;
                return this;
            }

            public ModuleDTOBuilder contentType(String contentType) {
                this.contentType = contentType;
                return this;
            }

            public ModuleDTOBuilder durationMin(Integer durationMin) {
                this.durationMin = durationMin;
                return this;
            }

            public ModuleDTOBuilder videoUrl(String videoUrl) {
                this.videoUrl = videoUrl;
                return this;
            }

            public ModuleDTO build() {
                return new ModuleDTO(id, title, contentType, durationMin, videoUrl);
            }
        }
    }
}
