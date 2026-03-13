import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

interface Course {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  durationHours: number;
  rating: number;
  thumbnailUrl?: string;
}

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll }) => {
  const courseId = course.id || course._id || '';

  return (
    <div className="course-card h-100 border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      {course.thumbnailUrl && (
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="course-image w-full h-48 object-cover"
        />
      )}
      <div className="course-body p-4">
        <div className="course-category-badge mb-2">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {course.category}
          </span>
        </div>
        <h3 className="course-title text-lg font-semibold mb-2">{course.title}</h3>
        <p className="course-description text-sm text-gray-600 mb-3">
          {course.description?.substring(0, 80)}...
        </p>
        <div className="course-meta flex gap-4 text-sm mb-3">
          <span className="course-level">📚 {course.level}</span>
          <span className="course-duration">⏱ {course.durationHours}h</span>
        </div>
        <div className="course-rating mb-4">
          <span className="stars">⭐ {course.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-4 border-t">
        <Link to={`/courses/${courseId}`} className="block px-4 py-2 bg-blue-600 text-white text-center rounded font-medium hover:bg-blue-700 transition">
          View Course
        </Link>
      </div>
    </div>
  );
};
