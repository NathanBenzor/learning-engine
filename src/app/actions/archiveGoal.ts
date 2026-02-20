"use server";

import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";

export async function archiveGoal(goalId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  await prisma.learningGoal.update({
    where: {
      id: goalId,
      userId: user.id,
    },
    data: {
      archivedAt: new Date(),
    },
  });
}
