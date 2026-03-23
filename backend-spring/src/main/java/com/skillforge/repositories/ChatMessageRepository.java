package com.skillforge.repositories;

import com.skillforge.models.ChatMessage;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByUserOrderByCreatedAtDesc(User user);
    
    List<ChatMessage> findByUserAndCourseOrderByCreatedAtDesc(User user, Course course);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.user.id = :userId ORDER BY cm.createdAt DESC")
    List<ChatMessage> findLatestMessagesForUser(@Param("userId") Long userId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.user.id = :userId AND cm.course.id = :courseId ORDER BY cm.createdAt DESC")
    List<ChatMessage> findCourseMessages(@Param("userId") Long userId, @Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.user.id = :userId AND cm.isHelpful = true")
    long countHelpfulMessages(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM ChatMessage cm WHERE cm.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
