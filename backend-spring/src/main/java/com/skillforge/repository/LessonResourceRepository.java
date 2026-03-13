package com.skillforge.repository;

import com.skillforge.entity.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, Long> {
    List<LessonResource> findByLessonIdOrderByOrderIndex(Long lessonId);
    void deleteByLessonId(Long lessonId);
}
