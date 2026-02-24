import { prisma } from "../../../lib/prisma";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      taskPlan: {
        include: {
          tasks: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!session) {
    return <div>Session not found</div>;
  }

  const firstTask = session.taskPlan?.tasks?.[0];
  console.log("first task ", firstTask);
  return (
    <div>
      <h1>Session Started</h1>
      <p>{firstTask?.content}</p>
    </div>
  );
}
