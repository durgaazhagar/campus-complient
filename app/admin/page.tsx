"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { supabase, type Complaint } from "@/lib/supabase-client";
import { categories, getCategory, statusColors } from "@/lib/categories";
import { useRole } from "@/hooks/use-role";

export default function AdminPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roleLoading && !role) router.replace("/login");
  }, [role, roleLoading, router]);

  useEffect(() => {
    if (roleLoading || role !== "admin") return;

    let active = true;

    async function fetchComplaints() {
      const { data, error: fetchError } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError("Could not load the dashboard. Please try again.");
      } else {
        setComplaints((data as Complaint[]) || []);
        setError("");
      }
      setLoading(false);
    }

    void fetchComplaints();

    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => void fetchComplaints(),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [role, roleLoading]);

  const counts = useMemo(
    () => ({
      pending: complaints.filter((complaint) => complaint.status === "Pending")
        .length,
      inProgress: complaints.filter(
        (complaint) => complaint.status === "In Progress",
      ).length,
      resolved: complaints.filter((complaint) => complaint.status === "Resolved")
        .length,
    }),
    [complaints],
  );

  if (roleLoading || (role === "admin" && loading)) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 md:px-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-gray-500">Admin access is required to view the dashboard.</p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-500">
          All complaints overview &amp; real-time updates.
        </p>
      </div>

      {error ? (
        <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Complaints",
              value: complaints.length,
              icon: ClipboardList,
              color: "bg-blue-100 text-blue-700",
            },
            {
              label: "Pending",
              value: counts.pending,
              icon: Clock3,
              color: "bg-orange-100 text-orange-700",
            },
            {
              label: "In Progress",
              value: counts.inProgress,
              icon: Wrench,
              color: "bg-indigo-100 text-indigo-700",
            },
            {
              label: "Resolved",
              value: counts.resolved,
              icon: CheckCircle2,
              color: "bg-emerald-100 text-emerald-700",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Complaints</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest submissions and their current status
              </p>
            </div>
            <Link
              href="/admin/complaints"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {error ? null : complaints.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No complaints have been submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.slice(0, 5).map((complaint) => {
                const category = getCategory(complaint.category);
                const Icon = category?.icon;

                return (
                  <Link
                    key={complaint.id}
                    href={`/admin/complaints/${complaint.id}`}
                    className="flex items-center gap-3 py-3 first:pt-1 last:pb-1 hover:bg-slate-50"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category?.gradient || "from-gray-400 to-gray-500"} text-white`}>
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {complaint.problem_type}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {category?.label || complaint.category} · {complaint.location_name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[complaint.status] || "border-gray-200 bg-gray-100 text-gray-700"}`}
                    >
                      {complaint.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Category Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Open a category’s complaint queue</p>
          <div className="mt-4 space-y-2">
            {categories.map((category) => {
              const count = complaints.filter(
                (complaint) => complaint.category === category.id,
              ).length;
              const Icon = category.icon;

              return (
                <Link
                  key={category.id}
                  href={`/admin/complaints?category=${category.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${category.gradient} text-white`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {category.label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </Link>
              );
            })}
          </div>
          <Link
            href="/admin/reports"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            View reports <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
