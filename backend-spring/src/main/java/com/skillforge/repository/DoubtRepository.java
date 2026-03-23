package com.skillforge.repository;

import com.skillforge.entity.Doubt;
import com.skillforge.entity.User;
import com.skillforge.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoubtRepository extends JpaRepository<Doubt, Long> {
    
    /**
     * Find all doubts by a student
     */
    List<Doubt> findByStudent(User student);
    
    /**
     * Find all doubts for a course
     */
    List<Doubt> findByCourse(Course course);
    
    /**
     * Find all doubts by student and course
     */
    List<Doubt> findByStudentAndCourse(User student, Course course);
    
    /**
     * Find all open doubts for a course
     */
    @Query("SELECT d FROM Doubt d WHERE d.course = :course AND d.status = 'OPEN' ORDER BY d.priority DESC, d.createdAt ASC")
    List<Doubt> findOpenDoubtsByCourse(@Param("course") Course course);
    
    /**
     * Find all open doubts by student
     */
    @Query("SELECT d FROM Doubt d WHERE d.student = :student AND d.status = 'OPEN' ORDER BY d.createdAt DESC")
    List<Doubt> findOpenDoubtsByStudent(@Param("student") User student);
    
    /**
     * Count open doubts for a course
     */
    long countByCourseAndStatus(Course course, Doubt.DoubtStatus status);
    
    /**
     * Find all doubts by course ID
     */
    List<Doubt> findByCourseId(Long courseId);
    
    /**
     * Find all doubts by student ID
     */
    List<Doubt> findByStudentId(Long studentId);

    @Modifying
    long deleteByStudentId(Long studentId);

    @Modifying
    @Query("UPDATE Doubt d SET d.repliedByAdmin = null WHERE d.repliedByAdmin.id = :adminId")
    int clearRepliedByAdmin(@Param("adminId") Long adminId);
}
