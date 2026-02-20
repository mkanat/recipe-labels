import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Once authenticated, we would fetch the user's recipes and render the RecipeList.
  // For the sake of E2E verification, just render the main layout structure.
  return (
    <div className="min-h-screen bg-zinc-950 p-6 font-sans text-zinc-50 md:p-12">
      <header className="mx-auto mb-12 flex max-w-3xl items-center justify-between">
        <h1 className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Recipe Labels
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-zinc-400">{session.user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Recipes</h2>
        </div>

        {/* Render RecipeList here */}
      </main>
    </div>
  );
}
