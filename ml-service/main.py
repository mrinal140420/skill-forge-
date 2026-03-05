from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

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
    topic: str
) -> float:
    """Calculate weighted recommendation score"""
    
    # Don't recommend already enrolled courses
    if course_id in enrolled_courses:
        return 0.0
    
    # Get mastery for this topic
    mastery_tag = mastery.get(topic, 0.5)
    
    # Calculate components
    weakness_factor = (1 - mastery_tag)  # Recommend weak areas
    popularity_boost = np.random.uniform(0.7, 1.0)  # Simulate popularity
    
    # Weighted formula
    score = (
        0.45 * weakness_factor +
        0.25 * (0.5 + np.random.uniform(-0.1, 0.1)) +  # Engagement factor
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
            topic
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
