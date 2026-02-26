import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@prisma/client";

export async function getSessionState(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      taskPlan: {
        include: {
          tasks: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      attempts: true,
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== userId) {
    throw new Error("Unauthorized session access");
  }

  const tasks = session.taskPlan.tasks;
  const attempts = session.attempts;

  // Group attempts by taskId
  const attemptsByTask = new Map<string, typeof attempts>();

  for (const attempt of attempts) {
    const list = attemptsByTask.get(attempt.taskId) ?? [];
    list.push(attempt);
    attemptsByTask.set(attempt.taskId, list);
  }

  let currentTask = null;
  let completedCount = 0;

  for (const task of tasks) {
    const taskAttempts = attemptsByTask.get(task.id) ?? [];

    const passed = taskAttempts.some((a) => a.status === AttemptStatus.PASSED);

    if (passed) {
      completedCount++;
      continue;
    }

    if (taskAttempts.length >= 3) {
      // exhausted (neutral skip)
      completedCount++;
      continue;
    }

    currentTask = task;
    break;
  }

  const isComplete = currentTask === null;

  // 🔒 Mark completion once
  if (isComplete && !session.completedAt) {
    await prisma.session.update({
      where: { id: session.id },
      data: { completedAt: new Date() },
    });
  }

  return {
    sessionId: session.id,
    currentTask,
    isComplete,
    progress: {
      total: tasks.length,
      completed: completedCount,
    },
  };
}
