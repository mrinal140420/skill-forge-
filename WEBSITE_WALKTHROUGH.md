# SkillForge LMS - Complete Website Walkthrough

## 📋 Table of Contents
1. [Landing Page](#landing-page)
2. [Student Journey](#student-journey)
3. [Instructor Journey](#instructor-journey)
4. [Super Admin Dashboard](#super-admin-dashboard)
5. [Student Doubts System](#student-doubts-system)
6. [New Feature: Instructor Creation](#new-feature-instructor-creation)

---

## Landing Page
**URL:** `http://localhost:5173/`

```
┌─────────────────────────────────────────────────────────────┐
│                     SkillForge Logo                          │
│                Learn Computer Science the Smart Way          │
│                                                              │
│  [Login]  [Sign Up]  [Explore Courses]  [Features]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Featured Courses                                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Advanced DSA │  │ System Design│  │   DBMS       │      │
│  │ ★ 4.9       │  │ ★ 4.8       │  │ ★ 4.7       │      │
│  │ 12.5K stud. │  │ 8.9K stud.  │  │ 6.2K stud.  │      │
│  │ 40 hours    │  │ 35 hours    │  │ 30 hours    │      │
│  │ 12 modules  │  │ 10 modules  │  │ 8 modules   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Why SkillForge?                                              │
│                                                              │
│ ✓ Expert Instructors  ✓ Structured Learning Paths           │
│ ✓ Hands-on Modules    ✓ Proctored Exams                     │
│ ✓ Instant Feedback    ✓ Performance Analytics               │
│ ✓ Industry Certificates  ✓ Doubt Resolution                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Learning Journey Steps:                                      │
│ 1. Enroll in Course → 2. Complete Modules → 3. Exam        │
│ → 4. Get Certificate                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Student Journey

### 1. Login Page
**URL:** `http://localhost:5173/login`
```
┌─────────────────────────────────┐
│    SkillForge Login              │
│                                  │
│  Email: ________________         │
│                                  │
│  Password: ________________      │
│                                  │
│  [Login]  [Sign Up]             │
│                                  │
│  [GitHub OAuth]                  │
└─────────────────────────────────┘

Test Credentials:
- Email: student@skillforge.com
- Password: student123
```

### 2. Student Dashboard
**URL:** `http://localhost:5173/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Dashboard                    Welcome: John Student        │
├─────────────────────────────────────────────────────────────┤
│ Sidebar Navigation:                                          │
│ • Dashboard (Current)          │                             │
│ • My Courses                   │ Quick Stats:                │
│ • Doubts                       │ ┌──────────┐ ┌──────────┐  │
│ • Certifications               │ │ 5        │ │ 35%      │  │
│ • Performance Analytics        │ │ Courses  │ │ Avg Prog│  │
│ • Settings                     │ └──────────┘ └──────────┘  │
│                                │ ┌──────────┐ ┌──────────┐  │
│                                │ │ 2        │ │ 8        │  │
│                                │ │ Completed│ │ Unresolved│ │
│                                │ │ Courses  │ │ Doubts  │  │
│                                │ └──────────┘ └──────────┘  │
│                                │                             │
│                                │ Recent Courses:             │
│                                │ • Advanced DSA (45%)        │
│                                │ • System Design (20%)       │
│                                │ • DBMS (30%)               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Explore & Enroll in Courses
**URL:** `http://localhost:5173/courses`

```
┌─────────────────────────────────────────────────────────────┐
│ Explore Courses                                              │
├─────────────────────────────────────────────────────────────┤
│ Filters:                                                     │
│ [Search Courses...]  [Level ▼]  [Category ▼]  [Duration ▼] │
├─────────────────────────────────────────────────────────────┤
│ Available Courses:                                           │
│                                                              │
│ ┌──────────────────────┐ ┌──────────────────────┐           │
│ │ Advanced DSA         │ │ System Design Master │           │
│ │ ┌────────────────┐   │ │ ┌────────────────┐   │           │
│ │ │ [Thumbnail]    │   │ │ │ [Thumbnail]    │   │           │
│ │ └────────────────┘   │ │ └────────────────┘   │           │
│ │ Long description...  │ │ Long description...  │           │
│ │ ★ 4.9 • 12.5K       │ │ ★ 4.8 • 8.9K        │           │
│ │ Duration: 40h        │ │ Duration: 35h        │           │
│ │ Modules: 12          │ │ Modules: 10          │           │
│ │ [View Course]        │ │ [View Course]        │           │
│ └──────────────────────┘ └──────────────────────┘           │
│                                                              │
│ ┌──────────────────────┐ ┌──────────────────────┐           │
│ │ DBMS Fundamentals    │ │ Web Development 101  │           │
│ │ ┌────────────────┐   │ │ ┌────────────────┐   │           │
│ │ │ [Thumbnail]    │   │ │ │ [Thumbnail]    │   │           │
│ │ └────────────────┘   │ │ └────────────────┘   │           │
│ │ Long description...  │ │ Long description...  │           │
│ │ ★ 4.7 • 6.2K        │ │ ★ 4.6 • 5.3K        │           │
│ │ Duration: 30h        │ │ Duration: 25h        │           │
│ │ Modules: 8           │ │ Modules: 6           │           │
│ │ [View Course]        │ │ [View Course]        │           │
│ └──────────────────────┘ └──────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 4. Course Detail Page
**URL:** `http://localhost:5173/courses/1`

```
┌─────────────────────────────────────────────────────────────┐
│ Advanced Data Structures & Algorithms                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ★ 4.9 • 12.5K students • ⏱️ 40 hours • 📚 12 modules      │
│ By Prof. Alice Johnson                                      │
│                                                              │
│ [Enroll Now]  [Continue Learning]                          │
│                                                              │
│ ┌──────────────────────────────────────────┐                │
│ │ What you'll learn:                       │                │
│ │ ✓ Master Array & Linked List operations │                │
│ │ ✓ Tree & Graph algorithms                │                │
│ │ ✓ Dynamic Programming techniques         │                │
│ │ ✓ Sorting & Searching optimization      │                │
│ └──────────────────────────────────────────┘                │
│                                                              │
│ ┌──────────────────────────────────────────┐                │
│ │ Course Modules (12 total):               │                │
│ │ ① Introduction - 2 mins                  │                │
│ │ ② Arrays & Complexity - 45 mins          │                │
│ │ ③ Linked Lists - 50 mins                 │                │
│ │ ... (9 more modules)                     │                │
│ │ ⑫ Final Project & Exam Prep - 60 mins   │                │
│ └──────────────────────────────────────────┘                │
│                                                              │
│ ┌──────────────────────────────────────────┐                │
│ │ Prerequisites:                           │                │
│ │ • C++ Fundamentals (or similar)         │                │
│ │ • Basic Math knowledge                   │                │
│ └──────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 5. Video Learning Module
**URL:** `http://localhost:5173/learn/1/1`

```
┌─────────────────────────────────────────────────────────────┐
│ Advanced DSA > Module 2: Arrays & Complexity               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────┐                 │
│ │                                        │  📋 Modules:    │
│ │  [Video Player with controls]          │  ① Introduction │
│ │  ▶️ [===== 45% =======>  ]  12:34/28m │  ② Arrays       │
│ │                                        │  ③ Complexity   │
│ │  Video: Arrays & Complexity            │  ➜ 12 total    │
│ │  Duration: 28 minutes                  │                 │
│ │                                        │                 │
│ │  [🔊 Volume] [⚡ Speed 1x] [⛶ Full]  │                 │
│ └────────────────────────────────────────┘                 │
│                                                              │
│ Next: [Mark as Complete] [Ask Question in Chat]           │
│                                                              │
│ ┌────────────────────────────────────────┐                 │
│ │ 💬 Learning Assistant Chat             │                 │
│ │ ┌──────────────────────────────────┐   │                 │
│ │ │ Bot: How can I help explain      │   │                 │
│ │ │ this concept?                    │   │                 │
│ │ │                                  │   │                 │
│ │ │ You: Explain array time          │   │                 │
│ │ │ complexity                       │   │                 │
│ │ │                                  │   │                 │
│ │ │ Bot: Array access is O(1)...     │   │                 │
│ │ └──────────────────────────────────┘   │                 │
│ │                                        │                 │
│ │ [QuestionBox: Ask anything...]        │                 │
│ │📚 Suggest: Explain like 5-yo          │                 │
│ │📚 Suggest: Generate Practice Qs       │                 │
│ │📚 Suggest: Summarize Key Points       │                 │
│ └────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### 6. My Courses Page
**URL:** `http://localhost:5173/my-courses`

```
┌─────────────────────────────────────────────────────────────┐
│ My Courses - Continue your learning journey                 │
├─────────────────────────────────────────────────────────────┤
│ Enrolled Courses (5):                                       │
│                                                              │
│ ┌──────────────────────────┐                                │
│ │ Advanced DSA             │  Progress Bar: ████░░░░░ 45%   │
│ │ Status: In Progress      │  [Continue Learning]           │
│ └──────────────────────────┘                                │
│                                                              │
│ ┌──────────────────────────┐                                │
│ │ System Design Masterclass│  Progress Bar: ████░░░░░ 20%   │
│ │ Status: In Progress      │  [Continue Learning]           │
│ └──────────────────────────┘                                │
│                                                              │
│ ┌──────────────────────────┐                                │
│ │ DBMS Fundamentals        │  Progress Bar: █████████ 100%  │
│ │ Status: Completed        │  [View Certificate]            │
│ └──────────────────────────┘                                │
│                                                              │
│           ║                                                  │
│           ║  SkillBot AI Assistant                          │
│           ║                                                  │
│           ║  ┌──────────────────────────┐                  │
│           ║  │ Ask me about course      │                  │
│           ║  │ content!                 │                  │
│           ║  │                          │                  │
│           ║  │ Bot: How can I help?     │                  │
│           ║  │                          │                  │
│           ║  │ You: [Input box]      📤 │                  │
│           ║  └──────────────────────────┘                  │
│           ║                                                  │
│           ║  📚 Explain like I'm 5                          │
│           ║  📚 Generate practice questions                 │
│           ║  📚 Summarize the key concepts                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Instructor Journey

### 1. Instructor Dashboard
**URL:** `http://localhost:5173/instructor/dashboard`

```
⚠️ Login as: instructor@skillforge.com / instructor123

┌─────────────────────────────────────────────────────────────┐
│ Instructor Dashboard                                         │
├─────────────────────────────────────────────────────────────┤
│ Navigation:                                                  │
│ • Dashboard (Current)     │  Quick Stats:                    │
│ • My Courses              │  ┌──────────────────────┐       │
│ • Student Doubts & Queries│  │ 3 Assigned Courses   │       │
│ • Settings                │  │ 156 Enrolled Students│       │
│                           │  │ 23 Unresolved Doubts│       │
│                           │  │ 4.8/5.0 Avg Rating  │       │
│                           │  └──────────────────────┘       │
│                           │                                  │
│                           │ Teaching Impact:                 │
│                           │ • 1,250 course completions      │
│                           │ • 89% avg student satisfaction  │
│                           │ • 156 active learners          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Instructor Course Management
**URL:** `http://localhost:5173/instructor/courses`

```
┌─────────────────────────────────────────────────────────────┐
│ Assigned Course Management                                  │
├─────────────────────────────────────────────────────────────┤
│ My Courses (3):                                              │
│                                                              │
│ ┌──────────────────────────────────────┐                    │
│ │ Advanced DSA                          │                    │
│ │                                       │                    │
│ │ Description: Master data structures...│                    │
│ │ Status: [PUBLISHED ▼]                 │                    │
│ │ Category: Data Structures             │                    │
│ │ Level: Advanced                       │                    │
│ │ Duration: 40 hours                    │                    │
│ │ Tags: DSA, Algorithms, Interview      │                    │
│ │                                       │                    │
│ │ [Edit Course]                        │                    │
│ └──────────────────────────────────────┘                    │
│                                                              │
│ ┌──────────────────────────────────────┐                    │
│ │ System Design Masterclass             │                    │
│ │                                       │                    │
│ │ Description: Design scalable systems..│                    │
│ │ Status: [PUBLISHED ▼]                 │                    │
│ │ Category: System Design               │                    │
│ │ Level: Advanced                       │                    │
│ │ Duration: 35 hours                    │                    │
│ │ Tags: SystemDesign, Architecture      │                    │
│ │                                       │                    │
│ │ [Edit Course]                        │                    │
│ └──────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### 3. Instructor Doubt Resolution
**URL:** `http://localhost:5173/instructor/doubts`

```
┌─────────────────────────────────────────────────────────────┐
│ Doubts & Queries - Review and resolve student doubts        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────┐                    │
│ │ How to optimize DFS traversal?        │                    │
│ │                                       │                    │
│ │ Student: John D. • Course: Advanced DSA│                   │
│ │                                       │                    │
│ │ "I'm trying to implement DFS with     │                    │
│ │ memoization but getting TLE on test   │                    │
│ │ case 5. My approach uses nested loops │                    │
│ │ but should be O(n)..."                │                    │
│ │                                       │                    │
│ │ Status: OPEN                          │                    │
│ │                                       │                    │
│ │ [Reply Box:                          │                    │
│ │  "Good observation. The issue is...   │                    │
│ │   Try using a hash table instead..."] │                    │
│ │ [Send Reply]                          │                    │
│ └──────────────────────────────────────┘                    │
│                                                              │
│ ┌──────────────────────────────────────┐                    │
│ │ What's the difference between BFS...? │                    │
│ │                                       │                    │
│ │ Student: Alice M. • Course: Adv DSA  │                    │
│ │                                       │                    │
│ │ "I understand DFS, but when should    │                    │
│ │ we use BFS instead?"                  │                    │
│ │                                       │                    │
│ │ Status: RESOLVED                      │                    │
│ │ Reply: "BFS is great for shortest path│                    │
│ │ problems. DFS is better for..."       │                    │
│ └──────────────────────────────────────┘                    │
│                                                              │
│ [More doubts...]                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Super Admin Dashboard

### 1. Admin Dashboard Home
**URL:** `http://localhost:5173/admin/dashboard`

⚠️ Login as: `admin@skillforge.com / admin123`

```
┌─────────────────────────────────────────────────────────────┐
│ Super Admin Dashboard - Platform-wide overview              │
├─────────────────────────────────────────────────────────────┤
│ Admin Navigation:                                            │
│ • Dashboard (Current)    │  ┌──────────────────────────────┐ │
│ • User & Instructor Mgmt │  │ TOTAL USERS      │ 245       │ │
│ • Course Management      │  ├──────────────────────────────┤ │
│ • Doubts Management      │  │ STUDENTS         │ 180       │ │
│ • Settings               │  ├──────────────────────────────┤ │
│                          │  │ COURSE ADMINS    │ 15        │ │
│                          │  ├──────────────────────────────┤ │
│                          │  │ COURSES          │ 48        │ │
│                          │  ├──────────────────────────────┤ │
│                          │  │ PUBLISHED        │ 42        │ │
│                          │  ├──────────────────────────────┤ │
│                          │  │ DRAFT            │ 6         │ │
│                          │  ├──────────────────────────────┤ │
│                          │  │ ENROLLMENTS      │ 1,250     │ │
│                          │  ├──────────────────────────────┤ │
│                          │  │ UNRESOLVED DOUBTS│ 23        │ │
│                          │  └──────────────────────────────┘ │
│                          │                                    │
│                          │  Action Items:                     │
│                          │  • 23 pending doubt replies       │
│                          │  • 6 course drafts need review    │
│                          │  • 2 user activation requests     │
└─────────────────────────────────────────────────────────────┘
```

---

## NEW FEATURE: Instructor Creation

### 2. User & Instructor Management
**URL:** `http://localhost:5173/admin/users`

```
┌─────────────────────────────────────────────────────────────┐
│ User & Instructor Management                                │
│ Create instructors, assign courses, and manage users        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ 🔵 CREATE NEW INSTRUCTOR (COURSE ADMIN) ──────────────┐ │
│ │                                                          │ │
│ │  Instructor Name:                                        │ │
│ │  [John Doe            ]                                  │ │
│ │                                                          │ │
│ │  Email Address:                                          │ │
│ │  [john.doe@skillforge.com]                              │ │
│ │                                                          │ │
│ │                      [Create Instructor]               │ │
│ │                                                          │ │
│ │  💡 Password will be auto-generated and displayed      │ │
│ │     below. Share it securely with the instructor.      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ 🟢 INSTRUCTOR CREATED SUCCESSFULLY ──────────────────┐ │
│ │                                                          │ │
│ │  ✓ John Doe successfully created!                       │ │
│ │                                                          │ │
│ │  ┌──────────────────────────────────────────────────┐  │ │
│ │  │ Name:          John Doe                          │  │ │
│ │  │                                                   │  │ │
│ │  │ Email (Login ID):                                │  │ │
│ │  │ [john.doe@skillforge.com    ] [📋 Copy] [✓]   │  │ │
│ │  │                                                   │  │ │
│ │  │ Temporary Password:                              │  │ │
│ │  │ [••••••••••••  ] [👁️ Show] [📋 Copy] [✓]     │  │ │
│ │  │                                                   │  │ │
│ │  │ >>> When shown: kM9#xA2$bN7wQ                   │  │ │
│ │  └──────────────────────────────────────────────────┘  │ │
│ │                                                          │ │
│ │  📋 Next Steps:                                          │ │
│ │  ✓ Share these credentials securely with the instructor│ │
│ │  ✓ Instructor logs in with email: john.doe...          │ │
│ │  ✓ Instructor should change password on first login    │ │
│ │  ✓ Assign courses to this instructor below             │ │
│ │                                                          │ │
│ │                       [Close]                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ 🟣 ASSIGN COURSE TO INSTRUCTOR ──────────────────────┐ │
│ │                                                          │ │
│ │  Instructor User ID:                                    │ │
│ │  [2                ]                                    │ │
│ │                                                          │ │
│ │  Course ID:                                              │ │
│ │  [1                ]                                    │ │
│ │                                                          │ │
│ │                      [Assign Course]                   │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ ALL USERS IN SYSTEM ──────────────────────────────────┐ │
│ │                                                          │ │
│ │  John Doe                   ID: 1                       │ │
│ │  john@skillforge.com        👑 Super Admin             │ │
│ │                                                          │ │
│ │  John Doe (Instructor)      ID: 2                       │ │
│ │  john.doe@skillforge.com    👨‍🏫 Instructor               │ │
│ │                                                          │ │
│ │  Alice Johnson              ID: 3                       │ │
│ │  alice.j@skillforge.com     👨‍🏫 Instructor               │ │
│ │                                                          │ │
│ │  Bob Smith                  ID: 4                       │ │
│ │  bob@skillforge.com         👤 Student                 │ │
│ │                                                          │ │
│ │  Carol Davis                ID: 5                       │ │
│ │  carol@skillforge.com       👤 Student                 │ │
│ │                                                          │ │
│ │  [More users... (scrollable list)]                     │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Instructor Creation Workflow:

```
Step 1: Super Admin navigates to /admin/users
        ↓
Step 2: Fills out instructor creation form
        • Name: "Alice Johnson"
        • Email: "alice.johnson@skillforge.com"
        ↓
Step 3: Clicks "Create Instructor" button
        ↓
Step 4: Backend generates 12-character password (AWS-style)
        Example: kM9#xA2$bN7wQ
        • Has uppercase: M, A, Q
        • Has lowercase: k, x, w
        • Has numbers: 9, 2, 7
        • Has special: #, $
        ↓
Step 5: Creates COURSE_ADMIN user in database with:
        • Name: Alice Johnson
        • Email: alice.johnson@skillforge.com
        • Password: BCrypt hashed version of kM9#xA2$bN7wQ
        • Role: COURSE_ADMIN
        ↓
Step 6: Returns response with credentials:
        {
          "userId": 3,
          "name": "Alice Johnson",
          "email": "alice.johnson@skillforge.com",
          "generatedPassword": "kM9#xA2$bN7wQ",
          "message": "Instructor created successfully"
        }
        ↓
Step 7: Frontend displays green "Created Successfully" card
        • Shows email with copy button
        • Shows password with show/hide toggle
        • Shows copy button for password
        • Displays next steps instructions
        ↓
Step 8: Admin copies credentials and shares securely
        ↓
Step 9: Admin assigns courses using "Assign Course" form
        • User ID: 3
        • Course ID: 1 (Advanced DSA)
        ↓
Step 10: Instructor logs in with:
         • Email: alice.johnson@skillforge.com
         • Password: kM9#xA2$bN7wQ
         ↓
Step 11: Redirects to /instructor/dashboard
         • Change password on first login
         • Manage assigned courses
         • View student doubts
```

---

## Student Doubts System

### Student Perspective
**URL:** `http://localhost:5173/doubts`

```
┌─────────────────────────────────────────────────────────────┐
│ My Doubts & Queries                                          │
│ Submit course doubts and track replies from admins          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ SUBMIT A NEW DOUBT ──────────────────────────────────┐  │
│ │                                                          │  │
│ │  Course ID:          │  Module (optional):              │  │
│ │  [1          ]       │  [mod_1       ]                  │  │
│ │                                                          │  │
│ │  Title:                                                 │  │
│ │  [Short summary of your doubt      ]                   │  │
│ │                                                          │  │
│ │  Description:                                            │  │
│ │  ┌─────────────────────────────────────────────────┐   │  │
│ │  │ Describe the issue clearly, including what you  │   │  │
│ │  │ tried                                            │   │  │
│ │  └─────────────────────────────────────────────────┘   │  │
│ │                                                          │  │
│ │  [Submit Doubt]                                         │  │
│ │                                                          │  │
│ │  Available Course IDs: 1, 2, 3, 4, 5, 6, 7, 8, 9, ... │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ MY SUBMITTED DOUBTS ─────────────────────────────────┐  │
│ │                                                          │  │
│ │  ┌────────────────────────────────────────────┐          │  │
│ │  │ How to optimize recursive DFS?  │ OPEN    │         │  │
│ │  │ Course: Advanced DSA                       │         │  │
│ │  │ "I wrote a recursive function but it's     │         │  │
│ │  │ getting Stack Overflow on test case 10.    │         │  │
│ │  │ How can I optimize this?"                  │         │  │
│ │  │                                            │         │  │
│ │  │ ⏳ Pending admin response                   │         │  │
│ │  └────────────────────────────────────────────┘         │  │
│ │                                                          │  │
│ │  ┌────────────────────────────────────────────┐         │  │
│ │  │ What's the time complexity? │ RESOLVED    │         │  │
│ │  │ Course: Advanced DSA                       │         │  │
│ │  │ "Is binary search O(log n) or O(n)?"      │         │  │
│ │  │                                            │         │  │
│ │  │ 💬 Admin Reply: "Binary search is O(log n)"          │  │
│ │  │    on a sorted array. Check if your array..."        │  │
│ │  └────────────────────────────────────────────┘         │  │
│ │                                                          │  │
│ │  ┌────────────────────────────────────────────┐         │  │
│ │  │ How to handle null pointers? │ OPEN        │         │  │
│ │  │ Course: System Design                      │         │  │
│ │  │ "Getting NullPointerException when..."     │         │  │
│ │  │                                            │         │  │
│ │  │ ⏳ Pending admin response                   │         │  │
│ │  └────────────────────────────────────────────┘         │  │
│                                                              │
│ [Scroll to see more doubts...]                             │
└─────────────────────────────────────────────────────────────┘
```

### Admin/Instructor Perspective
**URL:** `http://localhost:5173/admin/doubts` or `/instructor/doubts`

```
┌─────────────────────────────────────────────────────────────┐
│ Doubts & Queries - Review and resolve student doubts        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ How to optimize recursive DFS?                       │   │
│ │                                                      │   │
│ │ Student: John • Course: Advanced DSA                │   │
│ │                                                      │   │
│ │ "I wrote a recursive function but it's getting      │   │
│ │  Stack Overflow on test case 10. I tried tail call │   │
│ │  optimization but Java doesn't support it natively." │   │
│ │                                                      │   │
│ │ Status: OPEN                                        │   │
│ │                                                      │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Type your reply here...                         │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │ [Reply]                                             │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ What's the time complexity of binary search?         │   │
│ │                                                      │   │
│ │ Student: Alice • Course: Advanced DSA               │   │
│ │                                                      │   │
│ │ "Is it O(log n) or O(n log n)? I'm confused."     │   │
│ │                                                      │   │
│ │ Status: RESOLVED                                    │   │
│ │                                                      │   │
│ │ 💬 Admin Reply: "Binary search has O(log n) time   │   │
│ │    complexity on a sorted array. If the array      │   │
│ │    isn't sorted, sorting first would be O(n log n)." │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Help! Getting null pointer exception                 │   │
│ │                                                      │   │
│ │ Student: Bob • Course: System Design                │   │
│ │                                                      │   │
│ │ "When I try to access node.next in my implementation│   │
│ │  of linked list, I get NullPointerException..."      │   │
│ │                                                      │   │
│ │ Status: OPEN                                        │   │
│ │                                                      │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Type your reply here...                         │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │ [Reply]                                             │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ [Load more doubts...]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Course Management (Admin)

### 3. Course Management
**URL:** `http://localhost:5173/admin/courses`

```
┌─────────────────────────────────────────────────────────────┐
│ All Course Management                                        │
│ Manage metadata, status, and learning structure             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────┐ ┌────────────────────────────┐│
│ │ Advanced DSA               │ │ System Design Masterclass  ││
│ │                            │ │                            ││
│ │ Description: Master data   │ │ Description: Design        ││
│ │ structures and algorithms. │ │ scalable systems...        ││
│ │                            │ │                            ││
│ │ Status: PUBLISHED          │ │ Status: PUBLISHED          ││
│ │ Category: DSA              │ │ Category: SystemDesign     ││
│ │ Level: Advanced            │ │ Level: Advanced            ││
│ │ Rating: 4.9 ⭐             │ │ Rating: 4.8 ⭐             ││
│ │                            │ │                            ││
│ │ [Edit Course]              │ │ [Edit Course]              ││
│ └────────────────────────────┘ └────────────────────────────┘│
│                                                              │
│ When Editing:                                               │
│ ────────────────────────────────────────────────────────    │
│ Title: [Advanced DSA                                      ] │
│ Status: [PUBLISHED / DRAFT / ARCHIVED]                     │
│ Description: [Long description...                         ] │
│ Category: [DSA]                                            │
│ Level: [Beginner / Intermediate / Advanced]               │
│ Duration (hours): [40]                                     │
│ Thumbnail URL: [https://...image.jpg]                      │
│ Tags (comma separated): [DSA, Algorithms, Interview]       │
│                                                              │
│ [Save]  [Cancel]                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: User Roles & Their Capabilities

### 👤 STUDENT
- ✅ View all courses
- ✅ Enroll in courses
- ✅ Watch learning modules with AI chat assistance
- ✅ Take proctored exams
- ✅ Track progress and analytics
- ✅ Submit doubts/queries
- ✅ View replies from admin/instructor
- ❌ Cannot create courses (admin only)
- ❌ Cannot manage users (admin only)

### 👨‍🏫 INSTRUCTOR (Course Admin)
- ✅ View assigned courses
- ✅ Edit course metadata (title, description, status, etc.)
- ✅ View student doubts for their courses
- ✅ Reply to student doubts
- ✅ View student enrollments & progress
- ❌ Cannot create new courses (super admin only)
- ❌ Cannot create/manage instructors (super admin only)
- ❌ Cannot see all courses (only assigned ones)

### 👑 SUPER ADMIN
- ✅ View all users
- ✅ **CREATE new instructors with auto-generated passwords** ← NEW!
- ✅ Assign courses to instructors
- ✅ Manage all courses
- ✅ View all student doubts
- ✅ Reply to doubts
- ✅ View system statistics
- ✅ Manage platform content and settings

---

## API Endpoints Summary

```
┌──────────────────────────────────────────────────────────────┐
│ Authentication                                                │
├──────────────────────────────────────────────────────────────┤
│ POST   /api/auth/login              Login user               │
│ POST   /api/auth/register           Register new user        │
│ POST   /api/auth/oauth-login        OAuth2 integration       │
│ POST   /api/auth/logout             Logout user              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Courses                                                       │
├──────────────────────────────────────────────────────────────┤
│ GET    /api/courses                 Get all courses          │
│ GET    /api/courses/:id             Get course details       │
│ POST   /api/courses                 Create course (admin)    │
│ PUT    /api/courses/:id             Update course (admin)    │
│ DELETE /api/courses/:id             Delete course (admin)    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Admin - NEW INSTRUCTOR CREATION                              │
├──────────────────────────────────────────────────────────────┤
│ POST   /api/admin/create-instructor Create instructor ✨    │
│        Request:  { name, email }                            │
│        Response: { userId, name, email,                     │
│                   generatedPassword, message }              │
│                                                              │
│ GET    /api/admin/users             Get all users            │
│ POST   /api/admin/assign-course     Assign course to instr.  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Doubts Management                                             │
├──────────────────────────────────────────────────────────────┤
│ GET    /api/doubts/mine             Get student's doubts     │
│ POST   /api/doubts/submit           Submit a doubt           │
│ GET    /api/admin/doubts            Get all doubts (admin)   │
│ POST   /api/admin/doubts/:id/reply  Reply to doubt (admin)   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Enrollments & Progress                                        │
├──────────────────────────────────────────────────────────────┤
│ GET    /api/enrollments             Get user enrollments     │
│ POST   /api/enrollments             Enroll in course         │
│ PUT    /api/progress/modules/:id    Mark module complete     │
│ GET    /api/progress/summary        Get progress stats       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Analytics & Certifications                                    │
├──────────────────────────────────────────────────────────────┤
│ GET    /api/performance             Get analytics            │
│ GET    /api/certifications          Get student certs        │
│ POST   /api/quiz/attempt            Submit quiz              │
│ GET    /api/quiz/result             Get quiz results         │
└──────────────────────────────────────────────────────────────┘
```

---

## Test Accounts

```
Super Admin:
  Email:    admin@skillforge.com
  Password: admin123
  URL:      http://localhost:5173/login → /admin/dashboard

Instructor:
  Email:    instructor@skillforge.com
  Password: instructor123
  URL:      http://localhost:5173/login → /instructor/dashboard

Student:
  Email:    student@skillforge.com
  Password: student123
  URL:      http://localhost:5173/login → /dashboard
```

---

## Key Features

### 🎓 Student Learning Experience
- Browse 100+ curated computer science courses
- Video-based learning modules with AI chatbot
- Interactive learning with concept explanations
- Performance tracking and analytics
- Proctored exams with security features
- Instant certificates upon completion

### 👨‍🏼‍🏫 Instructor Course Management
- Manage assigned courses and metadata
- Track enrolled students and their progress
- Review and respond to student doubts
- Edit course content and structure
- Monitor course ratings and feedback

### 🛠️ Admin Control (NEW)
- **Create instructors with auto-generated passwords** ← NEW!
- Assign courses to instructors
- Monitor platform statistics
- View and respond to all student doubts
- Manage user accounts and roles
- Full course library management

---

## Architecture Overview

```
Frontend (React + TypeScript + Vite)
├── Student Dashboard & Learning
├── Instructor Dashboard & Doubts
├── Admin Dashboard & User Management
│   ├── Create Instructor (NEW)
│   ├── Assign Courses
│   └── Manage Doubts
└── Authentication (JWT + OAuth2)
        ↓
Backend (Spring Boot + Java)
├── User Service & Authentication
├── Admin Service
│   ├── createInstructor() (NEW)
│   ├── generateSecurePassword() (NEW)
│   └── assignCourseAdmin()
├── Course Service
├── Doubt Service
├── Progress & Analytics Service
└── Database (H2/PostgreSQL)
        ↓
Database
├── Users (roles: STUDENT, COURSE_ADMIN, SUPER_ADMIN)
├── Courses
├── Enrollments
├── Module Progress
├── Doubts & Replies
├── Quiz Attempts
└── Certifications
```

---

Generated: March 13, 2026 | SkillForge LMS v1.0
