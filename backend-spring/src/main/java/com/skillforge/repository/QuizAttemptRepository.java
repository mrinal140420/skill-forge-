package com.skillforge.repository;

import com.skillforge.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * QuizAttempt Repository - JPA repository for QuizAttempt entity
 * Queries for quiz attempt tracking and analytics
 */
@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    /**
     * Find all quiz attempts for a user
     */
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.user.id = :userId")
    List<QuizAttempt> findAllByUserId(@Param("userId") Long userId);
    
    /**
     * Find all quiz attempts for a user in a specific course
     */
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.user.id = :userId AND qa.course.id = :courseId")
    List<QuizAttempt> findAllByUserIdAndCourseId(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId
    );
    
    /**
     * Find all quiz attempts for a specific module
     */
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.user.id = :userId AND qa.moduleId = :moduleId")
    List<QuizAttempt> findAllByUserIdAndModuleId(
            @Param("userId") Long userId,
            @Param("moduleId") String moduleId
    );
}
