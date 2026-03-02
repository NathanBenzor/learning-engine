import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GeneratedTaskPlan = {
  tasks: {
    orderIndex: number;
    content: string; // will be a QUESTION
  }[];
};

function isQuestion(s: string) {
  const t = s.trim();
  return t.length > 0 && t.endsWith("?") && !/^task\s*:/i.test(t);
}

export async function generateTaskPlan({
  title,
  description,
  difficulty,
}: {
  title: string;
  description: string;
  difficulty: number;
}): Promise<GeneratedTaskPlan> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You generate learning QUESTIONS (not tasks).

Return ONLY valid JSON in this exact format:

{
  "tasks": [
    { "orderIndex": 0, "content": string },
    { "orderIndex": 1, "content": string },
    { "orderIndex": 2, "content": string },
    { "orderIndex": 3, "content": string },
    { "orderIndex": 4, "content": string }
  ]
}

Rules:
- Generate exactly 5 QUESTIONS.
- Each content must be a single, answerable question that ends with "?".
- Do NOT include multi-step instructions (no "do X then Y").
- Do NOT prefix with "Task:" or "Question:".
- Progress from easier to harder.
`,
      },
      {
        role: "user",
        content: `
Goal Title: ${title}
Description: ${description}
Difficulty (1-5): ${difficulty}

Generate 5 progressively challenging questions that test understanding of this topic.
`,
      },
    ],
  });

  const raw = completion.choices[0].message.content;
  if (!raw) throw new Error("OpenAI returned empty response");

  const parsed = JSON.parse(raw) as GeneratedTaskPlan;

  if (
    !parsed.tasks ||
    !Array.isArray(parsed.tasks) ||
    parsed.tasks.length !== 5
  ) {
    throw new Error("AI did not return exactly 5 items");
  }

  parsed.tasks.forEach((q, index) => {
    if (typeof q.orderIndex !== "number" || typeof q.content !== "string") {
      throw new Error("AI returned malformed question structure");
    }
    if (q.orderIndex !== index) {
      throw new Error("AI returned incorrect orderIndex sequence");
    }
    if (!isQuestion(q.content)) {
      throw new Error(`AI returned a non-question at index ${index}`);
    }
  });

  return parsed;
}
