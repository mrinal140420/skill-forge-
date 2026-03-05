package com.skillforge.services;

import com.skillforge.dtos.ChatMessageDTO;
import com.skillforge.models.ChatMessage;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import com.skillforge.repositories.ChatMessageRepository;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * SkillBot Service - AI Tutor powered by intelligent prompts
 * Provides contextual answers to student questions based on course content
 */
@Service
public class SkillBotService {
    
    private static final Logger log = LoggerFactory.getLogger(SkillBotService.class);
    private static final String BOT_NAME = "SkillBot";
    
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    
    // Knowledge base responses indexed by keywords
    private final Map<String, String> conceptExplanations;
    
    public SkillBotService(ChatMessageRepository chatMessageRepository,
                          UserRepository userRepository,
                          CourseRepository courseRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.conceptExplanations = initializeConceptExplanations();
    }
    
    /**
     * Process user message and generate SkillBot response
     */
    public ChatMessageDTO chat(Long userId, String userMessage, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId).orElse(null);
        }
        
        // Generate context-aware response
        String botResponse = generateResponse(userMessage, course, user);
        
        // Save message to history
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUser(user);
        chatMessage.setCourse(course);
        chatMessage.setUserMessage(userMessage);
        chatMessage.setBotResponse(botResponse);
        chatMessage.setMessageType(categorizeQuestion(userMessage));
        chatMessage.setCreatedAt(LocalDateTime.now());
        
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        
        log.info("SkillBot responded to user {} with message type: {}", userId, chatMessage.getMessageType());
        
        return convertToDTO(savedMessage);
    }
    
    /**
     * Generate an intelligent response based on the question and context
     */
    private String generateResponse(String userMessage, Course course, User user) {
        String lowerMessage = userMessage.toLowerCase().trim();
        
        // Check for greetings
        if (isGreeting(lowerMessage)) {
            return generateGreeting(user);
        }
        
        // Check for specific topic explanations
        for (Map.Entry<String, String> entry : conceptExplanations.entrySet()) {
            if (lowerMessage.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        // If a course context is provided, give course-specific help
        if (course != null) {
            return generateCourseSpecificResponse(userMessage, course);
        }
        
        // Generate generic learning assistance
        return generateGenericAssistance(userMessage, user);
    }
    
    /**
     * Generate course-specific response based on course content
     */
    private String generateCourseSpecificResponse(String userMessage, Course course) {
        String response = String.format(
            "Great question about %s! 📚\n\n" +
            "Based on the course content, here's what I can help with:\n\n",
            course.getTitle()
        );
        
        // Add course-specific guidance
        switch (course.getCategory().name().toLowerCase()) {
            case "dbms":
                response += "In Database Management, we focus on:\n" +
                    "• Data modeling and normalization\n" +
                    "• SQL query optimization\n" +
                    "• Transaction management (ACID properties)\n" +
                    "• Indexing strategies\n\n" +
                    "Could you be more specific about which topic you'd like to dive deeper into?";
                break;
            case "os":
                response += "In Operating Systems, key concepts include:\n" +
                    "• Process management and scheduling\n" +
                    "• Memory management (paging, segmentation)\n" +
                    "• File systems\n" +
                    "• Concurrency and synchronization\n\n" +
                    "Which of these would you like to explore?";
                break;
            case "cn":
                response += "In Computer Networks, we cover:\n" +
                    "• OSI and TCP/IP models\n" +
                    "• Protocols and packet switching\n" +
                    "• Routing algorithms\n" +
                    "• Network security basics\n\n" +
                    "Would you like to focus on any specific layer or protocol?";
                break;
            case "dsa":
                response += "In Data Structures & Algorithms, key areas are:\n" +
                    "• Array and Linked List operations\n" +
                    "• Sorting and Searching\n" +
                    "• Graph and Tree traversals\n" +
                    "• Dynamic Programming\n\n" +
                    "Which data structure or algorithm scenario interests you?";
                break;
            default:
                response += "I'm here to help you understand the concepts in this course. " +
                    "Could you specify which topic or concept you'd like to discuss?";
        }
        
        return response;
    }
    
    /**
     * Generate a personalized greeting
     */
    private String generateGreeting(User user) {
        String greeting = "Hello " + (user.getName() != null ? user.getName() : "there") + "! 👋\n\n" +
            "I'm SkillBot, your AI learning assistant here at SkillForge. " +
            "I can help you with:\n\n" +
            "📖 **Concept Explanations** - Ask me to explain any topic\n" +
            "🤔 **Example Problems** - Request worked examples for better understanding\n" +
            "💡 **Study Tips** - Get advice on how to master specific concepts\n" +
            "🔗 **Related Topics** - Discover connections between different concepts\n\n" +
            "What would you like to learn about today?";
        
        return greeting;
    }
    
    /**
     * Generate generic learning assistance
     */
    private String generateGenericAssistance(String userMessage, User user) {
        if (userMessage.toLowerCase().contains("example") || userMessage.toLowerCase().contains("code")) {
            return "I'd love to help with examples! 💻\n\n" +
                "Could you tell me which concept or topic you'd like to see an example for? " +
                "For instance:\n" +
                "• \"Show me an example of binary search\"\n" +
                "• \"How does a circular queue work?\"\n" +
                "• \"Explain normalization with an example\"\n\n" +
                "Once you specify, I'll provide a detailed explanation with code or diagrams!";
        } else if (userMessage.toLowerCase().contains("help") || userMessage.toLowerCase().contains("stuck")) {
            return "Don't worry, I'm here to help! 🤝\n\n" +
                "To assist you better, please:\n" +
                "1. Tell me which course or topic you're studying\n" +
                "2. Describe what specifically is confusing you\n" +
                "3. Share what you've already understood\n\n" +
                "This way, I can provide targeted explanations that build on your existing knowledge!";
        } else {
            return "That's an interesting question! 🤔\n\n" +
                "To give you the best answer, it would help to know:\n" +
                "• Which course or topic are you studying?\n" +
                "• What specific aspect interests you?\n" +
                "• What's your current understanding level?\n\n" +
                "Feel free to explore any course and I'll be your personal tutor!";
        }
    }
    
    /**
     * Categorize the type of question asked
     */
    private String categorizeQuestion(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("example") || lower.contains("code") || lower.contains("how to")) {
            return "example_request";
        } else if (lower.contains("clarify") || lower.contains("confused") || lower.contains("difference")) {
            return "clarification";
        } else {
            return "question";
        }
    }
    
    /**
     * Check if message is a greeting
     */
    private boolean isGreeting(String message) {
        String[] greetings = {"hi", "hello", "hey", "greetings", "what's up", "howdy", "namaste"};
        return Arrays.stream(greetings).anyMatch(message::contains);
    }
    
    /**
     * Record feedback on a response
     */
    public void recordFeedback(Long messageId, Boolean isHelpful, String feedbackText) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        message.setIsHelpful(isHelpful);
        message.setFeedback(feedbackText);
        chatMessageRepository.save(message);
        
        log.info("Feedback recorded for message {}: helpful={}, feedback={}", messageId, isHelpful, feedbackText);
    }
    
    /**
     * Get chat history for a user
     */
    public List<ChatMessageDTO> getChatHistory(Long userId, Long courseId) {
        if (courseId != null && courseId > 0) {
            return chatMessageRepository.findCourseMessages(userId, courseId)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            return chatMessageRepository.findLatestMessagesForUser(userId)
                    .stream()
                    .map(this::convertToDTO)
                    .limit(50)
                    .collect(Collectors.toList());
        }
    }
    
    /**
     * Convert ChatMessage entity to DTO
     */
    private ChatMessageDTO convertToDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .userId(message.getUser().getId())
                .courseId(message.getCourse() != null ? message.getCourse().getId() : null)
                .userMessage(message.getUserMessage())
                .botResponse(message.getBotResponse())
                .messageType(message.getMessageType())
                .createdAt(message.getCreatedAt())
                .isHelpful(message.getIsHelpful())
                .feedback(message.getFeedback())
                .build();
    }
    
    /**
     * Initialize concept explanations knowledge base
     */
    private Map<String, String> initializeConceptExplanations() {
        Map<String, String> explanations = new HashMap<>();
        
        // DBMS Concepts
        explanations.put("normalization", 
            "📚 **Database Normalization** - A process to organize data and reduce redundancy:\n\n" +
            "1️⃣ **First Normal Form (1NF)** - Remove duplicate columns, atomic values only\n" +
            "2️⃣ **Second Normal Form (2NF)** - Remove partial dependencies\n" +
            "3️⃣ **Third Normal Form (3NF)** - Remove transitive dependencies\n" +
            "⭐ **Boyce-Codd Normal Form (BCNF)** - Stricter than 3NF\n\n" +
            "Benefits: Reduces data anomalies, improves data integrity, saves storage");
        
        explanations.put("acid", 
            "🔐 **ACID Properties** - Guarantees for reliable transactions:\n\n" +
            "✓ **Atomicity** - All or nothing: entire transaction succeeds or fails\n" +
            "✓ **Consistency** - Data remains valid before and after transaction\n" +
            "✓ **Isolation** - Concurrent transactions don't interfere with each other\n" +
            "✓ **Durability** - Once committed, data persists even after failure\n\n" +
            "Critical for banking, e-commerce, and mission-critical systems");
        
        explanations.put("sql", 
            "🗄️ **SQL - Structured Query Language** - Standard language for databases:\n\n" +
            "📖 **DML**: SELECT, INSERT, UPDATE, DELETE - Manipulate data\n" +
            "📋 **DDL**: CREATE, ALTER, DROP - Define structures\n" +
            "🔒 **DCL**: GRANT, REVOKE - Control access\n" +
            "⚙️ **TCL**: COMMIT, ROLLBACK - Control transactions\n\n" +
            "Pro Tip: Use indexes on frequently queried columns for better performance!");
        
        // OS Concepts
        explanations.put("process", 
            "⚙️ **Process in Operating System** - An executing instance of a program:\n\n" +
            "📋 **Process States**: New → Ready → Running → Waiting → Terminated\n" +
            "💾 **Process Control Block (PCB)** - Stores process information\n" +
            "🔄 **Context Switching** - CPU switches between processes\n" +
            "👨‍👩‍👧 **Parent-Child Relationship** - Process creation hierarchy\n\n" +
            "Difference from Thread: Processes are independent, threads share memory");
        
        explanations.put("deadlock", 
            "🔒 **Deadlock** - When 2+ processes wait indefinitely for each other:\n\n" +
            "4 Necessary Conditions:\n" +
            "1. **Mutual Exclusion** - Resource can't be shared\n" +
            "2. **Hold and Wait** - Process holds resources while waiting\n" +
            "3. **No Preemption** - Resources can't be forcibly taken\n" +
            "4. **Circular Wait** - Circular chain of processes waiting\n\n" +
            "Prevention: Break any one condition. Detection: Banker's algorithm");
        
        // CN Concepts
        explanations.put("tcp", 
            "🌐 **TCP - Transmission Control Protocol** - Reliable, connection-oriented:\n\n" +
            "🤝 **3-Way Handshake** (Connection):\n" +
            "1. SYN (Client → Server)\n" +
            "2. SYN-ACK (Server → Client)\n" +
            "3. ACK (Client → Server)\n\n" +
            "vs UDP: TCP = reliable but slower; UDP = fast but unreliable\n" +
            "Uses: HTTP/HTTPS, Email, FTP. UDP: Video streaming, Gaming");
        
        explanations.put("osi", 
            "🏢 **OSI Model** - 7 Layers for network communication:\n\n" +
            "7. **Application** - HTTP, HTTPS, FTP, DNS - User apps\n" +
            "6. **Presentation** - Encryption, compression - Data format\n" +
            "5. **Session** - Session management, authentication\n" +
            "4. **Transport** - TCP, UDP - End-to-end delivery\n" +
            "3. **Network** - IP, Routing - Path finding\n" +
            "2. **Data Link** - MAC, Ethernet - Frame transmission\n" +
            "1. **Physical** - Cables, signals - Raw bits\n\n" +
            "Remember: **Please Do Not Throw Sausage Pizza Away!**");
        
        // DSA Concepts
        explanations.put("binary search", 
            "🎯 **Binary Search** - O(log n) search in sorted arrays:\n\n" +
            "How it works:\n" +
            "1. Compare middle element\n" +
            "2. If equal, found! If less, search left half\n" +
            "3. If greater, search right half\n" +
            "4. Repeat until found or search space empty\n\n" +
            "⚠️ **Requirement**: Array must be SORTED!\n" +
            "Example: Finding age in [10, 20, 30, 40, 50]");
        
        // General Learning concepts
        explanations.put("algorithm", 
            "🧮 **Algorithm** - Step-by-step procedure to solve a problem:\n\n" +
            "Key Characteristics:\n" +
            "✓ **Finite** - Must terminate\n" +
            "✓ **Definite** - Clear instructions\n" +
            "✓ **Effective** - Practical and efficient\n" +
            "✓ **Input/Output** - Well-defined inputs and outputs\n\n" +
            "Evaluated by: Time Complexity (Big O), Space Complexity, Correctness");
        
        return explanations;
    }
}
