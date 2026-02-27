import { prisma } from "@/lib/prisma";

export async function getSessionState(sessionId: string, userId: string) {
  console.log("sessionId in getSessionState:", sessionId);
  console.log("typeof sessionId:", typeof sessionId);
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

  // 🔥 First task with no attempt becomes current
  const currentTask = tasks.find((task) => {
    return !attempts.some((a) => a.taskId === task.id);
  });

  const isComplete = !currentTask;

  // 🔒 Mark completion once
  if (isComplete && !session.completedAt) {
    await prisma.session.update({
      where: { id: session.id },
      data: { completedAt: new Date() },
    });
  }

  return {
    session,
    currentTask: currentTask ?? null,
    isComplete,
  };
}
