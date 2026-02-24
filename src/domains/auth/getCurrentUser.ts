import { createSupabaseServerClient } from "../../lib/supabaseServer";
import { prisma } from "../../lib/prisma";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Provision user into application DB
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
    },
  });

  return user;
}
