package com.skillforge.repository;

import com.skillforge.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByCourseIdOrderByOrderIndex(Long courseId);
    void deleteByCourseId(Long courseId);
}
