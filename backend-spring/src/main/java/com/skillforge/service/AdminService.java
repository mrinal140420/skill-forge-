package com.skillforge.service;

import com.skillforge.dto.AdminDashboardSummaryDTO;
import com.skillforge.dto.UserDTO;
import com.skillforge.dto.CreateInstructorRequestDTO;
import com.skillforge.dto.CreateInstructorResponseDTO;
import com.skillforge.dto.CourseDTO;
import com.skillforge.entity.*;
import com.skillforge.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Service - Handles admin operations and dashboard logic
 */
@Service
public class AdminService {
    
    private static final Logger log = LoggerFactory.getLogger(AdminService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

        @Autowired
        private ProgressRepository progressRepository;

        @Autowired
        private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private DoubtRepository doubtRepository;
    
    @Autowired
    private CourseAdminAssignmentRepository courseAdminAssignmentRepository;
    
    @Autowired
    private CourseService courseService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Assign a course to a course admin user
     */
    public void assignCourseToAdmin(Long userId, Long courseId) {
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        // Check if user is a course admin
        if (admin.getRole() != User.UserRole.COURSE_ADMIN && admin.getRole() != User.UserRole.SUPER_ADMIN) {
            throw new IllegalArgumentException("User must be a course admin");
        }
        
        // Check if assignment already exists
        if (courseAdminAssignmentRepository.findByCourseAndAdmin(course, admin).isPresent()) {
            throw new IllegalArgumentException("This admin is already assigned to this course");
        }
        
        // Create assignment
        CourseAdminAssignment assignment = CourseAdminAssignment.builder()
                .course(course)
                .admin(admin)
                .role("COURSE_ADMIN")
                .build();
        
        courseAdminAssignmentRepository.save(assignment);
        log.info("Assigned course {} to admin {}", courseId, userId);
    }
    
    /**
     * Get courses assigned to an admin (converted to DTOs)
     */
    public List<CourseDTO> getCoursesForAdmin(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        
        // If super admin, return all courses
        if (admin.getRole() == User.UserRole.SUPER_ADMIN) {
            return courseRepository.findAll().stream()
                    .map(courseService::convertCourseToDTOWithParsedData)
                    .collect(Collectors.toList());
        }
        
        // Otherwise return assigned courses
        List<CourseAdminAssignment> assignments = courseAdminAssignmentRepository.findByAdminId(adminId);
        return assignments.stream()
                .map(CourseAdminAssignment::getCourse)
                .map(courseService::convertCourseToDTOWithParsedData)
                .collect(Collectors.toList());
    }

    public java.util.Map<String, Object> getCourseAdminDashboardSummary(User user) {
        List<Course> managedCourses;
        if (user.getRole() == User.UserRole.SUPER_ADMIN) {
            managedCourses = courseRepository.findAll();
        } else {
            managedCourses = courseAdminAssignmentRepository.findByAdminId(user.getId())
                    .stream()
                    .map(CourseAdminAssignment::getCourse)
                    .collect(Collectors.toList());
        }

        List<Long> courseIds = managedCourses.stream().map(Course::getId).toList();
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();
        List<Progress> allProgress = progressRepository.findAll();
        List<QuizAttempt> allQuizAttempts = quizAttemptRepository.findAll();
        List<Doubt> allDoubts = doubtRepository.findAll();

        long enrolledStudents = allEnrollments.stream()
                .filter(e -> courseIds.contains(e.getCourse().getId()))
                .map(e -> e.getUser().getId())
                .distinct()
                .count();

        long pendingDoubts = allDoubts.stream()
                .filter(d -> courseIds.contains(d.getCourse().getId()))
                .filter(d -> d.getStatus() == Doubt.DoubtStatus.OPEN)
                .count();

        double avgProgress = 0.0;
        List<Progress> scopedProgress = allProgress.stream()
                .filter(p -> courseIds.contains(p.getCourse().getId()))
                .toList();
        if (!scopedProgress.isEmpty()) {
                        long completed = scopedProgress.stream().filter(p -> Boolean.TRUE.equals(p.getCompleted())).count();
            avgProgress = (double) completed / scopedProgress.size() * 100.0;
        }

        long quizAttempts = allQuizAttempts.stream()
                .filter(qa -> courseIds.contains(qa.getCourse().getId()))
                .count();

        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("assignedCourses", managedCourses.size());
        summary.put("enrolledStudents", enrolledStudents);
        summary.put("averageProgress", Math.round(avgProgress * 100.0) / 100.0);
        summary.put("pendingDoubts", pendingDoubts);
        summary.put("quizAttempts", quizAttempts);
        summary.put("recentCourses", managedCourses.stream().limit(5).toList());
        return summary;
    }
    
    /**
     * Get all users in the platform
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertUserToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get admin dashboard summary
     */
    public AdminDashboardSummaryDTO getAdminDashboardSummary(User user) {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.STUDENT).count();
        long totalCourseAdmins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.COURSE_ADMIN).count();
        long totalSuperAdmins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.SUPER_ADMIN).count();
        
        // Count courses by status
        List<Course> allCourses = courseRepository.findAll();
        long totalCourses = allCourses.size();
        long publishedCourses = allCourses.stream()
                .filter(c -> c.getStatus() == Course.CourseStatus.PUBLISHED).count();
        long draftCourses = allCourses.stream()
                .filter(c -> c.getStatus() == null || c.getStatus() == Course.CourseStatus.DRAFT).count();
        long archivedCourses = allCourses.stream()
                .filter(c -> c.getStatus() == Course.CourseStatus.ARCHIVED).count();
        
        // Count enrollments
        long totalEnrollments = enrollmentRepository.count();
        
        // Count active learners today
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        long activeLearnersToday = userRepository.findAll().stream()
                .filter(u -> u.getLastActivityAt() != null && u.getLastActivityAt().isAfter(oneDayAgo))
                .count();
        
        // Count doubts
        long totalDoubts = doubtRepository.count();
        long unresolvedDoubts = doubtRepository.findAll().stream()
                .filter(d -> d.getStatus() == Doubt.DoubtStatus.OPEN)
                .count();
        
        return new AdminDashboardSummaryDTO(
                totalUsers, totalStudents, totalCourseAdmins, totalSuperAdmins,
                totalCourses, publishedCourses, draftCourses, archivedCourses,
                totalEnrollments, activeLearnersToday, unresolvedDoubts, totalDoubts
        );
    }
    
    /**
     * Create a new course admin/instructor with auto-generated password
     */
    public CreateInstructorResponseDTO createInstructor(CreateInstructorRequestDTO request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        
        // Generate random password (AWS-style: 12 chars with uppercase, lowercase, numbers, special)
        String generatedPassword = generateSecurePassword();
        
        // Create user
        User instructor = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(User.UserRole.COURSE_ADMIN)
                .lastActivityAt(LocalDateTime.now())
                .build();
        
        User savedInstructor = userRepository.save(instructor);
        log.info("Created new course admin/instructor: {} ({})", request.getName(), request.getEmail());
        
        return new CreateInstructorResponseDTO(
                savedInstructor.getId(),
                savedInstructor.getName(),
                savedInstructor.getEmail(),
                generatedPassword,
                "Instructor created successfully. Share these credentials securely with the instructor."
        );
    }
    
    /**
     * Delete user by ID (except Super Admin)
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getRole() == User.UserRole.SUPER_ADMIN) {
            throw new IllegalArgumentException("Cannot delete Super Admin user");
        }
        
        userRepository.deleteById(userId);
        log.info("Deleted user: {} ({})", user.getName(), user.getEmail());
    }
    
    /**
     * Create a new student user
     */
    public User createStudent(String name, String email) {
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }
        
        // Generate random password
        String generatedPassword = generateSecurePassword();
        
        // Create student user
        User student = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(User.UserRole.STUDENT)
                .lastActivityAt(LocalDateTime.now())
                .build();
        
        User savedStudent = userRepository.save(student);
        log.info("Created new student: {} ({})", name, email);
        
        return savedStudent;
    }
    
    /**
     * Create a new user with specified role
     */
    public User createUser(String name, String email, String role) {
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }
        
        // Generate random password
        String generatedPassword = generateSecurePassword();
        
        // Determine role
        User.UserRole userRole;
        try {
            userRole = User.UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
        
        // Create user
        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(userRole)
                .lastActivityAt(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("Created new {} user: {} ({})", role, name, email);
        
        return savedUser;
    }
    
    /**
     * Generate a secure random password (AWS-style)
     * Example: aB3$xKmN9pQw2
     */
    private String generateSecurePassword() {
        String uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowercase = "abcdefghijklmnopqrstuvwxyz";
        String numbers = "0123456789";
        String special = "!@#$%^&*";
        String all = uppercase + lowercase + numbers + special;
        
        StringBuilder password = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        // Ensure at least one of each type
        password.append(uppercase.charAt(random.nextInt(uppercase.length())));
        password.append(lowercase.charAt(random.nextInt(lowercase.length())));
        password.append(numbers.charAt(random.nextInt(numbers.length())));
        password.append(special.charAt(random.nextInt(special.length())));
        
        // Fill rest randomly
        for (int i = 4; i < 12; i++) {
            password.append(all.charAt(random.nextInt(all.length())));
        }
        
        // Shuffle the password
        String pwd = password.toString();
        char[] chars = pwd.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        
        return new String(chars);
    }

    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertUserToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().toString(),
                user.getCreatedAt(),
                user.getLastActivityAt(),
                user.getUpdatedAt()
        );
    }
}
