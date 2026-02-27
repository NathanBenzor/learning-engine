import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Shape we expect back from the AI.
 */
type GeneratedTaskPlan = {
  tasks: {
    orderIndex: number;
    content: string;
  }[];
};

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
You are generating a structured learning plan.

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

Requirements:
- Exactly 5 tasks
- orderIndex must be 0 through 4
- Tasks should progressively increase in difficulty
- No extra text outside JSON
`,
      },
      {
        role: "user",
        content: `
Goal Title: ${title}
Description: ${description}
Difficulty Level (1-5): ${difficulty}

Generate exactly 5 progressively challenging learning tasks.
`,
      },
    ],
  });

  const raw = completion.choices[0].message.content;

  if (!raw) {
    throw new Error("OpenAI returned empty response");
  }

  const parsed = JSON.parse(raw) as GeneratedTaskPlan;

  // Runtime validation (important)
  if (
    !parsed.tasks ||
    !Array.isArray(parsed.tasks) ||
    parsed.tasks.length !== 5
  ) {
    throw new Error("AI did not return exactly 5 tasks");
  }

  parsed.tasks.forEach((task, index) => {
    if (
      typeof task.orderIndex !== "number" ||
      typeof task.content !== "string"
    ) {
      throw new Error("AI returned malformed task structure");
    }

    if (task.orderIndex !== index) {
      throw new Error("AI returned incorrect orderIndex sequence");
    }
  });

  return parsed;
}
