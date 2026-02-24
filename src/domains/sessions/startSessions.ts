import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../auth/getCurrentUser";

export async function startSession(goalId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1️⃣ Check for existing active session
  const existingSession = await prisma.session.findFirst({
    where: {
      goalId,
      userId: user.id,
      completedAt: null,
    },
  });

  if (existingSession) {
    return existingSession;
  }

  // 2️⃣ Check for existing TaskPlan (difficulty = 1 for v1)
  let taskPlan = await prisma.taskPlan.findFirst({
    where: {
      goalId,
      difficulty: 1,
    },
  });

  // 3️⃣ If none exists, generate one (stubbed for now)
  if (!taskPlan) {
    const generatedTasks = [
      "Explain what a pointer is.",
      "What does & do in Go?",
      "What does * do in Go?",
    ];

    await prisma.$transaction(async (tx) => {
      const createdTaskPlan = await tx.taskPlan.create({
        data: {
          goalId,
          difficulty: 1,
        },
      });

      for (let i = 0; i < generatedTasks.length; i++) {
        await tx.task.create({
          data: {
            taskPlanId: createdTaskPlan.id,
            orderIndex: i,
            content: generatedTasks[i],
          },
        });
      }

      taskPlan = createdTaskPlan;
    });
  }

  // 4️⃣ Create session
  const session = await prisma.session.create({
    data: {
      goalId,
      taskPlanId: taskPlan!.id,
      userId: user.id,
    },
  });

  return session;
}
