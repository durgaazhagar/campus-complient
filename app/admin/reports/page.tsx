"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Hourglass,
  Users,
} from "lucide-react";
import { supabase, type Complaint } from "@/lib/supabase-client";
import { categories } from "@/lib/categories";
import { useRole } from "@/hooks/use-role";

const categoryColors = [
  "#3b82f6",
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ec4899",
];

const statuses = ["Pending", "In Progress", "Resolved"];

export default function AdminReportsPage() {
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
        setError("Could not load reports. Please try again.");
      } else {
        setComplaints((data as Complaint[]) || []);
        setError("");
      }
      setLoading(false);
    }

    void fetchComplaints();

    const channel = supabase
      .channel("admin-reports-realtime")
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

  const report = useMemo(() => {
    const byCategory = categories.map((category, index) => {
      const categoryComplaints = complaints.filter(
        (complaint) => complaint.category === category.id,
      );
      return {
        id: category.id,
        category: category.label,
        color: categoryColors[index],
        total: categoryComplaints.length,
        pending: categoryComplaints.filter(
          (complaint) => complaint.status === "Pending",
        ).length,
        inProgress: categoryComplaints.filter(
          (complaint) => complaint.status === "In Progress",
        ).length,
        resolved: categoryComplaints.filter(
          (complaint) => complaint.status === "Resolved",
        ).length,
      };
    });

    const workload = new Map<string, number>();
    complaints.forEach((complaint) => {
      const assignee = complaint.assigned_to?.trim();
      if (assignee) workload.set(assignee, (workload.get(assignee) || 0) + 1);
    });

    const resolved = complaints.filter(
      (complaint) => complaint.status === "Resolved",
    ).length;

    return {
      byCategory,
      workload: Array.from(workload, ([name, value]) => ({ name, value })).sort(
        (left, right) => right.value - left.value || left.name.localeCompare(right.name),
      ),
      resolved,
      resolutionRate: complaints.length
        ? Math.round((resolved / complaints.length) * 100)
        : 0,
    };
  }, [complaints]);

  if (roleLoading || (role === "admin" && loading)) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 md:px-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-gray-500">Admin access is required to view reports.</p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  const maxCount = Math.max(1, ...report.byCategory.map((item) => item.total));
  const maxWorkload = Math.max(1, ...report.workload.map((item) => item.value));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-900">
          Reports &amp; Analytics
        </h1>
        <p className="mt-2 text-slate-500">
          Department-wise complaint analysis
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Total Complaints",
                value: complaints.length,
                accent: "bg-blue-100 text-blue-700",
                icon: ArrowUpRight,
              },
              {
                label: "Resolution Rate",
                value: `${report.resolutionRate}%`,
                accent: "bg-emerald-100 text-emerald-700",
                icon: Hourglass,
              },
              {
                label: "Departments Involved",
                value: report.workload.length,
                accent: "bg-amber-100 text-amber-700",
                icon: Users,
              },
            ].map(({ label, value, accent, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-black tracking-tight text-slate-900">
                  {value}
                </div>
                <div className="mt-2 font-medium text-slate-600">{label}</div>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Complaints by Category
            </h2>
            <div className="space-y-4">
              {report.byCategory.map(({ id, category, total, color }) => (
                <div key={id} className="flex items-center gap-4">
                  <span className="w-28 shrink-0 text-sm font-medium text-slate-600">
                    {category}
                  </span>
                  <div
                    className="h-8 flex-1 overflow-hidden rounded-r-lg bg-slate-100"
                    role="img"
                    aria-label={`${category}: ${total} complaints`}
                  >
                    <div
                      className="h-full rounded-r-lg transition-[width]"
                      style={{
                        width: `${(total / maxCount) * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-slate-700">
                    {total}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Department Workload
                </h2>
              </div>
              {report.workload.length ? (
                <div className="space-y-3">
                  {report.workload.map(({ name, value }) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-sm font-medium text-slate-600">
                        {name}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: `${(value / maxWorkload) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-sm font-semibold text-slate-700">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">
                  No complaints have been assigned yet.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Status Breakdown by Category
                </h2>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      {statuses.map((status) => (
                        <th key={status} className="px-4 py-3 font-semibold">
                          {status}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.byCategory.map((row, index) => (
                      <tr
                        key={row.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                      >
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {row.category}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.total}</td>
                        <td className="px-4 py-3 text-slate-600">{row.pending}</td>
                        <td className="px-4 py-3 text-slate-600">{row.inProgress}</td>
                        <td className="px-4 py-3 text-slate-600">{row.resolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
