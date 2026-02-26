import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@prisma/client";
import { getSessionState } from "@/domains/sessions/getSessionState";
import { evaluateResponse } from "@/domains/sessions/evaluateResponse";

export async function submitAttempt({
  sessionId,
  userId,
  taskId,
  response,
}: {
  sessionId: string;
  userId: string;
  taskId: string;
  response: string;
}) {
  // 1️⃣ Resolve session state first
  const state = await getSessionState(sessionId, userId);

  if (state.isComplete) {
    throw new Error("Session already completed");
  }

  if (!state.currentTask) {
    throw new Error("No actionable task found");
  }

  // 2️⃣ Ensure user is submitting for the correct task
  if (state.currentTask.id !== taskId) {
    throw new Error("Invalid task submission order");
  }

  // 3️⃣ Get existing attempts for this task
  const existingAttempts = await prisma.taskAttempt.findMany({
    where: { sessionId, taskId },
  });

  // Guard: no submission after pass
  const alreadyPassed = existingAttempts.some(
    (a) => a.status === AttemptStatus.PASSED,
  );

  if (alreadyPassed) {
    throw new Error("Task already completed");
  }

  // Guard: max 3 attempts
  if (existingAttempts.length >= 3) {
    throw new Error("Maximum attempts reached");
  }

  // 4️⃣ Evaluate response
  const evaluation = await evaluateResponse({
    task: state.currentTask,
    response,
  });

  const status =
    evaluation.passed === true ? AttemptStatus.PASSED : AttemptStatus.FAILED;

  // 5️⃣ Persist attempt
  await prisma.taskAttempt.create({
    data: {
      sessionId,
      taskId,
      response,
      status,
    },
  });

  // 6️⃣ Recompute session state
  const updatedState = await getSessionState(sessionId, userId);

  return updatedState;
}
