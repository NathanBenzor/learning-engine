"use server";

import { prisma } from "../../lib/prisma";

export async function archiveGoal(goalId: string) {
  await prisma.learningGoal.update({
    where: { id: goalId },
    data: {
      archivedAt: new Date(),
    },
  });
}
