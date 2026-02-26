"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";
import { generateTaskPlan } from "@/domains/goals/generateTaskPlan";
import { revalidatePath } from "next/cache";

export async function createGoal(
  title: string,
  description: string,
  difficulty: number,
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const aiPlan = await generateTaskPlan({
    title,
    description,
    difficulty,
  });

  await prisma.$transaction(async (tx) => {
    const goal = await tx.learningGoal.create({
      data: {
        userId: user.id,
        conceptKey: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        description,
      },
    });

    const taskPlan = await tx.taskPlan.create({
      data: {
        goalId: goal.id,
        difficulty,
      },
    });

    await tx.task.createMany({
      data: aiPlan.tasks.map((task) => ({
        taskPlanId: taskPlan.id,
        orderIndex: task.orderIndex,
        content: task.content,
      })),
    });
  });

  revalidatePath("/");
}
