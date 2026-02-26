import OpenAI from "openai";
import { AttemptStatus } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function evaluateResponse({
  task,
  response,
}: {
  task: { content: string; evaluationRubric?: string };
  response: string;
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a strict evaluator.
Return ONLY valid JSON:
{
  "passed": boolean,
  "feedback": string
}
`,
        },
        {
          role: "user",
          content: `
Task:
${task.content}

Evaluation Criteria:
${task.evaluationRubric ?? "Evaluate conceptual correctness."}

Learner Response:
${response}
`,
        },
      ],
    });

    const raw = completion.choices[0].message.content;

    if (!raw) {
      return { status: AttemptStatus.EVALUATION_FAILED };
    }

    const parsed = JSON.parse(raw);

    if (typeof parsed.passed !== "boolean") {
      return { status: AttemptStatus.EVALUATION_FAILED };
    }

    return {
      status: parsed.passed ? AttemptStatus.PASSED : AttemptStatus.FAILED,
      feedback: parsed.feedback,
    };
  } catch (err) {
    console.error("Evaluation error:", err);
    return { status: AttemptStatus.EVALUATION_FAILED };
  }
}
