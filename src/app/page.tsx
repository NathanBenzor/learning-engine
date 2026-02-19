import { getGoalsByUser } from "../domains/goals/repository";
import { archiveGoal } from "./actions/archiveGoal";

export default async function Home() {
  const goals = await getGoalsByUser("test-user");

  return (
    <ul>
      {goals.map((goal) => (
        <div key={goal.id}>
          <li key={goal.id}>
            {goal.title} (difficulty {goal.difficulty})
          </li>
          <form
            action={async () => {
              "use server";
              await archiveGoal(goal.id);
            }}
          >
            <button type="submit">Archive</button>
          </form>
        </div>
      ))}
    </ul>
  );
}
