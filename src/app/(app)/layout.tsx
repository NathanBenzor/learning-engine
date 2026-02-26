import { getCurrentUser } from "../../domains/auth/getCurrentUser";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  // console.log("User:", user);
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
