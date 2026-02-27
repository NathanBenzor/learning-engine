import { getGoalsByUser } from "@/domains/goals/repository";
import { archiveGoal } from "@/app/actions/archiveGoal";
import { getCurrentUser } from "@/domains/auth/getCurrentUser";
import { startSession } from "@/domains/sessions/startSessions";
import { createGoal } from "@/app/actions/createGoal";
import { logout } from "@/app/actions/logout";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const goals = await getGoalsByUser(user.id);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Your Learning Goals</h1>

          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 && <p className="text-zinc-400">No goals yet.</p>}

          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {goal.title}
                </h2>
                {goal.description && (
                  <p className="text-sm text-zinc-400">{goal.description}</p>
                )}
              </div>

              <div className="flex gap-3">
                <form
                  action={async () => {
                    "use server";
                    await archiveGoal(goal.id);
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-md"
                  >
                    Archive
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    const session = await startSession(goal.id);
                    redirect(`/session/${session.id}`);
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md"
                  >
                    Start Learning
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* Create Goal */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Create New Goal
          </h2>

          <form
            className="space-y-4"
            action={async (formData) => {
              "use server";
              await createGoal(
                formData.get("title") as string,
                formData.get("description") as string,
                Number(formData.get("difficulty")),
              );
            }}
          >
            <input
              name="title"
              placeholder="Goal title"
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              name="description"
              placeholder="What do you want to learn?"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center gap-4">
              <label className="text-sm text-zinc-400">Difficulty (1–5)</label>
              <input
                name="difficulty"
                type="number"
                min="1"
                max="5"
                defaultValue={3}
                required
                className="w-20 px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            >
              Create Goal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
