"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Wrench,
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowRight,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { supabase, type Complaint } from "@/lib/supabase-client";
import { getCategory, priorityColors, statusSteps } from "@/lib/categories";
import { useRole } from "@/hooks/use-role";

export default function MyComplaintsPage() {
  const router = useRouter();
  const { role, userId, loading: roleLoading } = useRole();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const studentId = userId ?? "";

  useEffect(() => {
    if (!roleLoading && role !== "student") {
      router.replace(role === "admin" ? "/admin" : "/login");
    }
  }, [role, roleLoading, router]);

  useEffect(() => {
    if (roleLoading || role !== "student" || !studentId) return;

    async function fetchComplaints() {
      const { data, error: fetchError } = await supabase
        .from("complaints")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Could not load your complaints. Please try again.");
        setLoading(false);
        return;
      }

      setComplaints((data as Complaint[]) || []);
      setError("");
      setLoading(false);
    }

    void fetchComplaints();

    const channel = supabase
      .channel(`complaints-changes-${studentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => void fetchComplaints(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [role, roleLoading, studentId]);

  const filtered = complaints.filter((complaint) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      complaint.problem_type.toLowerCase().includes(query) ||
      complaint.location_name.toLowerCase().includes(query) ||
      complaint.description.toLowerCase().includes(query);
    const matchesFilter = filter === "all" || complaint.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filters = ["all", "Pending", "In Progress", "Resolved"];

  if (roleLoading || role !== "student") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-bold">My Complaints</h1>
        <p className="text-sm text-gray-500">
          Track your complaints in real-time
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search complaints..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === item
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item === "all" ? "All" : item}
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="py-8 text-center text-sm text-red-600">
          {error}
        </p>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-500">No complaints found</p>
          <p className="mt-1 text-sm text-gray-400">
            File a new complaint to get started
          </p>
          <Link
            href="/complaint/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            New Complaint <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint) => (
            <ComplaintTrackingCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}

function ComplaintTrackingCard({ complaint }: { complaint: Complaint }) {
  const category = getCategory(complaint.category);
  const currentStep = statusSteps.indexOf(complaint.status);
  const Icon = category?.icon || Clock;
  const timeStr = new Date(complaint.created_at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`/complaint/${complaint.id}`}>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md">
        <div className="mb-3 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category?.gradient || "from-gray-400 to-gray-500"} text-white`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-gray-900">
              {complaint.problem_type}
            </h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {complaint.location_name}
              {complaint.room_no && ` - ${complaint.room_no}`}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityColors[complaint.priority] || priorityColors.Medium}`}
            >
              {complaint.priority}
            </span>
            {complaint.image_urls.length > 0 && (
              <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
            )}
          </div>
        </div>

        {complaint.ai_analysis?.problem_detected && (
          <div className="mb-3 flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">
              {complaint.ai_analysis.problem_detected}
            </span>
          </div>
        )}

        <div className="relative mb-2 flex items-center justify-between px-1">
          {statusSteps.map((step, index) => {
            const isDone = index <= currentStep;
            const isCurrent = index === currentStep;
            const StepIcon =
              step === "Pending"
                ? Clock
                : step === "In Progress"
                  ? Wrench
                  : CheckCircle2;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    isDone ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                  } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span
                  className={`mt-1 text-[10px] ${
                    isDone ? "font-medium text-blue-600" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
          <div className="absolute left-4 right-4 top-4 -z-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {timeStr}
          </div>
          {complaint.assigned_to && (
            <span className="text-xs text-gray-500">
              Assigned:{" "}
              <span className="font-medium text-gray-700">
                {complaint.assigned_to}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
