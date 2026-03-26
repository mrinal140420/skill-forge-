/**
 * SkillBot Chatbot Service
 * - Fully dynamic: Adapts to any of the 18+ courses via CourseContext
 * - Handles all broad Computer Science Engineering (CSE) topics
 * - Blocks non-academic chatter automatically
 */

import apiClient from './apiClient';

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export interface CourseContext {
  courseId: string;
  courseTitle: string;
  courseDescription?: string;
  topics?: string[];
  studentName?: string;
}

/**
 * Client-side filter to quickly block obvious non-academic junk
 * before wasting API calls. We let the LLM handle the complex CSE validation.
 */
export const isCourseRelated = (question: string, _courseContext: CourseContext): boolean => {
  const offTopicKeywords = [
    'weather', 'sports', 'politics', 'entertainment', 'movie', 'actor',
    'jokes', 'funny', 'meme', 'covid', 'vaccine', 'bitcoin', 'stock', 'recipe'
  ];

  const lowerQuestion = question.toLowerCase().trim();
  const words = lowerQuestion.split(/\s+/);

  // Fast fail for obvious non-academic topics
  if (offTopicKeywords.some((keyword) => words.includes(keyword))) {
    return false;
  }

  // Pass everything else to the AI. The system prompt will block
  // anything that isn't CSE or course-related.
  return true;
};

/**
 * Build a highly dynamic, course-agnostic system prompt.
 * It adapts entirely based on the injected CourseContext.
 */
export const buildSystemPrompt = (courseContext: CourseContext): string => {
  const studentName = courseContext.studentName || 'Student';
  const courseTitle = courseContext.courseTitle;
  const topics = courseContext.topics?.join(', ') || 'General Concepts';
  const description = courseContext.courseDescription ? `Course Description: ${courseContext.courseDescription}` : '';

  return `You are SkillBot, an expert AI Tutor for the SkillForge adaptive learning platform.

CURRENT SESSION CONTEXT:
- Student: ${studentName}
- Active Course: "${courseTitle}"
- Focus Topics: ${topics}
${description}

YOUR CORE DIRECTIVES:
1. DOMAIN BOUNDARIES: You are authorized to answer questions specifically about "${courseTitle}" AND any general Computer Science Engineering (CSE) topic (e.g., AI/ML, Deep Learning, Cybersecurity, Operating Systems, Linux, Data Structures, Networking, etc.).
2. STRICT REFUSAL: You MUST politely refuse to answer any questions outside of Computer Science, Software Engineering, or Academics. If asked about sports, pop culture, or personal opinions, redirect the user.
3. TONE & PERSONA: Be encouraging, professional, and beginner-friendly. Always use the student's name (${studentName}) to personalize the experience.
4. RESPONSE STRUCTURE: Keep responses balanced (4-7 sentences). Use the format: Brief Explanation -> Concrete Example -> One Actionable Next Step.
5. TECHNICAL ACCURACY: Provide clean, well-commented code snippets, CLI commands, or technical explanations only when relevant to the query.

EXAMPLE REDIRECTION FOR OFF-TOPIC QUERIES:
"Hi ${studentName}, I'm here to help you master Computer Science and ${courseTitle}. Let's get back to the tech! What would you like to explore next?"`;
};

/**
 * Send a message to SkillBot with dynamic course context
 */
export const sendSkillBotMessage = async (
  question: string,
  courseContext: CourseContext
): Promise<string> => {

  // 1. Client-side fast fail
  if (!isCourseRelated(question, courseContext)) {
    return `Hi ${courseContext.studentName || 'there'}! I'm specifically designed to help with Computer Science and "${courseContext.courseTitle}". Let's stay focused on your learning goals. What can I help you with today?`;
  }

  // 2. Send to backend with dynamic prompt
  try {
    const { data } = await apiClient.post('/api/skillbot/chat', {
      message: question,
      courseId: Number(courseContext.courseId),
      topic: courseContext.courseTitle,
      studentName: courseContext.studentName,
      systemPrompt: buildSystemPrompt(courseContext),
    });

    return data.botResponse || data.response || data.message || 'I could not generate a response.';
  } catch (error) {
    console.error('SkillBot API error:', error);
    return 'Sorry, I encountered an error connecting to the platform. Please try again.';
  }
};

/**
 * Dynamically generate suggested questions based on the active course
 */
export const getSuggestedQuestions = (courseContext: CourseContext): string[] => {
  return [
    `What are the core concepts of ${courseContext.courseTitle}?`,
    `Can you show me a practical example related to this course?`,
    `How do these concepts apply in real-world Computer Science?`,
    `What are the most common mistakes students make when learning this?`,
    `Can you give me a practice problem to test my understanding?`,
  ];
};

/**
 * Validate course context before initiating chat
 */
export const validateCourseContext = (context: CourseContext): boolean => {
  return !!(context.courseId && context.courseTitle);
};
