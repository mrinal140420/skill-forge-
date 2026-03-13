# Course Content Management System - Documentation

## Overview

A comprehensive course content management system that allows course admins (instructors) to organize their courses into **Topics → Lessons → Resources** hierarchy, with students able to view and consume these materials.

## Feature Highlights

### For Course Admins
- **Topic Management**: Create modules/chapters within a course
- **Lesson Management**: Break topics down into individual lessons
- **Resource Management**: Add study materials (videos, notes, images, PDFs, code snippets, articles, links)
- **Content Visibility**: Show/hide resources from students
- **Duration Tracking**: Set estimated study time for lessons and resources
- **Custom Ordering**: Arrange content in desired sequence
- **Bulk Operations**: Delete entire topic (auto-cascades to lessons and resources)

### For Students
- **Hierarchical Navigation**: Browse courses by topics and lessons
- **Resource Viewer**: Built-in media player and document viewer
- **Progress Tracking**: See how many resources in each lesson (ready for enhancement)
- **YouTube Integration**: Auto-embed YouTube videos
- **Document Support**: View PDFs and images inline

## Architecture

### Database Schema

```sql
-- Topics (course modules)
CREATE TABLE topics (
  id BIGINT PRIMARY KEY,
  course_id BIGINT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  order_index INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Lessons (individual topics)
CREATE TABLE lessons (
  id BIGINT PRIMARY KEY,
  topic_id BIGINT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  order_index INT,
  duration_minutes INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Resources (study materials)
CREATE TABLE lesson_resources (
  id BIGINT PRIMARY KEY,
  lesson_id BIGINT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50), -- VIDEO, NOTES, IMAGE, PDF, CODE_SNIPPET, ARTICLE, LINK
  content_url TEXT,
  order_index INT,
  duration_minutes INT,
  file_size_bytes BIGINT,
  is_visible BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Resource Types

| Type | Description | Example |
|------|-------------|---------|
| **VIDEO** | Video tutorials | YouTube links, recorded lectures |
| **NOTES** | Text notes | Study guides, summaries |
| **IMAGE** | Visual diagrams | Flowcharts, screenshots, infographics |
| **PDF** | PDF documents | E-books, handouts, research papers |
| **CODE_SNIPPET** | Code examples | GitHub gists, sample code |
| **ARTICLE** | Blog posts & articles | Medium articles, tutorials |
| **LINK** | External resources | Reference materials, documentation |

## Backend APIs

### Course Content Endpoints

#### Topics Management

**Create Topic**
```
POST /api/content/courses/{courseId}/topics
{
  "title": "Introduction to Data Structures",
  "description": "Fundamentals of DSA",
  "orderIndex": 1
}
```

**Get Topics**
```
GET /api/content/courses/{courseId}/topics
Returns: { "topics": [...] }
```

**Update Topic**
```
PUT /api/content/topics/{topicId}
{
  "title": "Updated Title",
  "description": "Updated description",
  "orderIndex": 2
}
```

**Delete Topic** (cascades to lessons & resources)
```
DELETE /api/content/topics/{topicId}
```

#### Lessons Management

**Create Lesson**
```
POST /api/content/topics/{topicId}/lessons
{
  "title": "What is an Array?",
  "description": "Learn array basics",
  "orderIndex": 1,
  "durationMinutes": 30
}
```

**Get Lessons**
```
GET /api/content/topics/{topicId}/lessons
Returns: { "lessons": [...] }
```

**Update Lesson**
```
PUT /api/content/lessons/{lessonId}
{
  "title": "Updated Lesson",
  "description": "Updated description",
  "orderIndex": 1,
  "durationMinutes": 45
}
```

**Delete Lesson** (cascades to resources)
```
DELETE /api/content/lessons/{lessonId}
```

#### Resources Management

**Add Resource**
```
POST /api/content/lessons/{lessonId}/resources
{
  "title": "Array Basics Video",
  "description": "Introduction to arrays",
  "type": "VIDEO",
  "contentUrl": "https://youtube.com/watch?v=...",
  "orderIndex": 1,
  "durationMinutes": 15,
  "fileSizeBytes": null
}
```

**Get Resources** (only visible ones for students)
```
GET /api/content/lessons/{lessonId}/resources
Returns: { "resources": [...] }
```

**Update Resource**
```
PUT /api/content/resources/{resourceId}
{
  "title": "Updated title",
  "description": "Updated description",
  "type": "VIDEO",
  "contentUrl": "https://new-url.com",
  "orderIndex": 1,
  "durationMinutes": 20,
  "isVisible": true
}
```

**Delete Resource**
```
DELETE /api/content/resources/{resourceId}
```

## Frontend Components

### AdminCourseContent Component

**Purpose**: Allows course admins to create and manage course content

**Location**: `src/pages/AdminCourseContent.tsx`

**Features**:
- Nested form interface for topics, lessons, and resources
- Real-time validation
- Inline editing without page reload
- Expandable sections for better UX
- Gradient UI with Tailwind CSS
- Loading states and error handling

**Usage**:
```tsx
import { AdminCourseContent } from '@/pages/AdminCourseContent';

<Route 
  path="/admin/courses/:courseId/content"
  element={<AdminRoute element={<AdminCourseContent />} />}
/>
```

### CourseContent Component (Student View)

**Purpose**: Display course curriculum to students

**Location**: `src/pages/CourseContent.tsx`

**Features**:
- Three-column layout (sidebar, main content, resource viewer)
- Expandable topics and lessons
- Resource viewer modal with:
  - YouTube embedding
  - PDF inline display
  - Image gallery support
  - External link handling
- Auto-expanding first topic
- Progress indicators (resource counts)

**Usage**:
```tsx
<Route 
  path="/course-content/:courseId"
  element={<ProtectedRoute element={<CourseContent />} />}
/>
```

## Navigation

### For Admins

1. **Admin Dashboard** → Click on a course
2. **Course Management** → Click "Content" button
3. **Content Editor** → Add topics, lessons, resources

### For Students

1. **Learning Dashboard** → Click on enrolled course
2. **Course View** → "Course Curriculum" section
3. **Study Materials** → Click topics/lessons/resources

## Usage Workflow

### Admin: Creating Course Content

1. **Go to Admin Courses**
   - Navigate to `/admin/courses`
   - Find your course and click "Content" button

2. **Create Topics**
   - Click "Add New Topic" button
   - Enter title, description, order
   - Topics appear as collapsible sections

3. **Add Lessons to Topics**
   - Expand a topic
   - Click "Add Lesson to Topic"
   - Enter lesson details (title, description, duration)
   - Click "Create Lesson"

4. **Add Resources to Lessons**
   - Expand a lesson
   - Click "Add Resource"
   - Select resource type (VIDEO, NOTES, PDF, etc.)
   - Provide content URL and metadata
   - Click "Add"

5. **Manage Content**
   - Edit resources: Update title, description, visibility
   - Toggle visibility: Click eye/eye-off icon
   - Delete: Click trash icon with confirmation
   - Reorder: Use order index fields

### Student: Learning from Content

1. **Access Course**
   - Go to "My Courses"
   - Find course → Click "Study Materials" or go to `/course-content/{courseId}`

2. **Navigate Content**
   - Topics sidebar on left shows all modules
   - Click topic to expand and see lessons
   - Click lesson to view resources

3. **View Resources**
   - Click resource to open viewer modal
   - **Videos**: YouTube embeds auto-play
   - **PDFs**: Click "Open PDF Document" link
   - **Images**: Display inline with zoom support
   - **Links**: Click to open in new tab

4. **Progress**
   - See resource count per lesson
   - Duration indicators help plan study time

## API Response Format

### Topics Response
```json
{
  "topics": [
    {
      "id": 1,
      "title": "Introduction to DSA",
      "description": "Basic concepts",
      "orderIndex": 1,
      "lessons": [...],
      "createdAt": "2024-03-13T...",
      "updatedAt": "2024-03-13T..."
    }
  ]
}
```

### Lessons Response
```json
{
  "lessons": [
    {
      "id": 1,
      "title": "What is an Array?",
      "description": "Array basics",
      "orderIndex": 1,
      "durationMinutes": 30,
      "resources": [...],
      "createdAt": "2024-03-13T...",
      "updatedAt": "2024-03-13T..."
    }
  ]
}
```

### Resources Response
```json
{
  "resources": [
    {
      "id": 1,
      "title": "Array Intro Video",
      "description": "YouTube tutorial",
      "type": "VIDEO",
      "contentUrl": "https://youtube.com/...",
      "orderIndex": 1,
      "durationMinutes": 15,
      "fileSizeBytes": 0,
      "isVisible": true,
      "createdAt": "2024-03-13T...",
      "updatedAt": "2024-03-13T..."
    }
  ]
}
```

## Best Practices

### For Admins

1. **Organize Content Logically**
   - Use topics as course modules/chapters
   - Keep lessons focused on single concepts
   - Group related resources together

2. **Resource Management**
   - Use descriptive titles and descriptions
   - Set appropriate duration estimates
   - Hide incomplete or outdated resources
   - Link to official documentation for links

3. **Student Experience**
   - Mix resource types (video + notes + code)
   - Keep lesson sizes manageable (3-5 resources max)
   - Provide progress through clear structure
   - Update duration as courses evolve

### For Students

1. **Active Learning**
   - Read notes before watching videos
   - Try code snippets personally
   - Take notes while learning
   - Review resources periodically

2. **Navigation Tips**
   - Expand all topics to see course structure
   - Use sidebar for quick navigation
   - Check all resource types in each lesson
   - Pay attention to duration estimates

## Future Enhancements

- [ ] **File Upload**: Replace URLs with direct file uploads to S3
- [ ] **Progress Tracking**: Mark resources as completed
- [ ] **Quiz Integration**: Assessment after lessons
- [ ] **Comments**: Discuss resources with instructors
- [ ] **Badges**: Earn certificates for completing topics
- [ ] **Search**: Full-text search across all resources
- [ ] **Transcripts**: Auto-generated for videos
- [ ] **Offline Mode**: Download resources for offline study

## Troubleshooting

### Issue: Resources not showing for students

**Solution**: Check resource `isVisible` flag. Admins can hide/show using eye icon.

### Issue: YouTube videos not embedding

**Solution**: Ensure URL is from youtube.com or youtu.be. Component auto-detects and converts.

### Issue: PDF not displaying

**Solution**: Verify content URL is accessible and returns PDF MIME type.

### Issue: Lesson resources missing in dropdown

**Solution**: Ensure parent topic/lesson exists and endpoint responding with data.

### Issue: Delete cascading not working

**Solution**: Verify database FK constraints are enabled. Should be automatic in H2/PostgreSQL.

## Testing

### Test Scenario 1: Create Full Course Structure
```
1. Create Topic: "Data Structures Fundamentals"
2. Create Lesson under topic: "Arrays and Lists"
3. Create Resources:
   - VIDEO: YouTube link
   - NOTES: PDF link
   - CODE_SNIPPET: GitHub gist
4. Set visibility and durations
5. View as student
```

### Test Scenario 2: Resource Management
```
1. Create resource
2. Update resource details
3. Toggle visibility
4. Delete resource
5. Verify cascade deletion
```

### Test Scenario 3: Student Experience
```
1. Login as student
2. Navigate to My Courses
3. Open course
4. Expand all topics/lessons
5. Click resources to view
6. Verify media players and links work
```

## Security Notes

- **Authorization**: All endpoints check user role (admin/instructor)
- **Visibility**: Students only see visible resources
- **Data Isolation**: Users can only manage their own courses
- **URL Validation**: Content URLs should point to trusted sources
- **Input Validation**: All fields validated on backend

## Support & Feedback

For issues, improvements, or feature requests:
1. Check this documentation
2. Review API response format
3. Check browser console for errors
4. Review backend logs

---

**Last Updated**: 2024-03-13  
**Version**: 1.0.0  
**Status**: Production Ready
