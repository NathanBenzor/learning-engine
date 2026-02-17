"use server";

import { prisma } from "@/lib/prisma";

export async function createGoal() {
  const goal = await prisma.learningGoal.create({
    data: {
      userId: "test-user",
      conceptKey: "go-pointers",
      difficulty: 1,
      title: "Learn Go Pointers",
      description: "Intro to pointers",
    },
  });

  return goal;
}
