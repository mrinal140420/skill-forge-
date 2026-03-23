package com.skillforge.service;

import com.google.gson.Gson;
import com.skillforge.entity.Course;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Progress;
import com.skillforge.entity.QuizAttempt;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ProgressRepository;
import com.skillforge.repository.QuizAttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Recommendation Service - Calls FastAPI ML service for personalized recommendations
 * 
 * Server-to-server integration:
 * - Spring Boot collects user learning data (enrolled courses, progress, quiz scores)
 * - Sends POST request to FastAPI /recommend endpoint
 * - FastAPI processes and returns: recommendedCourses, recommendedTopics
 * - Returns to frontend unchanged
 * 
 * Environment Variable:
 * - ML_SERVICE_URL: URL of FastAPI service (default: http://localhost:8000)
 * - ML_REQUEST_SECRET: Optional secret header for ML service health checks
 */
@Service
public class RecommendationService {
    
    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    @Value("${ml.base-url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${ml.request-secret:}")
    private String mlRequestSecret;

    @Value("${ml.request-timeout:12000}")
    private long mlRequestTimeout;

    private static final Gson gson = new Gson();

    /**
     * Get personalized course recommendations for user
     * 
     * Process:
     * 1. Collect user data: enrolled courses, completed modules, quiz scores
     * 2. Call FastAPI ML service POST /recommend
    * 3. Return ML service response
    * 4. On ML failure: Return empty recommendation list (no fallback logic)
     * 
     * @param userId User ID (from JWT)
     * @return RecommendationResponse with recommended courses and topics
     */
    public RecommendationResponse getRecommendations(Long userId) {
        try {
            // Collect user learning data
            List<Enrollment> enrollments = enrollmentRepository
                    .findAllByUserIdOrderByEnrolledAtDesc(userId);
            List<String> enrolledCourseIds = enrollments.stream()
                    .map(e -> e.getCourse().getId().toString())
                    .collect(Collectors.toList());
                List<String> enrolledTopics = enrollments.stream()
                    .map(e -> e.getCourse().getCategory() != null ? e.getCourse().getCategory().name() : "General")
                    .distinct()
                    .collect(Collectors.toList());

            // Get completed modules
            List<Progress> progressList = progressRepository.findAllByUserId(userId);
            List<String> completedModules = progressList.stream()
                    .filter(Progress::getCompleted)
                    .map(Progress::getModuleId)
                    .collect(Collectors.toList());

            // Get quiz attempts
            List<QuizAttempt> quizAttempts = quizAttemptRepository.findAllByUserId(userId);
            List<QuizAttemptData> quizData = quizAttempts.stream()
                    .map(qa -> new QuizAttemptData(
                            qa.getCourse().getId().toString(),
                            qa.getScore(),
                            qa.getPassed()
                    ))
                    .collect(Collectors.toList());

                // Provide the full course catalog to ML service for non-hardcoded recommendations
                List<AvailableCourseData> availableCourses = courseRepository.findAll().stream()
                    .map(course -> new AvailableCourseData(
                        course.getId().toString(),
                        course.getTitle(),
                        course.getCategory() != null ? course.getCategory().name() : "General",
                        course.getLevel() != null ? course.getLevel().name() : "Beginner",
                        course.getRating() != null ? course.getRating() : 0.0
                    ))
                    .collect(Collectors.toList());

            // Build ML request
            MLRecommendRequest mlRequest = MLRecommendRequest.builder()
                    .userId(userId.toString())
                    .enrolledCourses(enrolledCourseIds)
                    .enrolledTopics(enrolledTopics)
                    .completedModules(completedModules)
                    .quizAttempts(quizData)
                    .availableCourses(availableCourses)
                    .build();

            log.info("Calling ML service for user: {} with enrolled courses: {}",
                    userId, enrolledCourseIds.size());

            // Call ML service
            return callMLService(mlRequest);

        } catch (Exception e) {
            log.error("Error in recommendation service, returning empty ML recommendations", e);
            return RecommendationResponse.builder()
                    .recommendedCourses(List.of())
                    .recommendedTopics(List.of())
                    .build();
        }
    }

    /**
     * Call FastAPI ML service for recommendations
     */
    private RecommendationResponse callMLService(MLRecommendRequest request) {
        try {
            if (restTemplate == null) {
                restTemplate = new RestTemplate();
            }

            String url = mlServiceUrl.replaceAll("/$", "") + "/recommend";
            log.debug("Calling ML service at: {}", url);

            // Add optional secret header if configured
            var headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            if (mlRequestSecret != null && !mlRequestSecret.isEmpty()) {
                headers.set("X-ML-SECRET", mlRequestSecret);
            }

            var httpRequest = new org.springframework.http.HttpEntity<>(
                    gson.toJson(request),
                    headers
            );

            // Execute request with timeout
            var response = restTemplate.postForEntity(
                    url,
                    httpRequest,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                // Extract recommended courses
                List<Map<String, Object>> recommendedCourses = 
                        (List<Map<String, Object>>) body.get("recommendedCourses");
                List<String> recommendedTopics = 
                        (List<String>) body.get("recommendedTopics");

                log.info("ML service returned {} recommended courses", 
                        recommendedCourses != null ? recommendedCourses.size() : 0);

                return RecommendationResponse.builder()
                        .recommendedCourses(recommendedCourses != null ? recommendedCourses : List.of())
                        .recommendedTopics(recommendedTopics != null ? recommendedTopics : List.of())
                        .build();
            }
            throw new IllegalStateException("ML service responded without recommendation payload");
        } catch (RestClientException e) {
            throw new IllegalStateException("ML service call failed", e);
        } catch (Exception e) {
            throw new IllegalStateException("Error processing ML service response", e);
        }
    }

    // Helper DTOs

    public static class MLRecommendRequest {
        String userId;
        List<String> enrolledCourses;
        List<String> enrolledTopics;
        List<String> completedModules;
        List<QuizAttemptData> quizAttempts;
        List<AvailableCourseData> availableCourses;
        
        public MLRecommendRequest() {}
        
        public MLRecommendRequest(String userId, List<String> enrolledCourses, List<String> enrolledTopics, List<String> completedModules, List<QuizAttemptData> quizAttempts, List<AvailableCourseData> availableCourses) {
            this.userId = userId;
            this.enrolledCourses = enrolledCourses;
            this.enrolledTopics = enrolledTopics;
            this.completedModules = completedModules;
            this.quizAttempts = quizAttempts;
            this.availableCourses = availableCourses;
        }
        
        public static MLRecommendRequestBuilder builder() {
            return new MLRecommendRequestBuilder();
        }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public List<String> getEnrolledCourses() { return enrolledCourses; }
        public void setEnrolledCourses(List<String> enrolledCourses) { this.enrolledCourses = enrolledCourses; }

        public List<String> getEnrolledTopics() { return enrolledTopics; }
        public void setEnrolledTopics(List<String> enrolledTopics) { this.enrolledTopics = enrolledTopics; }
        
        public List<String> getCompletedModules() { return completedModules; }
        public void setCompletedModules(List<String> completedModules) { this.completedModules = completedModules; }
        
        public List<QuizAttemptData> getQuizAttempts() { return quizAttempts; }
        public void setQuizAttempts(List<QuizAttemptData> quizAttempts) { this.quizAttempts = quizAttempts; }

        public List<AvailableCourseData> getAvailableCourses() { return availableCourses; }
        public void setAvailableCourses(List<AvailableCourseData> availableCourses) { this.availableCourses = availableCourses; }
        
        public static class MLRecommendRequestBuilder {
            private String userId;
            private List<String> enrolledCourses;
            private List<String> enrolledTopics;
            private List<String> completedModules;
            private List<QuizAttemptData> quizAttempts;
            private List<AvailableCourseData> availableCourses;
            
            public MLRecommendRequestBuilder userId(String userId) {
                this.userId = userId;
                return this;
            }
            
            public MLRecommendRequestBuilder enrolledCourses(List<String> enrolledCourses) {
                this.enrolledCourses = enrolledCourses;
                return this;
            }

            public MLRecommendRequestBuilder enrolledTopics(List<String> enrolledTopics) {
                this.enrolledTopics = enrolledTopics;
                return this;
            }
            
            public MLRecommendRequestBuilder completedModules(List<String> completedModules) {
                this.completedModules = completedModules;
                return this;
            }
            
            public MLRecommendRequestBuilder quizAttempts(List<QuizAttemptData> quizAttempts) {
                this.quizAttempts = quizAttempts;
                return this;
            }

            public MLRecommendRequestBuilder availableCourses(List<AvailableCourseData> availableCourses) {
                this.availableCourses = availableCourses;
                return this;
            }
            
            public MLRecommendRequest build() {
                return new MLRecommendRequest(this.userId, this.enrolledCourses, this.enrolledTopics, this.completedModules, this.quizAttempts, this.availableCourses);
            }
        }
    }

    public static class AvailableCourseData {
        String courseId;
        String title;
        String category;
        String level;
        Double rating;

        public AvailableCourseData() {}

        public AvailableCourseData(String courseId, String title, String category, String level, Double rating) {
            this.courseId = courseId;
            this.title = title;
            this.category = category;
            this.level = level;
            this.rating = rating;
        }

        public String getCourseId() { return courseId; }
        public void setCourseId(String courseId) { this.courseId = courseId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
    }

    public static class QuizAttemptData {
        String courseId;
        Integer score;
        Boolean passed;
        
        public QuizAttemptData() {}
        
        public QuizAttemptData(String courseId, Integer score, Boolean passed) {
            this.courseId = courseId;
            this.score = score;
            this.passed = passed;
        }
        
        public String getCourseId() { return courseId; }
        public void setCourseId(String courseId) { this.courseId = courseId; }
        
        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }
        
        public Boolean getPassed() { return passed; }
        public void setPassed(Boolean passed) { this.passed = passed; }
    }

    public static class RecommendationResponse {
        List<Map<String, Object>> recommendedCourses;
        List<String> recommendedTopics;
        
        public RecommendationResponse() {}
        
        public RecommendationResponse(List<Map<String, Object>> recommendedCourses, List<String> recommendedTopics) {
            this.recommendedCourses = recommendedCourses;
            this.recommendedTopics = recommendedTopics;
        }
        
        public static RecommendationResponseBuilder builder() {
            return new RecommendationResponseBuilder();
        }
        
        public List<Map<String, Object>> getRecommendedCourses() { return recommendedCourses; }
        public void setRecommendedCourses(List<Map<String, Object>> recommendedCourses) { this.recommendedCourses = recommendedCourses; }
        
        public List<String> getRecommendedTopics() { return recommendedTopics; }
        public void setRecommendedTopics(List<String> recommendedTopics) { this.recommendedTopics = recommendedTopics; }
        
        public static class RecommendationResponseBuilder {
            private List<Map<String, Object>> recommendedCourses;
            private List<String> recommendedTopics;
            
            public RecommendationResponseBuilder recommendedCourses(List<Map<String, Object>> recommendedCourses) {
                this.recommendedCourses = recommendedCourses;
                return this;
            }
            
            public RecommendationResponseBuilder recommendedTopics(List<String> recommendedTopics) {
                this.recommendedTopics = recommendedTopics;
                return this;
            }
            
            public RecommendationResponse build() {
                return new RecommendationResponse(this.recommendedCourses, this.recommendedTopics);
            }
        }
    }
}
