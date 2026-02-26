import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function evaluateSession(sessionId: string) {
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

  const payload = session.taskPlan.tasks.map((task, index) => {
    const attempt = session.attempts.find((a) => a.taskId === task.id);

    return {
      taskIndex: index,
      question: task.content,
      response: attempt?.response ?? null,
    };
  });

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
    throw new Error("Empty response from OpenAI");
  }

  return JSON.parse(raw);
}
