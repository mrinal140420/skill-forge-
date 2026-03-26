package com.skillforge.controllers;

import com.skillforge.dtos.ChatMessageDTO;
import com.skillforge.security.JwtAuthenticationToken;
import com.skillforge.services.SkillBotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skillbot")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SkillBotController {
    
    private static final Logger log = LoggerFactory.getLogger(SkillBotController.class);
    private final SkillBotService skillBotService;
    
    public SkillBotController(SkillBotService skillBotService) {
        this.skillBotService = skillBotService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        if (auth.getPrincipal() instanceof Long userId) {
            return userId;
        }
        if (auth instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return jwtAuthenticationToken.getUserId();
        }
        throw new RuntimeException("User not authenticated");
    }
    
    /**
     * Send a message to SkillBot and get an AI response
     */
    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestBody Map<String, Object> request) {
        
        Long userId = getCurrentUserId();
        String userMessage = (String) request.get("message");
        Long courseId = request.get("courseId") != null ? Long.valueOf(request.get("courseId").toString()) : null;
        String systemPrompt = request.get("systemPrompt") != null ? request.get("systemPrompt").toString() : null;
        
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (courseId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        log.info("User {} sent message to SkillBot: {}", userId, userMessage);
        
        ChatMessageDTO response = skillBotService.chat(userId, userMessage, courseId, systemPrompt);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get chat history for a user
     */
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @RequestParam(required = false) Long courseId) {
        
        Long userId = getCurrentUserId();
        log.info("Fetching chat history for user {}", userId);
        List<ChatMessageDTO> history = skillBotService.getChatHistory(userId, courseId);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Record feedback on a SkillBot response
     */
    @PostMapping("/feedback/{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> recordFeedback(
            @PathVariable Long messageId,
            @RequestBody Map<String, Object> request) {
        
        Boolean isHelpful = (Boolean) request.get("isHelpful");
        String feedback = (String) request.get("feedback");
        
        skillBotService.recordFeedback(messageId, isHelpful, feedback);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "Feedback recorded successfully");
        
        log.info("Feedback recorded for message {}", messageId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get SkillBot info and capabilities
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getSkillBotInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "SkillBot");
        info.put("description", "Your AI Learning Assistant - Powered by SkillForge");
        info.put("capabilities", new String[]{
            "Concept Explanations",
            "Example Problems",
            "Study Tips",
            "Related Topics",
            "Learning Path Suggestions"
        });
        info.put("available24x7", true);
        info.put("languages", new String[]{"English"});
        info.put("responseTime", "Instant");
        
        return ResponseEntity.ok(info);
    }
    
    /**
     * Start a new chat session
     */
    @PostMapping("/start-session")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> startSession() {
        
        Long userId = getCurrentUserId();
        Map<String, String> response = new HashMap<>();
        response.put("status", "Session started");
        response.put("message", "Welcome to SkillBot! I'm your AI Learning Assistant. " +
            "Feel free to ask me any questions about your courses. " +
            "You can ask for explanations, examples, or tips to understand concepts better!");
        response.put("botName", "SkillBot");
        
        log.info("Started SkillBot session for user {}", userId);
        return ResponseEntity.ok(response);
    }
}
