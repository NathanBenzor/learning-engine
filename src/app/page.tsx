import { createGoal } from "./actions/createGoal";

export default function Home() {
  async function handleCreate() {
    "use server";
    await createGoal();
  }

  return (
    <form action={handleCreate}>
      <button type="submit">Create Test Goal</button>
    </form>
  );
}
