"use server";

import { getCurrentUser } from "@/domains/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitTask(
  sessionId: string,
  taskId: string,
  response: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // 1️⃣ Ensure session belongs to user
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== user.id) {
    throw new Error("Unauthorized session access");
  }

  // 2️⃣ Prevent duplicate attempt (v1 rule: one attempt only)
  const existingAttempt = await prisma.taskAttempt.findFirst({
    where: {
      sessionId,
      taskId,
    },
  });

  if (existingAttempt) {
    throw new Error("Task already answered");
  }

  // 3️⃣ Create attempt
  await prisma.taskAttempt.create({
    data: {
      sessionId,
      taskId,
      response,
      status: "PENDING", // unused for now, but required by schema
    },
  });

  // 4️⃣ Revalidate session route so page re-renders
  revalidatePath(`/session/${sessionId}`);
}
