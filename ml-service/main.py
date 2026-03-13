from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from collections import defaultdict

app = FastAPI(
    title="SkillForge ML Service",
    description="ML-powered recommendations for CSE courses",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class QuizAttempt(BaseModel):
    courseId: str
    score: float
    passed: bool

class RecommendationRequest(BaseModel):
    userId: str
    enrolledCourses: List[str]
    enrolledTopics: Optional[List[str]] = None
    completedModules: List[str]
    quizAttempts: List[QuizAttempt]

class RecommendedCourse(BaseModel):
    courseId: str
    score: float
    reason: str

class RecommendationResponse(BaseModel):
    recommendedCourses: List[RecommendedCourse]
    recommendedTopics: List[str]

class DifficultyRequest(BaseModel):
    courseId: str
    userStats: dict

class DifficultyResponse(BaseModel):
    estimatedDifficulty: str
    confidence: float

class EnrolledCourse(BaseModel):
    courseId: str
    title: str
    category: str
    level: str
    durationHours: int
    progress: float
    moduleCount: int
    completedModules: int

class AnalyticsQuizAttempt(BaseModel):
    courseId: str
    score: float
    passed: bool
    createdAt: str

class AnalyticsRequest(BaseModel):
    userId: str
    enrolledCourses: List[EnrolledCourse]
    quizAttempts: List[AnalyticsQuizAttempt]
    totalHours: float

# Utility Functions
def calculate_mastery_tags(quiz_attempts: List[QuizAttempt]) -> dict:
    """Calculate mastery scores for each tag from quiz attempts"""
    tag_scores = {}
    tag_counts = {}
    
    for attempt in quiz_attempts:
        # Extract topic from course (simplified mapping)
        topic_map = {
            'dbms': 'DBMS',
            'dsa': 'DSA',
            'os': 'OS',
            'cn': 'CN',
            'oop': 'OOP'
        }
        
        for key, topic in topic_map.items():
            if key.lower() in attempt.courseId.lower():
                if topic not in tag_scores:
                    tag_scores[topic] = 0
                    tag_counts[topic] = 0
                tag_scores[topic] += attempt.score
                tag_counts[topic] += 1
    
    # Calculate averages
    for tag in tag_scores:
        if tag_counts[tag] > 0:
            tag_scores[tag] = tag_scores[tag] / tag_counts[tag] / 100.0
    
    return tag_scores

def calculate_recommendation_score(
    mastery: dict,
    course_id: str,
    enrolled_courses: List[str],
    topic: str,
    enrolled_topics: List[str]
) -> float:
    """Calculate weighted recommendation score"""
    
    # Don't recommend already enrolled courses
    if course_id in enrolled_courses:
        return 0.0
    
    # Get mastery for this topic
    mastery_tag = mastery.get(topic, 0.5)
    
    # Calculate components
    weakness_factor = (1 - mastery_tag)  # Recommend weak areas
    interest_boost = 0.15 if topic in enrolled_topics else 0.0
    popularity_boost = 0.8
    
    # Weighted formula
    score = (
        0.45 * weakness_factor +
        0.25 * (0.55 + interest_boost) +  # Engagement factor
        0.15 * (1 - len(enrolled_courses) / 10) +  # Avoid over-recommendation
        0.15 * popularity_boost
    )
    
    return max(0.0, min(1.0, score))

# API Endpoints
@app.get("/health")
async def health():
    return {"status": "SkillForge ML Service is running!"}

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(request: RecommendationRequest):
    """
    Generate personalized course recommendations using weighted ranking.
    """
    
    # Calculate mastery
    mastery = calculate_mastery_tags(request.quizAttempts)
    enrolled_topics = [topic.upper() for topic in (request.enrolledTopics or [])]
    
    # Course topics mapping
    course_topics = {
        'dbms': 'DBMS',
        'dsa': 'DSA',
        'os': 'OS',
        'cn': 'CN',
        'oop': 'OOP',
        'system': 'System Design',
        'ml': 'AI/ML Basics',
        'cyber': 'Cyber Security'
    }
    
    recommended_courses = []
    topics_to_recommend = []
    
    # Generate recommendations for each topic
    for course_key, topic in course_topics.items():
        score = calculate_recommendation_score(
            mastery,
            f"course_{course_key}",
            request.enrolledCourses,
            topic,
            enrolled_topics
        )
        
        if score > 0.3:  # Only recommend high-scoring courses
            reason_map = {
                'DBMS': "Recommended because you're progressing well in databases.",
                'DSA': "Essential skill for technical interviews and coding.",
                'OS': "Foundation for system understanding.",
                'CN': "Critical for networking and distributed systems.",
                'OOP': "Core programming paradigm to master.",
                'System Design': "Next step after mastering fundamentals.",
                'AI/ML Basics': "Trending field with career opportunities.",
                'Cyber Security': "Increasingly important skill in tech."
            }
            
            recommended_courses.append(
                RecommendedCourse(
                    courseId=f"course_{course_key}",
                    score=score,
                    reason=reason_map.get(topic, f"Recommended next step in {topic}")
                )
            )
            topics_to_recommend.append(topic)
    
    # Sort by score and limit to top 8
    recommended_courses.sort(key=lambda x: x.score, reverse=True)
    recommended_courses = recommended_courses[:8]
    topics_to_recommend = list(set(topics_to_recommend))[:5]
    
    return RecommendationResponse(
        recommendedCourses=recommended_courses,
        recommendedTopics=topics_to_recommend
    )

@app.post("/analytics")
async def analytics(request: AnalyticsRequest):
    """
    Generate dynamic analytics from enrolled courses + quiz attempts.
    """
    enrolled = request.enrolledCourses
    quiz_attempts = request.quizAttempts

    total_enrollments = len(enrolled)
    total_modules = sum(c.moduleCount for c in enrolled)
    completed_modules = sum(c.completedModules for c in enrolled)
    avg_completion = round(sum(c.progress for c in enrolled) / total_enrollments, 0) if total_enrollments > 0 else 0

    overview = {
        "avgCompletion": int(avg_completion),
        "modulesCompleted": int(completed_modules),
        "totalHours": int(round(request.totalHours)),
        "enrolledCourses": total_enrollments,
    }

    by_topic = defaultdict(list)
    for course in enrolled:
        by_topic[course.category].append(course.progress)

    topic_performance = [
        {"topic": topic, "score": int(round(sum(scores) / len(scores)))}
        for topic, scores in by_topic.items()
    ]
    topic_performance.sort(key=lambda x: x["score"], reverse=True)

    radar_skills = [
        {"name": item["topic"], "score": item["score"]}
        for item in topic_performance
    ]

    trend_points = []
    if quiz_attempts:
        sorted_attempts = sorted(quiz_attempts, key=lambda item: item.createdAt)
        recent_attempts = sorted_attempts[-10:]
        for item in recent_attempts:
            trend_points.append({"label": item.createdAt, "score": int(round(item.score))})
    else:
        synthetic = [max(0, min(100, int(avg_completion) - 8 + i * 2)) for i in range(1, 8)]
        trend_points = [{"label": f"Day {i}", "score": score} for i, score in enumerate(synthetic, start=1)]

    accuracy_map = defaultdict(list)
    for attempt in quiz_attempts:
        accuracy_map[attempt.courseId].append(attempt.score)

    scatter = []
    for course in enrolled:
        attempts = accuracy_map.get(course.courseId, [])
        accuracy = int(round(sum(attempts) / len(attempts))) if attempts else int(round(course.progress))
        scatter.append({
            "difficulty": course.level,
            "accuracy": accuracy,
            "attempts": max(1, len(attempts)),
            "course": course.title,
        })

    category_count = len(by_topic.keys())
    badges = [
        {"icon": "🎯", "label": "First Enrollment", "description": "Enrolled in your first course", "earned": total_enrollments >= 1},
        {"icon": "📚", "label": "Dedicated Learner", "description": "Enrolled in 5+ courses", "earned": total_enrollments >= 5},
        {"icon": "⚡", "label": "Module Master", "description": "Completed 10+ modules", "earned": completed_modules >= 10},
        {"icon": "🔥", "label": "Study Streak", "description": "Studied 20+ hours", "earned": request.totalHours >= 20},
        {"icon": "🌟", "label": "All-Rounder", "description": "Learning across 3+ categories", "earned": category_count >= 3},
        {"icon": "💎", "label": "Half Way There", "description": "50% average completion", "earned": avg_completion >= 50},
    ]

    weak_topics = sorted(topic_performance, key=lambda t: t["score"]) if topic_performance else []
    first_weak = weak_topics[0]["topic"] if weak_topics else "current topics"
    second_weak = weak_topics[1]["topic"] if len(weak_topics) > 1 else first_weak

    improvement_plan = [
        {"day": "Day 1", "task": f"Review fundamentals of {first_weak}", "status": "pending"},
        {"day": "Day 2", "task": f"Complete 2 pending modules in {first_weak}", "status": "pending"},
        {"day": "Day 3", "task": f"Practice quiz attempts in {second_weak}", "status": "pending"},
        {"day": "Day 4", "task": "Revise your strongest completed module", "status": "pending"},
        {"day": "Day 5", "task": "Attempt one mixed-topic quiz", "status": "pending"},
        {"day": "Day 6", "task": "Re-check weak-topic notes and examples", "status": "pending"},
        {"day": "Day 7", "task": "Review progress and set next weekly target", "status": "pending"},
    ]

    insights = [
        "Analytics are generated from your enrolled courses and quiz attempts.",
        "Improving weak-topic completion will raise your overall performance quickly.",
    ]

    return {
        "overview": overview,
        "topicPerformance": topic_performance,
        "radarSkills": radar_skills,
        "attemptTrend": trend_points,
        "accuracyVsDifficulty": scatter,
        "badges": badges,
        "improvementPlan": improvement_plan,
        "insights": insights,
    }

@app.post("/difficulty", response_model=DifficultyResponse)
async def estimate_difficulty(request: DifficultyRequest):
    """
    Estimate course difficulty based on user stats using simple heuristics.
    """
    
    avg_score = request.userStats.get('avgScore', 75)
    completion_rate = request.userStats.get('completionRate', 0.5)
    
    # Simple heuristic: lower score and completion = difficulty mismatch
    difficulty_score = (100 - avg_score) / 100.0
    engagement_factor = completion_rate
    
    overall_score = (difficulty_score + (1 - engagement_factor)) / 2
    
    if overall_score < 0.33:
        difficulty = "Beginner"
        confidence = 0.85
    elif overall_score < 0.67:
        difficulty = "Intermediate"
        confidence = 0.80
    else:
        difficulty = "Advanced"
        confidence = 0.75
    
    return DifficultyResponse(
        estimatedDifficulty=difficulty,
        confidence=confidence
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
