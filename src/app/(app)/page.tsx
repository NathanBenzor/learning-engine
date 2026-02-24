import { getGoalsByUser } from "../../domains/goals/repository";
import { archiveGoal } from "../actions/archiveGoal";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";
import { startSession } from "@/domains/sessions/startSessions";
import { createGoal } from "../actions/createGoal";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const goals = await getGoalsByUser(user.id);

  return (
    <>
      <ul>
        {goals.length === 0 && <p>No goals yet.</p>}

        {goals.map((goal) => (
          <li key={goal.id}>
            {goal.title}

            <form
              action={async () => {
                "use server";
                await archiveGoal(goal.id);
              }}
            >
              <button type="submit">Archive</button>
            </form>

            <form
              action={async () => {
                "use server";

                const session = await startSession(goal.id);

                redirect(`/session/${session.id}`);
              }}
            >
              <button type="submit">Start Learning</button>
            </form>
          </li>
        ))}
      </ul>

      <form
        action={async () => {
          "use server";
          await createGoal();
        }}
      >
        <button type="submit">Create Goal</button>
      </form>
    </>
  );
}
