"use server";

import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function createGoal() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const goal = await prisma.learningGoal.create({
    data: {
      userId: user.id,
      conceptKey: "go-pointers",
      title: "Learn Go Pointers",
      description: "Intro to pointers",
    },
  });
  revalidatePath("/");

  return goal;
}
