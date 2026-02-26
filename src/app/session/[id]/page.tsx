import { submitTask } from "@/app/actions/submitTask";
import { prisma } from "../../../lib/prisma";
import { evaluateSessionAction } from "@/app/actions/evaluateSession";

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
  // hardcoded the first task
  const firstTask = session.taskPlan?.tasks?.[0];
  console.log("first task ", firstTask);
  return (
    <div>
      <h1>Session Started</h1>
      <p>{firstTask?.content}</p>
      {/* we need a place to answer the question and a form submit using a server action
        so that we can update the db with task attempt and content for answer */}
      <form
        action={async (formData) => {
          "use server";
          await submitTask(
            session.id,
            firstTask.id,
            formData.get("answer") as string,
          );
        }}
      >
        <input name="answer" />
        <button type="submit">Submit</button>
      </form>
      <form
        action={async () => {
          "use server";
          const result = await evaluateSessionAction(id);
          console.log(result);
        }}
      >
        <button type="submit">Test Evaluation</button>
      </form>
    </div>
  );
}
