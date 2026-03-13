package com.skillforge.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import com.skillforge.entity.Course;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Progress;
import com.skillforge.entity.QuizAttempt;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ProgressRepository;
import com.skillforge.repository.QuizAttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);
    private static final Gson gson = new Gson();

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired(required = false)
    private RestTemplate restTemplate;

    @Value("${ml.base-url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${ml.request-secret:}")
    private String mlRequestSecret;

    public Map<String, Object> getAnalytics(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findAllByUserIdOrderByEnrolledAtDesc(userId);
        List<Progress> progressList = progressRepository.findAllByUserId(userId);
        List<QuizAttempt> quizAttempts = quizAttemptRepository.findAllByUserId(userId);

        MLAnalyticsRequest request = buildRequest(userId, enrollments, progressList, quizAttempts);
        Map<String, Object> mlResponse = callMlAnalytics(request);
        if (mlResponse != null) {
            return mlResponse;
        }

        return buildFallbackAnalytics(enrollments, progressList, quizAttempts);
    }

    private MLAnalyticsRequest buildRequest(Long userId,
                                            List<Enrollment> enrollments,
                                            List<Progress> progressList,
                                            List<QuizAttempt> quizAttempts) {
        Map<Long, List<Progress>> progressByCourse = progressList.stream()
                .collect(Collectors.groupingBy(p -> p.getCourse().getId()));

        List<MLAnalyticsRequest.EnrolledCourse> enrolledCourses = new ArrayList<>();
        double totalHours = 0;

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            List<Progress> courseProgress = progressByCourse.getOrDefault(course.getId(), List.of());
            long completedModules = courseProgress.stream().filter(Progress::getCompleted).count();
            int moduleCount = Math.max(extractModuleCount(course.getSyllabusModules()), courseProgress.size());
            double progressPercent = moduleCount > 0 ? (completedModules * 100.0) / moduleCount : 0;
            int durationHours = course.getDurationHours() == null ? 0 : course.getDurationHours();
            totalHours += (durationHours * progressPercent) / 100.0;

            enrolledCourses.add(new MLAnalyticsRequest.EnrolledCourse(
                    String.valueOf(course.getId()),
                    course.getTitle(),
                    course.getCategory() != null ? course.getCategory().name() : "General",
                    course.getLevel() != null ? course.getLevel().name() : "Beginner",
                    durationHours,
                    (int) Math.round(progressPercent),
                    moduleCount,
                    (int) completedModules
            ));
        }

        List<MLAnalyticsRequest.QuizAttemptData> attempts = quizAttempts.stream()
                .map(attempt -> new MLAnalyticsRequest.QuizAttemptData(
                        String.valueOf(attempt.getCourse().getId()),
                        attempt.getScore() == null ? 0 : attempt.getScore(),
                        Boolean.TRUE.equals(attempt.getPassed()),
                        attempt.getCreatedAt() != null ? attempt.getCreatedAt().toLocalDate().toString() : LocalDate.now().toString()
                ))
                .toList();

        return new MLAnalyticsRequest(
                String.valueOf(userId),
                enrolledCourses,
                attempts,
                Math.round(totalHours * 100.0) / 100.0
        );
    }

    private Map<String, Object> callMlAnalytics(MLAnalyticsRequest request) {
        try {
            if (restTemplate == null) {
                restTemplate = new RestTemplate();
            }

            String url = mlServiceUrl.replaceAll("/$", "") + "/analytics";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (mlRequestSecret != null && !mlRequestSecret.isBlank()) {
                headers.set("X-ML-SECRET", mlRequestSecret);
            }

            HttpEntity<String> entity = new HttpEntity<>(gson.toJson(request), headers);
            var response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception exception) {
            log.warn("ML analytics call failed: {}", exception.getMessage());
        }
        return null;
    }

    private Map<String, Object> buildFallbackAnalytics(List<Enrollment> enrollments,
                                                       List<Progress> progressList,
                                                       List<QuizAttempt> quizAttempts) {
        Map<Long, List<Progress>> progressByCourse = progressList.stream()
                .collect(Collectors.groupingBy(p -> p.getCourse().getId()));

        int totalEnrollments = enrollments.size();
        int totalModules = 0;
        int completedModules = 0;
        int totalHours = 0;

        Map<String, List<Double>> topicScores = new HashMap<>();

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            List<Progress> courseProgress = progressByCourse.getOrDefault(course.getId(), List.of());
            int moduleCount = Math.max(extractModuleCount(course.getSyllabusModules()), courseProgress.size());
            int completed = (int) courseProgress.stream().filter(Progress::getCompleted).count();
            int progress = moduleCount > 0 ? (int) Math.round((completed * 100.0) / moduleCount) : 0;

            totalModules += moduleCount;
            completedModules += completed;
            totalHours += (int) Math.round((course.getDurationHours() == null ? 0 : course.getDurationHours()) * (progress / 100.0));

            String topic = course.getCategory() != null ? course.getCategory().name() : "General";
            topicScores.computeIfAbsent(topic, key -> new ArrayList<>()).add((double) progress);
        }

        int avgCompletion = totalModules > 0 ? (int) Math.round((completedModules * 100.0) / totalModules) : 0;

        List<Map<String, Object>> topicPerformance = topicScores.entrySet().stream()
                .map(entry -> {
                    int score = (int) Math.round(entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0));
                    Map<String, Object> map = new HashMap<>();
                    map.put("topic", entry.getKey());
                    map.put("score", score);
                    return map;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("score"), (Integer) a.get("score")))
                .toList();

        List<Map<String, Object>> attemptTrend = buildAttemptTrend(quizAttempts);
        List<Map<String, Object>> accuracyVsDifficulty = buildDifficultyScatter(enrollments, progressByCourse, quizAttempts);
        List<Map<String, Object>> badges = buildBadges(totalEnrollments, completedModules, avgCompletion, totalHours, topicScores.size());
        List<Map<String, Object>> improvementPlan = buildImprovementPlan(topicPerformance);

        Map<String, Object> overview = new HashMap<>();
        overview.put("avgCompletion", avgCompletion);
        overview.put("modulesCompleted", completedModules);
        overview.put("totalHours", totalHours);
        overview.put("enrolledCourses", totalEnrollments);

        Map<String, Object> response = new HashMap<>();
        response.put("overview", overview);
        response.put("topicPerformance", topicPerformance);
        response.put("radarSkills", topicPerformance.stream().map(item -> {
            Map<String, Object> skill = new HashMap<>();
            skill.put("name", item.get("topic"));
            skill.put("score", item.get("score"));
            return skill;
        }).toList());
        response.put("attemptTrend", attemptTrend);
        response.put("accuracyVsDifficulty", accuracyVsDifficulty);
        response.put("badges", badges);
        response.put("improvementPlan", improvementPlan);
        response.put("insights", List.of(
                "Analytics generated from your enrolled courses and progress.",
                "Complete pending modules in weak topics to improve your overall score."
        ));
        return response;
    }

    private List<Map<String, Object>> buildAttemptTrend(List<QuizAttempt> quizAttempts) {
        if (quizAttempts.isEmpty()) {
            return List.of();
        }

        return quizAttempts.stream()
                .sorted(Comparator.comparing(QuizAttempt::getCreatedAt))
                .skip(Math.max(0, quizAttempts.size() - 10))
                .map(attempt -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("label", attempt.getCreatedAt() != null ? attempt.getCreatedAt().toLocalDate().toString() : "N/A");
                    point.put("score", attempt.getScore() == null ? 0 : attempt.getScore());
                    return point;
                })
                .toList();
    }

    private List<Map<String, Object>> buildDifficultyScatter(List<Enrollment> enrollments,
                                                             Map<Long, List<Progress>> progressByCourse,
                                                             List<QuizAttempt> quizAttempts) {
        Map<Long, List<QuizAttempt>> attemptsByCourse = quizAttempts.stream()
                .collect(Collectors.groupingBy(attempt -> attempt.getCourse().getId()));

        List<Map<String, Object>> points = new ArrayList<>();
        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            List<Progress> progressList = progressByCourse.getOrDefault(course.getId(), List.of());
            int moduleCount = Math.max(extractModuleCount(course.getSyllabusModules()), progressList.size());
            int completed = (int) progressList.stream().filter(Progress::getCompleted).count();
            int progressScore = moduleCount > 0 ? (int) Math.round((completed * 100.0) / moduleCount) : 0;

            List<QuizAttempt> courseAttempts = attemptsByCourse.getOrDefault(course.getId(), List.of());
            int avgQuiz = courseAttempts.isEmpty()
                    ? progressScore
                    : (int) Math.round(courseAttempts.stream().mapToInt(a -> a.getScore() == null ? 0 : a.getScore()).average().orElse(progressScore));

            Map<String, Object> point = new HashMap<>();
            point.put("difficulty", course.getLevel() != null ? course.getLevel().name() : "Beginner");
            point.put("accuracy", avgQuiz);
            point.put("attempts", Math.max(1, courseAttempts.size()));
            point.put("course", course.getTitle());
            points.add(point);
        }
        return points;
    }

    private List<Map<String, Object>> buildBadges(int totalEnrollments,
                                                   int completedModules,
                                                   int avgCompletion,
                                                   int totalHours,
                                                   int categoryCount) {
        return List.of(
                badge("🎯", "First Enrollment", "Enrolled in your first course", totalEnrollments >= 1),
                badge("📚", "Dedicated Learner", "Enrolled in 5+ courses", totalEnrollments >= 5),
                badge("⚡", "Module Master", "Completed 10+ modules", completedModules >= 10),
                badge("🔥", "Study Streak", "Studied 20+ hours", totalHours >= 20),
                badge("🌟", "All-Rounder", "Learning across 3+ categories", categoryCount >= 3),
                badge("💎", "Half Way There", "50% average completion", avgCompletion >= 50)
        );
    }

    private Map<String, Object> badge(String icon, String label, String description, boolean earned) {
        Map<String, Object> map = new HashMap<>();
        map.put("icon", icon);
        map.put("label", label);
        map.put("description", description);
        map.put("earned", earned);
        return map;
    }

    private List<Map<String, Object>> buildImprovementPlan(List<Map<String, Object>> topicPerformance) {
        List<Map<String, Object>> sorted = topicPerformance.stream()
                .sorted(Comparator.comparingInt(item -> (Integer) item.get("score")))
                .toList();

        if (sorted.isEmpty()) {
            return List.of();
        }

        String weakest = String.valueOf(sorted.get(0).get("topic"));
        String secondWeakest = sorted.size() > 1 ? String.valueOf(sorted.get(1).get("topic")) : weakest;

        return List.of(
                plan("Day 1", "Review fundamentals of " + weakest, "pending"),
                plan("Day 2", "Complete 2 pending modules from " + weakest, "pending"),
                plan("Day 3", "Practice quiz attempts in " + secondWeakest, "pending"),
                plan("Day 4", "Revise your strongest completed module", "pending"),
                plan("Day 5", "Attempt one mixed-topic quiz", "pending"),
                plan("Day 6", "Re-check weak-topic notes and examples", "pending"),
                plan("Day 7", "Review progress and set next weekly target", "pending")
        );
    }

    private Map<String, Object> plan(String day, String task, String status) {
        Map<String, Object> item = new HashMap<>();
        item.put("day", day);
        item.put("task", task);
        item.put("status", status);
        return item;
    }

    private int extractModuleCount(String syllabusModulesJson) {
        if (syllabusModulesJson == null || syllabusModulesJson.isBlank()) {
            return 0;
        }
        try {
            JsonArray array = JsonParser.parseString(syllabusModulesJson).getAsJsonArray();
            return array.size();
        } catch (Exception ignored) {
            return 0;
        }
    }

    public static class MLAnalyticsRequest {
        private String userId;
        private List<EnrolledCourse> enrolledCourses;
        private List<QuizAttemptData> quizAttempts;
        private double totalHours;

        public MLAnalyticsRequest(String userId, List<EnrolledCourse> enrolledCourses, List<QuizAttemptData> quizAttempts, double totalHours) {
            this.userId = userId;
            this.enrolledCourses = enrolledCourses;
            this.quizAttempts = quizAttempts;
            this.totalHours = totalHours;
        }

        public String getUserId() {
            return userId;
        }

        public List<EnrolledCourse> getEnrolledCourses() {
            return enrolledCourses;
        }

        public List<QuizAttemptData> getQuizAttempts() {
            return quizAttempts;
        }

        public double getTotalHours() {
            return totalHours;
        }

        public static class EnrolledCourse {
            private String courseId;
            private String title;
            private String category;
            private String level;
            private int durationHours;
            private int progress;
            private int moduleCount;
            private int completedModules;

            public EnrolledCourse(String courseId,
                                  String title,
                                  String category,
                                  String level,
                                  int durationHours,
                                  int progress,
                                  int moduleCount,
                                  int completedModules) {
                this.courseId = courseId;
                this.title = title;
                this.category = category;
                this.level = level;
                this.durationHours = durationHours;
                this.progress = progress;
                this.moduleCount = moduleCount;
                this.completedModules = completedModules;
            }

            public String getCourseId() {
                return courseId;
            }

            public String getTitle() {
                return title;
            }

            public String getCategory() {
                return category;
            }

            public String getLevel() {
                return level;
            }

            public int getDurationHours() {
                return durationHours;
            }

            public int getProgress() {
                return progress;
            }

            public int getModuleCount() {
                return moduleCount;
            }

            public int getCompletedModules() {
                return completedModules;
            }
        }

        public static class QuizAttemptData {
            private String courseId;
            private int score;
            private boolean passed;
            private String createdAt;

            public QuizAttemptData(String courseId, int score, boolean passed, String createdAt) {
                this.courseId = courseId;
                this.score = score;
                this.passed = passed;
                this.createdAt = createdAt;
            }

            public String getCourseId() {
                return courseId;
            }

            public int getScore() {
                return score;
            }

            public boolean isPassed() {
                return passed;
            }

            public String getCreatedAt() {
                return createdAt;
            }
        }
    }
}