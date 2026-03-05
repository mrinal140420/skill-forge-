import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CourseCard.css';

export const CourseCard = ({ course, onEnroll }) => {
  return (
    <Card className="course-card h-100">
      <Card.Img
        variant="top"
        src={course.thumbnailUrl}
        alt={course.title}
        className="course-image"
      />
      <Card.Body>
        <div className="course-category-badge">
          <Badge bg="primary">{course.category}</Badge>
        </div>
        <Card.Title className="course-title">{course.title}</Card.Title>
        <Card.Text className="course-description">{course.description?.substring(0, 80)}...</Card.Text>
        <div className="course-meta">
          <span className="course-level">📚 {course.level}</span>
          <span className="course-duration">⏱ {course.durationHours}h</span>
        </div>
        <div className="course-rating">
          <span className="stars">⭐ {course.rating.toFixed(1)}</span>
        </div>
      </Card.Body>
      <Card.Footer className="bg-white border-top-0">
        <Link to={`/courses/${course._id}`} className="btn btn-primary w-100 btn-sm">
          View Course
        </Link>
      </Card.Footer>
    </Card>
  );
};
