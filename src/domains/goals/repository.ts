import { prisma } from "../../lib/prisma";

export async function getGoalsByUser(userId: string) {
  return prisma.learningGoal.findMany({
    where: {
      userId,
      archivedAt: null, // soft delete constraint
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
