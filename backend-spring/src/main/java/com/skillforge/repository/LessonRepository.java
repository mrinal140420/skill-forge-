package com.skillforge.repository;

import com.skillforge.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTopicIdOrderByOrderIndex(Long topicId);
    void deleteByTopicId(Long topicId);
}
