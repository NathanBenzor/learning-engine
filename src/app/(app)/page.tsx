import { getGoalsByUser } from "../../domains/goals/repository";
import { archiveGoal } from "../actions/archiveGoal";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";

export default async function Home() {
  const user = await getCurrentUser();
  const goals = await getGoalsByUser(user.id);
  console.log("userID: ", user.id);

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
