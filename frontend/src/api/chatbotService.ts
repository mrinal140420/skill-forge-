/**
 * SkillBot Chatbot Service with Google Generative AI Integration
 * - Course-contextual responses only
 * - Personalized with student name
 * - Prevents off-topic questions
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
 * Check if a question is related to the course
 */
export const isCoursRelated = (question: string, courseContext: CourseContext): boolean => {
  const offTopicKeywords = [
    'weather',
    'sports',
    'politics',
    'entertainment',
    'jokes',
    'funny',
    'meme',
    'covid',
    'vaccine',
    'bitcoin',
    'stock',
  ];

  const lowerQuestion = question.toLowerCase();

  // Check for explicitly off-topic keywords
  if (offTopicKeywords.some((keyword) => lowerQuestion.includes(keyword))) {
    return false;
  }

  // Check if question contains course-related keywords
  const courseKeywords = [
    courseContext.courseTitle.toLowerCase(),
    ...( courseContext.topics?.map((t) => t.toLowerCase()) || []),
    'concept',
    'example',
    'exercise',
    'explain',
    'understand',
    'solve',
    'algorithm',
    'data',
    'code',
    'function',
  ];

  return courseKeywords.some((keyword) => keyword && lowerQuestion.includes(keyword)) ||
    question.trim().split(/\s+/).length <= 4;
};

/**
 * Build a contextualized system prompt for the chatbot
 */
export const buildSystemPrompt = (courseContext: CourseContext): string => {
  return `You are SkillBot, an AI tutor for the course "${courseContext.courseTitle}".

You are helping a student named ${courseContext.studentName || 'Student'} understand the course material.

Your responsibilities:
1. Answer questions ONLY about topics related to "${courseContext.courseTitle}"
2. Provide clear, concise, and beginner-friendly explanations
3. Include the student's name when greeting or acknowledging their work
4. Suggest relevant examples and practice problems
5. Break down complex concepts into simpler parts
6. Provide code examples when relevant

IMPORTANT RULES:
- NEVER answer questions unrelated to ${courseContext.courseTitle}
- NEVER provide general knowledge answers (weather, sports, politics, etc.)
- NEVER engage in casual conversation or jokes
- If a question is off-topic, politely redirect to course content
- Keep responses SHORT and FOCUSED (2-3 sentences usually)
- Use friendly but professional tone

Topics covered in this course: ${courseContext.topics?.join(', ') || 'Various CS concepts'}

Example response format:
"Hi ${courseContext.studentName || 'there'}! That's a great question about [topic]. Here's a concise explanation: [explanation]. Would you like me to clarify any part of this?"`;
};

/**
 * Send a message to SkillBot with course context
 */
export const sendSkillBotMessage = async (
  question: string,
  courseContext: CourseContext
): Promise<string> => {
  // Check if question is course-related
  if (!isCoursRelated(question, courseContext)) {
    return `Hi ${courseContext.studentName || 'there'}! I appreciate your question, but I'm specifically designed to help with "${courseContext.courseTitle}". Let me help you with course-related questions instead. What would you like to know about this course?`;
  }

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
    console.error('Chatbot error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};

/**
 * Get suggested questions based on course topics
 */
export const getSuggestedQuestions = (courseContext: CourseContext): string[] => {
  const baseQuestions = [
    `Explain the key concepts of ${courseContext.courseTitle}`,
    `Can you provide an example related to this course?`,
    `How do I solve a problem using these concepts?`,
    `What are the common mistakes students make?`,
    `Summarize the important parts of this lesson`,
  ];

  return baseQuestions;
};

/**
 * Validate course context before chatting
 */
export const validateCourseContext = (context: CourseContext): boolean => {
  return !!(context.courseId && context.courseTitle);
};
