package com.skillforge.controller;

import com.skillforge.dto.GeneratedExamDTO;
import com.skillforge.entity.User;
import com.skillforge.security.AuthorizationUtil;
import com.skillforge.service.CourseExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/exams")
public class CourseExamController {

    @Autowired
    private CourseExamService courseExamService;

    @Autowired
    private AuthorizationUtil authorizationUtil;

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getExam(@PathVariable Long courseId) {
        try {
            GeneratedExamDTO exam = courseExamService.getOrGenerateExam(courseId);
            return ResponseEntity.ok(exam);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to load exam"));
        }
    }

    @PostMapping("/generate/{courseId}")
    public ResponseEntity<?> generateExam(@PathVariable Long courseId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.canManageCourse(user, courseId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden - cannot manage this course"));
            }

            GeneratedExamDTO exam = courseExamService.generateAndSaveExam(courseId);
            return ResponseEntity.status(HttpStatus.CREATED).body(exam);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to generate exam"));
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        if (auth.getDetails() instanceof User user) {
            return user;
        }
        return null;
    }
}