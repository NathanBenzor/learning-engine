"use server";

import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";

export async function createGoal() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const goal = await prisma.learningGoal.create({
    data: {
      userId: user.id,
      conceptKey: "go-pointers",
      difficulty: 1,
      title: "Learn Go Pointers",
      description: "Intro to pointers",
    },
  });

  return goal;
}
