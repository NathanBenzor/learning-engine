import { getCurrentUser } from "@/domains/auth/getCurrentUser";
import { getSessionState } from "@/domains/sessions/getSessionState";
import { submitTask } from "@/app/actions/submitTask";
import { evaluateSession } from "@/domains/sessions/evaluateSession";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/logout";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const state = await getSessionState(id, user.id);

  if (state.isComplete) {
    const result = await evaluateSession(id);

    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">Session Complete</h1>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-zinc-300">{result.summary}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Task Breakdown</h2>

            {result.results.map((r) => (
              <div
                key={r.taskIndex}
                className="flex justify-between items-center bg-zinc-800 px-4 py-3 rounded-md border border-zinc-700"
              >
                <span className="text-zinc-300">Task {r.taskIndex + 1}</span>

                <span
                  className={
                    r.correct
                      ? "text-green-400 font-medium"
                      : "text-red-400 font-medium"
                  }
                >
                  {r.correct ? "Correct" : "Incorrect"}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const task = state.currentTask;

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Learning Session</h1>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </form>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <p className="text-zinc-200">{task?.content}</p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await submitTask(
              state.session.id,
              task!.id,
              formData.get("answer") as string,
            );
          }}
          className="space-y-4"
        >
          <textarea
            name="answer"
            required
            placeholder="Write your answer here..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
          >
            Submit Answer
          </button>
        </form>
        <div className="flex justify-between align-right">
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
