import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseTitle, lessonTopic, difficulty } = await req.json();

    if (!courseTitle || !lessonTopic) {
      return Response.json({ error: 'Missing courseTitle or lessonTopic' }, { status: 400 });
    }

    const prompt = `Generate 5 multiple choice quiz questions for the following topic: "${lessonTopic}" from the course "${courseTitle}". 
    Difficulty level: ${difficulty || 'intermediate'}.
    
    Format your response as a JSON array with this exact structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option A",
        "explanation": "Brief explanation of why this is correct"
      }
    ]
    
    Make sure the questions test understanding, not just memorization. Include practical applications when possible.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_answer: { type: "string" },
                explanation: { type: "string" }
              }
            }
          }
        }
      }
    });

    const questions = response?.questions || [];

    return Response.json({
      success: true,
      questions,
      count: questions.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});