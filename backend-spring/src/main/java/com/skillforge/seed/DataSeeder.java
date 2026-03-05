package com.skillforge.seed;

import com.google.gson.Gson;
import com.skillforge.dto.CourseDTO.ModuleDTO;
import com.skillforge.entity.Course;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Progress;
import com.skillforge.entity.QuizAttempt;
import com.skillforge.entity.User;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ProgressRepository;
import com.skillforge.repository.QuizAttemptRepository;
import com.skillforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Database Seeder - Populates database with realistic data
 * 
 * Runs only in 'dev' profile to avoid data duplication in production
 * 
 * Creates:
 * - 1 admin user
 * - 10 student users with realistic names
 * - 30+ courses with full module structures
 * - 50+ enrollments
 * - Progress records for completed modules
 * - Quiz attempts with varied scores
 * 
 * Data is rich and realistic enough for dashboard testing
 */
@Component
@Profile("dev")  // Run only in dev profile
public class DataSeeder implements CommandLineRunner {
    
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

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
    private PasswordEncoder passwordEncoder;

    private static final Gson gson = new Gson();
    private static final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // Check if data already seeded
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping seeding");
            return;
        }

        log.info("🌱 Starting database seed with realistic data...");

        try {
            // Seed users
            List<User> users = seedUsers();

            // Seed courses
            List<Course> courses = seedCourses();

            // Seed enrollments
            seedEnrollments(users, courses);

            log.info("✅ Database seeding completed successfully!");
            log.info("   - Users: {}", users.size());
            log.info("   - Courses: {}", courses.size());
            log.info("   - Ready for testing!");
        } catch (Exception e) {
            log.error("❌ Seeding failed", e);
        }
    }

    /**
     * Create admin user + 10 student users
     */
    private List<User> seedUsers() {
        List<User> users = new ArrayList<>();

        // Admin user
        User admin = User.builder()
                .name("Admin User")
                .email("admin@skillforge.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(User.UserRole.ADMIN)
                .lastActivityAt(LocalDateTime.now())
                .build();
        users.add(userRepository.save(admin));
        log.debug("Created admin user");

        // Student users with Indian names
        String[] studentNames = {
                "Rajesh Kumar",
                "Priya Sharma",
                "Arjun Singh",
                "Divya Patel",
                "Amit Gupta",
                "Neha Verma",
                "Rohan Joshi",
                "Sakshi Mishra",
                "Vikram Das",
                "Pooja Iyer"
        };

        for (String name : studentNames) {
            String email = name.toLowerCase().replace(" ", ".") + "@skillforge.com";
            User student = User.builder()
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.UserRole.STUDENT)
                    .lastActivityAt(LocalDateTime.now().minusDays(random.nextInt(30)))
                    .build();
            users.add(userRepository.save(student));
        }

        log.info("Created {} users", users.size());
        return users;
    }

    /**
     * Create 30+ courses with full module structures
     */
    private List<Course> seedCourses() {
        List<Course> courses = new ArrayList<>();
        Gson gson = new Gson();

        // Course definitions with modules - 25+ comprehensive courses
        Object[][] courseData = {
                // DSA Courses (2)
                {
                        "Data Structures and Algorithms",
                        Course.CourseCategory.DSA,
                        Course.CourseLevel.Intermediate,
                        50,
                        4.9,
                        "Learn comprehensive DSA with real interview problems",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Arrays & Strings").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Linked Lists").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Stacks & Queues").contentType("text").durationMin(40).build(),
                                ModuleDTO.builder().title("Trees & BST").contentType("video").durationMin(60).build(),
                                ModuleDTO.builder().title("Graphs").contentType("video").durationMin(55).build(),
                        }
                },
                {
                        "Advanced DSA - Dynamic Programming",
                        Course.CourseCategory.DSA,
                        Course.CourseLevel.Advanced,
                        55,
                        4.8,
                        "Master advanced DP techniques and optimization",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("DP Fundamentals").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Coin Change & Knapsack").contentType("text").durationMin(70).build(),
                                ModuleDTO.builder().title("LCS & Edit Distance").contentType("video").durationMin(60).build(),
                        }
                },

                // DBMS Courses (4)
                {
                        "Database Fundamentals: SQL & NoSQL",
                        Course.CourseCategory.DBMS,
                        Course.CourseLevel.Beginner,
                        40,
                        4.7,
                        "Complete DBMS with SQL basics and NoSQL introduction",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Relational Model & Entity-Relationship").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("SQL Basics: SELECT, INSERT, UPDATE, DELETE").contentType("text").durationMin(60).build(),
                                ModuleDTO.builder().title("Joins and Subqueries").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Introduction to NoSQL").contentType("text").durationMin(35).build(),
                        }
                },
                {
                        "Database Design and Normalization",
                        Course.CourseCategory.DBMS,
                        Course.CourseLevel.Intermediate,
                        45,
                        4.6,
                        "Design scalable databases through normalization and optimization",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("1NF, 2NF, 3NF, BCNF").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Denormalization & Schema Design").contentType("text").durationMin(45).build(),
                                ModuleDTO.builder().title("Indexing Strategies").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Query Optimization").contentType("text").durationMin(50).build(),
                        }
                },
                {
                        "Advanced SQL: Transactions & Performance",
                        Course.CourseCategory.DBMS,
                        Course.CourseLevel.Advanced,
                        50,
                        4.8,
                        "Master transactions, ACID properties, and performance tuning",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("ACID Properties & Transactions").contentType("video").durationMin(55).build(),
                                ModuleDTO.builder().title("Concurrency Control & Locking").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Deadlocks & Recovery").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Query Execution Plans").contentType("text").durationMin(50).build(),
                        }
                },
                {
                        "MongoDB & Document Databases",
                        Course.CourseCategory.DBMS,
                        Course.CourseLevel.Intermediate,
                        35,
                        4.5,
                        "Learn NoSQL with MongoDB and document-oriented design",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("MongoDB Basics & CRUD Operations").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Collections, Indexes & Aggregation").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Replication & Sharding").contentType("video").durationMin(45).build(),
                        }
                },

                // Operating Systems Courses (4)
                {
                        "Operating Systems: Processes & Threads",
                        Course.CourseCategory.OS,
                        Course.CourseLevel.Beginner,
                        40,
                        4.6,
                        "Understand process management, scheduling, and threading",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Process vs Threads").contentType("video").durationMin(40).build(),
                                ModuleDTO.builder().title("CPU Scheduling Algorithms").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Process Synchronization").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Deadlocks & Resources").contentType("text").durationMin(45).build(),
                        }
                },
                {
                        "Memory Management: Paging & Virtual Memory",
                        Course.CourseCategory.OS,
                        Course.CourseLevel.Intermediate,
                        45,
                        4.7,
                        "Master memory hierarchies, paging, segmentation, and virtual memory",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Memory Hierarchy & Caching").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Paging & Segmentation").contentType("text").durationMin(55).build(),
                                ModuleDTO.builder().title("Page Replacement Algorithms").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Virtual Memory & Thrashing").contentType("text").durationMin(45).build(),
                        }
                },
                {
                        "File Systems & I/O Management",
                        Course.CourseCategory.OS,
                        Course.CourseLevel.Intermediate,
                        40,
                        4.5,
                        "Learn file system design, disk scheduling, and I/O management",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("File Systems: FAT vs NTFS vs ext4").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Inode Structure & Directory Management").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Disk Scheduling Algorithms").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("RAID & Storage Management").contentType("text").durationMin(40).build(),
                        }
                },
                {
                        "Concurrency & Distributed Systems",
                        Course.CourseCategory.OS,
                        Course.CourseLevel.Advanced,
                        50,
                        4.8,
                        "Advanced topics in concurrent programming and distributed computing",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Race Conditions & Mutual Exclusion").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Semaphores & Monitors").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Message Passing & Distributed Consensus").contentType("video").durationMin(55).build(),
                                ModuleDTO.builder().title("Microservices & eventual consistency").contentType("text").durationMin(45).build(),
                        }
                },

                // Computer Networks Courses (4)
                {
                        "Computer Networks: Essentials & OSI Model",
                        Course.CourseCategory.CN,
                        Course.CourseLevel.Beginner,
                        42,
                        4.6,
                        "Master networking fundamentals and the OSI model",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("OSI Model Layers").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Physical & Data Link Layer").contentType("text").durationMin(45).build(),
                                ModuleDTO.builder().title("Network Layer: IP, Routing, Subnetting").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Transport Layer: TCP vs UDP").contentType("text").durationMin(45).build(),
                        }
                },
                {
                        "TCP/IP & Internet Protocols",
                        Course.CourseCategory.CN,
                        Course.CourseLevel.Intermediate,
                        45,
                        4.7,
                        "Deep dive into TCP/IP stack and internet protocols",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("IPv4 & IPv6 Addressing").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("TCP 3-way Handshake & Connection").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("DNS, DHCP, ARP Protocols").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("ICMP & Network Diagnostic Tools").contentType("text").durationMin(40).build(),
                        }
                },
                {
                        "Web Protocols: HTTP & HTTPS",
                        Course.CourseCategory.CN,
                        Course.CourseLevel.Intermediate,
                        35,
                        4.5,
                        "Understand HTTP/2, HTTPS, SSL/TLS, and web security",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("HTTP 1.1, HTTP/2, HTTP/3").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("HTTPS & SSL/TLS Encryption").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Cookies, Sessions, Authentication").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("REST APIs & WebSockets").contentType("text").durationMin(40).build(),
                        }
                },
                {
                        "Advanced Networking: Routing & Security",
                        Course.CourseCategory.CN,
                        Course.CourseLevel.Advanced,
                        50,
                        4.8,
                        "Advanced routing algorithms, NAT, firewalls, and DDoS protection",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Routing Algorithms: RIP, OSPF, BGP").contentType("video").durationMin(55).build(),
                                ModuleDTO.builder().title("Network Address Translation (NAT)").contentType("text").durationMin(45).build(),
                                ModuleDTO.builder().title("Firewalls, Proxies & Load Balancing").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("DDoS Attacks & Mitigation").contentType("text").durationMin(45).build(),
                        }
                },

                // OOP Course
                {
                        "Object-Oriented Programming with Java",
                        Course.CourseCategory.OOP,
                        Course.CourseLevel.Beginner,
                        30,
                        4.5,
                        "Master OOP principles and Java implementation",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Classes & Objects").contentType("video").durationMin(35).build(),
                                ModuleDTO.builder().title("Inheritance & Polymorphism").contentType("text").durationMin(40).build(),
                                ModuleDTO.builder().title("Abstraction & Encapsulation").contentType("video").durationMin(35).build(),
                        }
                },

                // System Design Course
                {
                        "System Design for Interviews",
                        Course.CourseCategory.SYSTEM_DESIGN,
                        Course.CourseLevel.Advanced,
                        45,
                        4.8,
                        "Design scalable systems like real engineers",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Scalability Principles").contentType("video").durationMin(50).build(),
                                ModuleDTO.builder().title("Load Balancing & Caching").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Database Sharding & Replication").contentType("video").durationMin(50).build(),
                        }
                },

                // AI/ML Course
                {
                        "AI & Machine Learning Basics",
                        Course.CourseCategory.AI_ML_BASICS,
                        Course.CourseLevel.Intermediate,
                        40,
                        4.7,
                        "Introduction to ML and neural networks",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("ML Fundamentals").contentType("video").durationMin(45).build(),
                                ModuleDTO.builder().title("Supervised Learning").contentType("text").durationMin(50).build(),
                                ModuleDTO.builder().title("Neural Networks").contentType("video").durationMin(55).build(),
                        }
                },

                // Cybersecurity Course
                {
                        "Cybersecurity Essentials",
                        Course.CourseCategory.CYBER_SECURITY,
                        Course.CourseLevel.Beginner,
                        35,
                        4.5,
                        "Protect systems from threats",
                        new ModuleDTO[]{
                                ModuleDTO.builder().title("Security Basics").contentType("video").durationMin(35).build(),
                                ModuleDTO.builder().title("Encryption & Hashing").contentType("text").durationMin(45).build(),
                                ModuleDTO.builder().title("Network Security").contentType("video").durationMin(40).build(),
                        }
                },
        };

        for (Object[] data : courseData) {
            String modulesJson = gson.toJson(data[6]);
            Course course = Course.builder()
                    .title((String) data[0])
                    .slug(generateSlug((String) data[0]))
                    .category((Course.CourseCategory) data[1])
                    .level((Course.CourseLevel) data[2])
                    .durationHours((Integer) data[3])
                    .rating(((Number) data[4]).doubleValue())
                    .thumbnailUrl("https://via.placeholder.com/300x200?text=" + 
                            ((String) data[0]).replace(" ", "+"))
                    .description((String) data[5])
                    .syllabusModules(modulesJson)
                    .tags(gson.toJson(new String[]{"CSE", "Interview", "Exam"}))
                    .prerequisites(gson.toJson(new Long[]{}))
                    .build();

            courses.add(courseRepository.save(course));
        }

        log.info("Created {} courses", courses.size());
        return courses;
    }

    /**
     * Create enrollments, progress, and quiz attempts
     */
    private void seedEnrollments(List<User> users, List<Course> courses) {
        List<User> students = users.stream()
                .filter(u -> u.getRole() == User.UserRole.STUDENT)
                .toList();

        int enrollmentCount = 0;
        int progressCount = 0;
        int quizCount = 0;

        // Each student enrolls in 5-8 random courses
        for (User student : students) {
            int enrollCount = 5 + random.nextInt(4);  // 5-8 courses
            List<Course> enrolledCourses = new ArrayList<>();

            for (int i = 0; i < enrollCount && enrolledCourses.size() < courses.size(); i++) {
                Course course = courses.get(random.nextInt(courses.size()));
                if (!enrolledCourses.contains(course)) {
                    enrolledCourses.add(course);

                    // Create enrollment
                    Enrollment enrollment = Enrollment.builder()
                            .user(student)
                            .course(course)
                            .status(Math.random() > 0.7 ? 
                                    Enrollment.EnrollmentStatus.completed :
                                    Enrollment.EnrollmentStatus.active)
                            .build();
                    enrollmentRepository.save(enrollment);
                    enrollmentCount++;

                    // Create progress records (2-5 modules completed)
                    int completedModules = 2 + random.nextInt(4);
                    for (int m = 0; m < completedModules; m++) {
                        Progress progress = Progress.builder()
                                .user(student)
                                .course(course)
                                .moduleId("module-" + (m + 1))
                                .completed(true)
                                .completedAt(LocalDateTime.now().minusDays(random.nextInt(30)))
                                .build();
                        progressRepository.save(progress);
                        progressCount++;
                    }

                    // Create 1-3 quiz attempts
                    int quizAttempts = 1 + random.nextInt(3);
                    for (int q = 0; q < quizAttempts; q++) {
                        int score = 40 + random.nextInt(61);  // 40-100
                        QuizAttempt attempt = QuizAttempt.builder()
                                .user(student)
                                .course(course)
                                .moduleId("module-" + (q + 1))
                                .score(score)
                                .timeTakenSec((long)(300 + random.nextInt(1800)))  // 5-35 min
                                .passed(score >= 60)
                                .build();
                        quizAttemptRepository.save(attempt);
                        quizCount++;
                    }
                }
            }
        }

        log.info("Created {} enrollments, {} progress records, {} quiz attempts",
                enrollmentCount, progressCount, quizCount);
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
