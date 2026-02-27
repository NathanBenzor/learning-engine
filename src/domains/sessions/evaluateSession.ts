import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

/**
 * Strongly typed shape of stored evaluation.
 */
export type SessionEvaluation = {
  passed: boolean;
  summary: string;
  results: {
    taskIndex: number;
    correct: boolean;
  }[];
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function evaluateSession(
  sessionId: string,
): Promise<SessionEvaluation> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      taskPlan: {
        include: { tasks: true },
      },
      attempts: true,
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  /**
   * 🔒 If evaluation already exists → return it
   * This prevents duplicate OpenAI calls on refresh.
   */
  if (session.evaluation && session.passed !== null) {
    return session.evaluation as SessionEvaluation;
  }

  /**
   * Build structured payload linking tasks + responses
   */
  const payload = session.taskPlan.tasks.map((task, index) => {
    const attempt = session.attempts.find((a) => a.taskId === task.id);

    return {
      taskIndex: index,
      question: task.content,
      response: attempt?.response ?? null,
    };
  });

  /**
   * Call OpenAI
   */
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are evaluating a completed learning session.

Return ONLY valid JSON:

{
  "passed": boolean,
  "summary": string,
  "results": [
    { "taskIndex": number, "correct": boolean }
  ]
}
`,
      },
      {
        role: "user",
        content: JSON.stringify({ tasks: payload }),
      },
    ],
  });

  const raw = completion.choices[0].message.content;

  if (!raw) {
    throw new Error("OpenAI returned empty response");
  }

  const parsed = JSON.parse(raw) as SessionEvaluation;

  /**
   * Runtime validation (important safety layer)
   */
  if (
    typeof parsed.passed !== "boolean" ||
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.results)
  ) {
    throw new Error("Invalid evaluation structure from AI");
  }

  /**
   * Persist evaluation (idempotent behavior)
   */
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      evaluation: parsed,
      passed: parsed.passed,
    },
  });

  return parsed;
}
