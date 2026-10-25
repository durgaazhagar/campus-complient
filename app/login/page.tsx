"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Wrench } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { supabase } from "@/lib/supabase-client";
import { resolveDemoAccount, setDemoSession } from "@/lib/demo-auth";

export default function LoginPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!roleLoading && role) {
      router.replace(role === "admin" ? "/admin" : "/");
    }
  }, [role, roleLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const demoAccount = resolveDemoAccount(email, password);
      if (demoAccount) {
        setDemoSession(demoAccount.role);
        router.replace(demoAccount.role === "admin" ? "/admin" : "/");
        return;
      }

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: "student" } },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setIsSignUp(false);
          return;
        }

        router.replace("/");
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          const invalidCredentialMessage =
            signInError.message.includes("Invalid login credentials")
              ? "Invalid login credentials. If you just created an account, confirm the email first or use one of the demo accounts below."
              : signInError.message;

          setError(invalidCredentialMessage);
          return;
        }

        const roleFromAuth =
          data.user.app_metadata?.role ??
          data.user.user_metadata?.role ??
          data.user.user_metadata?.["role"] ??
          "student";

        router.replace(roleFromAuth === "admin" ? "/admin" : "/");
      }
    } catch (submitError) {
      console.error("Authentication failed:", submitError);
      setError("We could not complete your request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 md:p-9">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Wrench className="h-6 w-6" />
          </span>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            CollegeFix
          </span>
        </Link>

        <div className="mb-7 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <GraduationCap className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignUp ? "Create your student account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isSignUp
              ? "Sign up to report and track campus issues."
              : "Sign in to continue to your CollegeFix account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="you@college.edu"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="At least 6 characters"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700"
            >
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create student account"
                : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Demo accounts</p>
          <p className="mt-1">Student: student@collegefix.test / student123</p>
          <p>Admin: admin@collegefix.test / admin123</p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "New student?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setNotice("");
            }}
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
        </p>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
          Admin access is assigned by your system administrator. Accounts
          cannot grant themselves admin privileges.
        </p>
      </section>
    </main>
  );
}
