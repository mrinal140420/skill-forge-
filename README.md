# SkillForge — AI-Powered Learning Management System

> A production-ready LMS for Computer Science Engineering students featuring AI tutoring, ML-powered recommendations, proctored exams, progress tracking, and certificate generation.

![Java](https://img.shields.io/badge/Java-21-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-green) ![React](https://img.shields.io/badge/React-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone & Setup](#clone--setup)
  - [Backend (Spring Boot)](#1-backend-spring-boot)
  - [Frontend (React)](#2-frontend-react)
  - [ML Service (Python)](#3-ml-service-python)
- [Environment Variables](#environment-variables)
- [OAuth2 Setup (Google & GitHub)](#oauth2-setup-google--github)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Docker Deployment](#docker-deployment)
  - [Quick Start: Production (Docker Compose)](#quick-start-production-docker-compose)
- [Production Deployment](#production-deployment)
- [Test Credentials](#test-credentials)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

**SkillForge** is a full-stack learning platform designed for CSE students, offering 18+ courses across core domains — DSA, DBMS, OS, Computer Networks, OOP, System Design, AI/ML, and Cybersecurity. Beyond the original module-based curriculum, the platform now supports instructor-managed topic and lesson publishing, structured study resources, backend-generated exams, AI proctoring, and course-level progress gating.

**Key highlights:**

- **SkillBot AI Tutor** — 26+ concept explanations with chat history and feedback
- **ML Recommendations** — Personalized course suggestions based on quiz performance and learning gaps
- **AI-Generated Exams** — Course exams can be generated and persisted per course from backend content using Gemini with fallback question generation
- **AI-Proctored Exams** — Face detection, motion analysis, fullscreen enforcement, keyboard blocking, tab-switch detection, object/head-movement warnings, and auto-fail on repeated violations
- **Instructor Content Builder** — Topic, lesson, and resource management for videos, notes, PDFs, links, images, and code-based study material
- **Learning-to-Exam Flow** — Exam access can be gated behind course progress and completion flow instead of static client-only quizzes
- **Progress Analytics** — Per-module tracking, streaks, badges (Quick Learner, 7-Day Streak, Quiz Master, Night Owl)
- **OAuth2 Login** — Google and GitHub social authentication alongside JWT email/password auth
- **Certificate Generation** — On course completion

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│                 │     │                      │     │                 │
│   React 18 +    │────▶│   Spring Boot 3.3    │────▶│  FastAPI ML     │
│   TypeScript    │     │   Java 21            │     │  Python 3.9+    │
│   Port 5173     │     │   Port 8081          │     │  Port 8000      │
│                 │     │                      │     │                 │
└─────────────────┘     └──────────┬───────────┘     └─────────────────┘
                                   │
                        ┌──────────▼───────────┐
                        │   H2 (dev, file)     │
                        │   PostgreSQL (prod)  │
                        └──────────────────────┘
```

- **Frontend → Backend**: Axios HTTP calls with JWT Bearer tokens
- **Backend → ML Service**: RestTemplate server-to-server calls
- **Backend → Database**: Spring Data JPA / Hibernate ORM
- **OAuth2 Flow**: Browser → Spring Security OAuth2 → Google/GitHub → JWT redirect to frontend

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Java 21, Spring Boot 3.3.0, Spring Security (JWT HS512 + OAuth2), Spring Data JPA, Hibernate, JJWT 0.12.3, SpringDoc OpenAPI 2.3, BCrypt, HikariCP, Gson, H2 / PostgreSQL |
| **Frontend** | React 18, TypeScript (strict), Vite 5.4, Tailwind CSS, shadcn/ui, Zustand (state), TanStack Query (server state), React Router v6, Axios, Lucide Icons, React Hook Form + Zod |
| **ML Service** | Python 3.9+, FastAPI, NumPy 1.24, Scikit-learn 1.3, Pydantic 2.5 |
| **DevOps** | Docker, Docker Compose, Maven 3.9+, GitHub Actions |

---

## Features

### Student Features
| Feature | Description |
|---------|-------------|
| JWT + OAuth2 Auth | Email/password registration + Google/GitHub social login |
| 18+ CSE Courses | DSA, DBMS, OS, CN, OOP, System Design, AI/ML, Cybersecurity |
| Course Curriculum | **[NEW]** Topic-based lesson structure with topic-wise study materials (videos, notes, images, PDFs, code snippets) |
| 5 Modules per Course | YouTube videos, transcripts, quizzes per module |
| Instructor-Published Course Content | Students see live topics and lessons created by instructors instead of static placeholder modules |
| SkillBot AI Tutor | Chat-based concept explanations with feedback loop |
| AI-Generated Exams | Backend-generated per-course exam papers based on course content, with persisted exam definitions and fallback generation |
| Proctored Exams | AI face/movement detection, keyboard blocking, tab-switch detection, fullscreen enforcement, and violation tracking |
| Exam Review & Results | Rich results view with score ring, answer review, explanations, and per-question correctness feedback |
| Course Completion Gating | Learning flow can require progress before students attempt the final exam |
| ML Recommendations | Weighted algorithm: weakness (45%) + engagement (25%) + gap (20%) + popularity (10%) |
| Progress Tracking | Module completion, streaks, time-based analytics |
| Badges & Certificates | Quick Learner, 7-Day Streak, Quiz Master, Night Owl |
| Performance Analytics | Radar charts, topic-wise scores, 7-day improvement plans |

### Admin Features
- User management, course CRUD, **course content management (topics, lessons, resources)**
- Course-level exam generation and regeneration for instructor-authored content
- Super Admin and Course Admin role-based dashboards
- Analytics dashboard, role-based access control, instructor assignment workflows

### Security
- BCrypt password hashing (10 rounds)
- JWT HS512 tokens (7-day expiry)
- Rate limiting on auth endpoints
- CORS configuration
- Exam anti-cheat: blocks Ctrl+C/V/X/A/S/P, ESC, F12, PrintScreen, right-click, tab-switch, window blur, and repeated proctoring violations

---

## Project Structure

```
skill-forge-master/
├── backend-spring/                  # Spring Boot 3.3.0 backend
│   ├── src/main/java/com/skillforge/
│   │   ├── config/                  # SecurityConfiguration, OpenAPI
│   │   ├── controller/              # REST controllers (Auth, Course, Enrollment, Progress, Quiz, Recommendation, SkillBot, Content, Exams, Admin)
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── entity/                  # JPA entities (User, Course, Enrollment, Progress, QuizAttempt, Topic, Lesson, LessonResource, CourseAdminAssignment)
│   │   ├── repository/              # Spring Data JPA repositories
│   │   ├── security/                # JWT filter, OAuth2 handler, auth manager
│   │   ├── service/                 # Business logic layer
│   │   └── seed/                    # DataSeeder (auto-populates on first run)
│   ├── src/main/resources/
│   │   ├── application.yml          # Main config
│   │   ├── application-dev.yml      # Dev profile (H2 file-based DB)
│   │   └── application-prod.yml     # Prod profile (PostgreSQL)
│   ├── .env                         # OAuth2 credentials (not committed)
│   ├── pom.xml                      # Maven dependencies
│   └── mvnw / mvnw.cmd             # Maven wrapper
│
├── frontend/                        # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/                     # Axios client, API helpers
│   │   ├── components/              # Navbar, Sidebar, Footer, UI components
│   │   ├── context/                 # Auth context
│   │   ├── hooks/                   # Custom hooks (useApi, useFormState)
│   │   ├── lib/                     # Query client, utils
│   │   ├── pages/                   # 13+ pages (Dashboard, Courses, Exams, Analytics, etc.)
│   │   └── stores/                  # Zustand auth store
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── ml-service/                      # Python FastAPI ML service
│   ├── main.py                      # Recommendation & difficulty endpoints
│   └── requirements.txt             # Python dependencies
│
├── docker-compose.yml               # Docker Compose (default: Spring Boot + H2 + React + FastAPI)
├── docker-compose-spring.yml        # Optional Docker Compose (Spring Boot + PostgreSQL)
└── .gitignore
```

---

## Getting Started

### Development Paths

SkillForge supports two development approaches — choose based on your needs:

| Approach | Database | Setup Time | Best For | Consistency |
|----------|----------|-----------|----------|-------------|
| **Local Development** | H2 (file-based) | ~5 min | Quick iteration, debugging, learning | Dev-only, may differ from production |
| **Docker Compose (PostgreSQL)** | PostgreSQL | ~2 min | Team consistency, production-like testing, pre-deployment validation | Matches production environment exactly |

**Recommendation:** Use **Local Development** for rapid iteration during feature work. Use **Docker Compose** before commits/PRs to validate production behavior.

---

### Prerequisites

#### Local Development
| Tool | Version | Check Command |
|------|---------|---------------|
| **Java** | 21+ | `java -version` |
| **Maven** | 3.9+ (or use included `mvnw`) | `mvn -version` |
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |
| **Python** | 3.9+ | `python --version` |
| **Git** | Any | `git --version` |

#### Docker Compose
| Tool | Version |
|------|----------|
| **Docker** | 20.10+ |
| **Docker Compose** | 2.0+ |

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/skill-forge-master.git
cd skill-forge-master
```

---

### Choose Your Path

**🚀 Want to start quickly?**  
→ Jump to [**Local Development (1. Backend, 2. Frontend, 3. ML Service)**](#1-backend-spring-boot)

**🐳 Want production-like consistency from day one?**  
→ Jump to [**Quick Start: Production (Docker Compose)**](#quick-start-production-docker-compose)

---

### 1. Backend (Spring Boot)

```bash
cd backend-spring
```

#### Create the `.env` file (OAuth2 credentials)

Create `backend-spring/.env` with your OAuth credentials:

```dotenv
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

> See [OAuth2 Setup](#oauth2-setup-google--github) for how to obtain these.

#### Build & Run

```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

> **Note:** Always use `spring-boot:run` instead of `java -jar`. The repackaged JAR currently does not bundle `application.yml`, so `java -jar` will fail with missing config errors.

The backend starts on **http://localhost:8081** with:
- H2 file-based database (data persists across restarts at `backend-spring/data/skillforgedb.mv.db`)
- Auto-seeding: 1 super admin + 1 instructor + 8 students + 18 courses + enrollments on first run
- Swagger UI: **http://localhost:8081/swagger-ui.html**
- H2 Console: **http://localhost:8081/h2-console** (JDBC URL: `jdbc:h2:file:./data/skillforgedb`)

---

### 2. Frontend (React)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend starts on **http://localhost:5173**

> The Vite dev server proxies `/api` requests to `http://localhost:8081` automatically.

---

### 3. ML Service (Python)

Open a **new terminal**:

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the service
python -m uvicorn main:app --reload --port 8000
```

The ML service starts on **http://localhost:8000**

- Health check: **http://localhost:8000/health**
- API docs: **http://localhost:8000/docs**

---

### Quick Start Summary

| Service | Command | URL |
|---------|---------|-----|
| Backend | `cd backend-spring` then `.\mvnw.cmd spring-boot:run` | http://localhost:8081 |
| Frontend | `cd frontend && npm install && npm run dev` | http://localhost:5173 |
| ML Service | `cd ml-service && pip install -r requirements.txt && python -m uvicorn main:app --port 8000` | http://localhost:8000 |

All three services must be running for full functionality. The backend provides a fallback if the ML service is unavailable.

---

## Environment Variables

### Backend (`backend-spring/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | For OAuth | `your-google-client-id` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | For OAuth | `your-google-client-secret` | Google OAuth2 client secret |
| `GITHUB_CLIENT_ID` | For OAuth | `your-github-client-id` | GitHub OAuth2 client ID |
| `GITHUB_CLIENT_SECRET` | For OAuth | `your-github-client-secret` | GitHub OAuth2 client secret |

### Backend (`application.yml` — preconfigured, usually no changes needed)

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8081` | Backend HTTP port |
| `jwt.secret` | `dev-secret-key-...` | JWT signing key (change in production!) |
| `jwt.expiration` | `604800000` (7 days) | JWT token TTL in ms |
| `ml.base-url` | `http://localhost:8000` | ML service URL |
| `spring.datasource.url` | `jdbc:h2:file:./data/skillforgedb` | Database URL |

### Frontend (optional `.env` in `frontend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8081` | Backend API base URL |
| `VITE_APP_NAME` | `SkillForge` | App display name |

---

## OAuth2 Setup (Google & GitHub)

### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:8081/login/oauth2/code/google
   ```
7. Copy the **Client ID** and **Client Secret** to your `.env` file

### GitHub OAuth2

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Homepage URL**: `http://localhost:5173`
4. Set **Authorization callback URL**:
   ```
   http://localhost:8081/login/oauth2/code/github
   ```
5. Copy the **Client ID** and **Client Secret** to your `.env` file

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login, returns JWT |
| `GET` | `/api/auth/me` | JWT | Get current user profile |
| `PUT` | `/api/auth/me` | JWT | Update current user profile |
| `POST` | `/api/auth/change-password` | JWT | Change current user password |
| `GET` | `/oauth2/authorization/google` | No | Start Google OAuth flow |
| `GET` | `/oauth2/authorization/github` | No | Start GitHub OAuth flow |

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
→ 201 { "token": "eyJ...", "user": { "id": 1, "name": "...", "email": "...", "role": "STUDENT" } }
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
→ 200 { "token": "eyJ...", "user": { ... } }
```

### Courses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/courses` | No | List all courses (supports `?search=`, `?category=`, `?level=`, `?featured=true`) |
| `GET` | `/api/courses/{id}` | No | Get course details with modules |
| `POST` | `/api/courses` | Admin | Create course |

### Course Content

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/content/courses/{courseId}/topics` | JWT | Get published topic and lesson structure for a course |
| `POST` | `/api/content/courses/{courseId}/topics` | Course Admin / Super Admin | Create a topic for a course |

### Exams

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/exams/{courseId}` | JWT | Get the generated exam definition for a course |
| `POST` | `/api/exams/generate/{courseId}` | Course Admin / Super Admin | Generate or regenerate a persisted exam for a course |

### Enrollments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/enrollments` | JWT | Enroll in a course `{ "courseId": 1 }` |
| `GET` | `/api/enrollments/me` | JWT | List my enrollments |
| `GET` | `/api/enrollments/{id}` | JWT | Get enrollment details |

### Progress & Quizzes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/progress/complete` | JWT | Mark module complete `{ "courseId": 1, "moduleId": "mod_1" }` |
| `GET` | `/api/progress/me` | JWT | Get progress summary |
| `POST` | `/api/quiz/submit` | JWT | Submit quiz `{ "courseId": 1, "moduleId": "mod_1", "answers": [...], "timeTaken": 120 }` |

### Recommendations & SkillBot

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/recommendations/me` | JWT | ML-powered course recommendations |
| `POST` | `/api/skillbot/chat` | JWT | Chat with AI tutor |
| `GET` | `/api/skillbot/history` | JWT | Get chat history |
| `POST` | `/api/skillbot/feedback/{id}` | JWT | Submit feedback on a response |

### ML Service (internal, port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/recommend` | Generate recommendations |
| `POST` | `/difficulty` | Estimate course difficulty |
| `GET` | `/docs` | Swagger UI |

### Swagger UI

Full interactive API docs available at: **http://localhost:8081/swagger-ui.html**

Use the **Authorize** button with `Bearer <your-jwt-token>` to test authenticated endpoints.

---

## Database Schema

The application started with 5 core tables and now includes additional content-management tables for instructor-authored learning material.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ user_account │     │    course    │     │  enrollment  │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ name         │     │ title        │     │ user_id (FK) │
│ email (UQ)   │     │ slug         │     │ course_id(FK)│
│ password_hash│     │ category     │     │ status       │
│ role         │     │ level        │     │ enrolled_at  │
│ created_at   │     │ duration_hrs │     └──────────────┘
│ last_activity│     │ rating       │
│ updated_at   │     │ description  │     ┌──────────────┐
└──────────────┘     │ tags (JSON)  │     │   progress   │
                     │ syllabus     │     ├──────────────┤
                     │ (JSON)       │     │ id (PK)      │
                     │ prerequisites│     │ user_id (FK) │
                     │ (JSON)       │     │ course_id(FK)│
                     │ generated_   │     │ module_id    │
                     │ exam_json    │     │ completed    │
┌──────────────┐     └──────────────┘     │ completed_at │
│ quiz_attempt │                          └──────────────┘
├──────────────┤
│ id (PK)      │
│ user_id (FK) │
│ course_id(FK)│
│ module_id    │
│ score        │
│ time_taken   │
│ passed       │
│ created_at   │
└──────────────┘
```

- Additional content tables: `topic`, `lesson`, `lesson_resource`, and instructor assignment mappings
- **Roles**: `STUDENT`, `COURSE_ADMIN`, `SUPER_ADMIN`, `ADMIN` (legacy compatibility alias)
- **Enrollment unique constraint**: One enrollment per user per course
- **Quiz scoring**: Each correct answer = 10 points, pass threshold ≥ 60%
- **Generated exam storage**: Course-level generated exam definitions are persisted in the `course` table as JSON for reuse/regeneration
- **Dev DB**: H2 file-based at `backend-spring/data/skillforgedb.mv.db` (persists across restarts)
- **Prod DB**: PostgreSQL 16

---

## Docker Deployment

### Using Docker Compose (Default - Recommended)

```bash
docker compose up --build -d
```

This starts:
- **Spring Boot Backend** on port 8081
- **FastAPI ML Service** on port 8000
- **React Frontend** on port 5173

This default stack uses the same development profile as local runs, including file-based H2 persistence (Docker volume-backed) and seeded test users.

### Using Docker Compose (PostgreSQL Variant)

```bash
docker compose -f docker-compose-spring.yml up --build -d
```

### Quick Start: Production (Docker Compose)

**For a fresh deployment on new localhost:**

#### Step 1: Clone and configure OAuth credentials

```bash
git clone https://github.com/YOUR_USERNAME/skill-forge-master.git
cd skill-forge-master
```

Create `backend-spring/.env` with your OAuth credentials (see [OAuth2 Setup](#oauth2-setup-google--github)):

```dotenv
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Step 2: Start the stack

**With default password** (`skillforge_default_123`):
```bash
docker compose -f docker-compose-prod.yml up --build -d
```

**With custom DB password** (Windows PowerShell):
```powershell
$env:DB_PASSWORD="your-custom-password"
docker compose -f docker-compose-prod.yml up --build -d
```

**With custom DB password** (Linux/macOS):
```bash
DB_PASSWORD=your-custom-password docker compose -f docker-compose-prod.yml up --build -d
```

#### Step 3: Verify services are running

```bash
docker compose -f docker-compose-prod.yml ps
```

Expected output shows all services `Up`:
- `skillforge-backend` (port 8081)
- `skillforge-frontend` (port 5173)
- `skillforge-ml` (port 8000)
- `skillforge-postgres` (internal)
- `skillforge-mailhog` (port 8025)

#### Step 4: Access the application

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8081/swagger-ui.html
- **Mail UI**: http://localhost:8025

#### Step 5 (Optional): Migrate data from another machine

If you have data from another SkillForge instance, restore it:

```bash
# Copy backup dump file to ./backups/ folder, then restore:

# Windows PowerShell
$env:DB_DUMP_FILE="skillforge_prod_20260323_065700.dump"
docker compose -f docker-compose-prod.yml --profile tools run --rm db-restore

# Linux/macOS
DB_DUMP_FILE=skillforge_prod_20260323_065700.dump docker compose -f docker-compose-prod.yml --profile tools run --rm db-restore
```

#### Common Commands

```bash
# Start production stack
docker compose -f docker-compose-prod.yml up --build -d

# Stop all services
docker compose -f docker-compose-prod.yml down

# Check service status
docker compose -f docker-compose-prod.yml ps

# View logs
docker compose -f docker-compose-prod.yml logs -f backend
docker compose -f docker-compose-prod.yml logs -f frontend
docker compose -f docker-compose-prod.yml logs -f ml-service

# Create database backup
docker compose -f docker-compose-prod.yml --profile tools run --rm db-backup

# Restore database from backup
DB_DUMP_FILE=your_dump_file.dump docker compose -f docker-compose-prod.yml --profile tools run --rm db-restore

## Important: 
docker compose down stops containers but **preserves your database data** in the  postgres_prod_data volume.Data will still be there when you run up again. Use docker compose down -v only if you want to completely erase the database.
```

---

## Production Deployment

### Option 1: Manual VPS/Cloud Deployment

#### Backend
```bash
cd backend-spring

# Set environment variables first, then:
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

Set these environment variables for production:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/skillforge
SPRING_DATASOURCE_USERNAME=your-db-user
SPRING_DATASOURCE_PASSWORD=your-db-password
JWT_SECRET=your-production-secret-minimum-32-characters
ML_BASE_URL=http://your-ml-service:8000
GOOGLE_CLIENT_ID=your-prod-google-id
GOOGLE_CLIENT_SECRET=your-prod-google-secret
GITHUB_CLIENT_ID=your-prod-github-id
GITHUB_CLIENT_SECRET=your-prod-github-secret
```

#### Frontend
```bash
cd frontend
npm run build  # Outputs to dist/
# Serve dist/ with nginx, Apache, Vercel, Netlify, etc.
```

Update `VITE_API_URL` to your production backend URL before building.

#### ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Option 2: Vercel (Frontend) + Render (Backend & ML)

1. **Frontend on Vercel**: Import repo, set root to `frontend`, build command `npm run build`, output `dist`
2. **Backend on Render**: Web Service, root `backend-spring`, build `./mvnw clean package -DskipTests`, start `./mvnw spring-boot:run -Dspring-boot.run.profiles=prod`
3. **ML Service on Render**: Web Service, root `ml-service`, start `uvicorn main:app --host 0.0.0.0 --port 8000`

### Automated PostgreSQL Backup/Restore (Docker Compose)

The production compose file includes one-shot database utility services under a `tools` profile.

```bash
# Create a timestamped backup in ./backups
docker compose -f docker-compose-prod.yml --profile tools run --rm db-backup
```

```bash
# Restore a specific dump file from ./backups
# Linux/macOS
DB_DUMP_FILE=your_dump_file.dump docker compose -f docker-compose-prod.yml --profile tools run --rm db-restore

# Windows PowerShell
$env:DB_DUMP_FILE="your_dump_file.dump"
docker compose -f docker-compose-prod.yml --profile tools run --rm db-restore
```

Notes:
- Keep dump files in the project `backups/` folder.
- Restore recreates `skillforge_prod`, so it replaces current DB content.

### Production Checklist

- [ ] Set a strong `JWT_SECRET` (32+ characters)
- [ ] Use PostgreSQL instead of H2
- [ ] Configure HTTPS/SSL
- [ ] Update CORS origins in `SecurityConfiguration.java`
- [ ] Update OAuth redirect URIs to production URLs
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Update frontend `VITE_API_URL` to production backend URL
- [ ] Update OAuth callback URLs in Login.tsx and Register.tsx

---

## Test Credentials

The `DataSeeder` auto-creates these users on first run:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@skillforge.com` | `admin123` |
| Instructor | `instructor@skillforge.com` | `instructor123` |
| Student | `rajesh.kumar@skillforge.com` | `student123` |
| Student | `priya.sharma@skillforge.com` | `student123` |
| Student | `arjun.singh@skillforge.com` | `student123` |
| Student | `divya.patel@skillforge.com` | `student123` |
| Student | `amit.gupta@skillforge.com` | `student123` |
| Student | `neha.verma@skillforge.com` | `student123` |
| Student | `rohan.joshi@skillforge.com` | `student123` |
| Student | `pooja.iyer@skillforge.com` | `student123` |

> The database is file-based (H2) in dev mode — data persists across restarts. The seeder only runs when the database is empty.

---

## Troubleshooting

### Backend won't start — `Could not resolve placeholder 'jwt.secret'`
The `application.yml` is not being loaded. Use `spring-boot:run` instead of `java -jar`:
```bash
cd backend-spring
.\mvnw.cmd spring-boot:run
```

### Vite proxy error: ECONNREFUSED
The backend is not running. Start it first on port 8081, then start the frontend.

### ML service returns 422 Unprocessable Content
Ensure the ML service is running on port 8000 (`python -m uvicorn main:app --port 8000`). The backend sends recommendation requests server-to-server; if the ML service is down, the backend automatically falls back to popular-courses recommendations.

### OAuth login redirects but returns 401
Check that your `.env` file is in the `backend-spring/` directory with valid OAuth credentials. Verify the redirect URIs in Google Cloud Console / GitHub Developer Settings match:
- Google: `http://localhost:8081/login/oauth2/code/google`
- GitHub: `http://localhost:8081/login/oauth2/code/github`

### H2 database console
Access at http://localhost:8081/h2-console with:
- JDBC URL: `jdbc:h2:file:./data/skillforgedb`
- Username: `sa`
- Password: *(empty)*

### Port already in use
```bash
# Windows — kill process on port 8081
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8081
kill -9 <PID>
```

### Reset database
Delete the `backend-spring/data/` directory and restart the backend. The seeder will recreate all data.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with** Java 21 • Spring Boot 3.3 • React 18 • FastAPI • Tailwind CSS • shadcn/ui
