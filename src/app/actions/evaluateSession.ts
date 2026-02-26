"use server";

import { evaluateSession } from "@/domains/sessions/evaluateSession";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";

export async function evaluateSessionAction(sessionId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }
  console.log("sessionId:", sessionId);
  console.log("typeof sessionId:", typeof sessionId);
  // In v1 we assume session belongs to user
  return evaluateSession(sessionId);
}
