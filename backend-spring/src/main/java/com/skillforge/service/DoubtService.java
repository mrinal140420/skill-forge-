package com.skillforge.service;

import com.skillforge.dto.DoubtDTO;
import com.skillforge.entity.Doubt;
import com.skillforge.entity.User;
import com.skillforge.entity.Course;
import com.skillforge.repository.DoubtRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.CourseAdminAssignmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Doubt Service - Handles student doubts and admin responses
 */
@Service
public class DoubtService {
    
    private static final Logger log = LoggerFactory.getLogger(DoubtService.class);
    
    @Autowired
    private DoubtRepository doubtRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CourseAdminAssignmentRepository courseAdminAssignmentRepository;
    
    /**
     * Student submits a new doubt
     */
    public DoubtDTO submitDoubt(Long studentId, Long courseId, String title, String description, String moduleId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        Doubt doubt = Doubt.builder()
                .student(student)
                .course(course)
                .title(title)
                .description(description)
                .moduleId(moduleId)
                .status(Doubt.DoubtStatus.OPEN)
                .priority(Doubt.DoubtPriority.MEDIUM)
                .build();
        
        Doubt saved = doubtRepository.save(doubt);
        log.info("Student {} submitted doubt for course {}", studentId, courseId);
        
        return convertDoubtToDTO(saved);
    }
    
    /**
     * Get all doubts (super admin only)
     */
    public List<DoubtDTO> getAllDoubts(Long courseId) {
        List<Doubt> doubts;
        
        if (courseId != null) {
            doubts = doubtRepository.findByCourseId(courseId);
        } else {
            doubts = doubtRepository.findAll();
        }
        
        return doubts.stream()
                .map(this::convertDoubtToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get doubts for a course admin (only for assigned courses)
     */
    public List<DoubtDTO> getDoubtsForCourseAdmin(Long adminId, Long courseId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        
        List<Doubt> doubts;
        
        if (courseId != null) {
            // Verify admin is assigned to this course
            courseAdminAssignmentRepository.findByAdminId(adminId).stream()
                    .filter(a -> a.getCourse().getId().equals(courseId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Admin not assigned to this course"));
            
            doubts = doubtRepository.findByCourseId(courseId);
        } else {
            // Get doubts for all assigned courses
            List<Long> assignedCourseIds = courseAdminAssignmentRepository.findByAdminId(adminId)
                    .stream()
                    .map(a -> a.getCourse().getId())
                    .collect(Collectors.toList());
            
            doubts = doubtRepository.findAll().stream()
                    .filter(d -> assignedCourseIds.contains(d.getCourse().getId()))
                    .collect(Collectors.toList());
        }
        
        return doubts.stream()
                .map(this::convertDoubtToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Reply to a doubt
     */
    public DoubtDTO replyToDoubt(Long doubtId, String reply, Long adminId) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new IllegalArgumentException("Doubt not found"));
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        
        doubt.setAdminReply(reply);
        doubt.setRepliedByAdmin(admin);
        doubt.setRepliedAt(LocalDateTime.now());
        doubt.setStatus(Doubt.DoubtStatus.RESOLVED);
        
        Doubt saved = doubtRepository.save(doubt);
        log.info("Admin {} replied to doubt {}", adminId, doubtId);
        
        return convertDoubtToDTO(saved);
    }
    
    /**
     * Resolve a doubt
     */
    public void resolveDoubt(Long doubtId) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new IllegalArgumentException("Doubt not found"));
        
        doubt.setStatus(Doubt.DoubtStatus.RESOLVED);
        doubtRepository.save(doubt);
    }
    
    /**
     * Close a doubt
     */
    public void closeDoubt(Long doubtId) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new IllegalArgumentException("Doubt not found"));
        
        doubt.setStatus(Doubt.DoubtStatus.CLOSED);
        doubtRepository.save(doubt);
    }
    
    /**
     * Get doubts by student
     */
    public List<DoubtDTO> getDoubtsByStudent(Long studentId) {
        List<Doubt> doubts = doubtRepository.findByStudentId(studentId);
        return doubts.stream()
                .map(this::convertDoubtToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Doubt entity to DoubtDTO
     */
    private DoubtDTO convertDoubtToDTO(Doubt doubt) {
        DoubtDTO dto = new DoubtDTO();
        dto.setId(doubt.getId());
        dto.setStudentId(doubt.getStudent().getId());
        dto.setStudentName(doubt.getStudent().getName());
        dto.setCourseId(doubt.getCourse().getId());
        dto.setCourseTitle(doubt.getCourse().getTitle());
        dto.setModuleId(doubt.getModuleId());
        dto.setTitle(doubt.getTitle());
        dto.setDescription(doubt.getDescription());
        dto.setStatus(doubt.getStatus().toString());
        dto.setAdminReply(doubt.getAdminReply());
        if (doubt.getRepliedByAdmin() != null) {
            dto.setRepliedByAdminId(doubt.getRepliedByAdmin().getId());
            dto.setRepliedByAdminName(doubt.getRepliedByAdmin().getName());
        }
        dto.setRepliedAt(doubt.getRepliedAt());
        dto.setPriority(doubt.getPriority().toString());
        dto.setCreatedAt(doubt.getCreatedAt());
        dto.setUpdatedAt(doubt.getUpdatedAt());
        return dto;
    }
}
