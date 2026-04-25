import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const session = await getAdminSession();

  // Agar session pehle se hai, toh seedha dashboard bhej do
  if (session) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8 bg-gray-50">
      <section className="mx-auto w-full max-w-md rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink">
          Admin access
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-foreground">
          Magnetify Console
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Access the master dashboard to manage your store and analytics.
        </p>

        {error === "invalid" ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium text-center">
            The email or password is incorrect.
          </div>
        ) : null}

        <form action="/api/admin/login" method="POST" className="mt-8 space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
            <input
              required
              type="email"
              name="email"
              placeholder="admin@magnetify.in"
              className="mt-2 w-full rounded-2xl border border-border bg-gray-50 px-4 py-4 text-sm text-foreground outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
            <input
              required
              type="password"
              name="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-border bg-gray-50 px-4 py-4 text-sm text-foreground outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-all"
            />
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-pink px-6 py-4 text-sm font-bold text-white shadow-lg hover:-translate-y-0.5 hover:bg-orange transition-all active:scale-95"
          >
            Sign in to Dashboard
          </button>
        </form>
      </section>
    </main>
  );
}