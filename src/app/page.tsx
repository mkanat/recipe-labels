import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRecipes } from "@/app/actions/recipe";
import { RecipeDashboard } from "@/components/recipe-dashboard";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getRecipes();
  const recipes = "recipes" in result ? result.recipes : [];

  return <RecipeDashboard initialRecipes={recipes} userEmail={session.user.email ?? ""} />;
}
