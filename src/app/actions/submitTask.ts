"use server";

import { getCurrentUser } from "@/domains/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function submitTask(
  sessionId: string,
  taskPlanId: string,
  response: string,
) {
  // validate user
  const user = await getCurrentUser();
  console.log("logging user: ", user?.id);
  if (!user) {
    throw new Error("User not validated");
  }

  // validate session

  // create TaskAttempt (PENDING)
  // evaluate (mock)
  // update status
  // redirect(`/session/${sessionId}`)
}
