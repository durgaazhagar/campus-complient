"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  Sparkles,
  User,
  Tag,
  ImageIcon,
} from "lucide-react";
import { supabase, type Complaint } from "@/lib/supabase-client";
import { getCategory, priorityColors, statusSteps } from "@/lib/categories";
import { useRole } from "@/hooks/use-role";

export default function ComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const { role, userId, loading: roleLoading } = useRole();
  const studentId = userId ?? "";

  useEffect(() => {
    if (!roleLoading && role !== "student") {
      router.replace(role === "admin" ? "/admin" : "/login");
    }
  }, [role, roleLoading, router]);

  useEffect(() => {
    if (!params.id || !studentId || roleLoading || role !== "student") return;

    let active = true;

    async function fetchComplaint() {
      const { data, error: fetchError } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError("Could not load this complaint. Please try again.");
      } else {
        const result = data as Complaint | null;
        if (result && role === "student" && result.student_id !== studentId) {
          setAccessDenied(true);
        } else {
          setComplaint(result);
        }
      }
      setLoading(false);
    }

    void fetchComplaint();
    return () => {
      active = false;
    };
  }, [params.id, studentId, role, roleLoading]);

  if (roleLoading || role !== "student" || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (accessDenied || error || !complaint) {
    const message = accessDenied
      ? "You can only view your own complaints."
      : error || "Complaint not found";

    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className={error ? "text-red-600" : "text-gray-500"} role={error ? "alert" : undefined}>
          {message}
        </p>
        <button
          type="button"
          className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => router.push("/my-complaints")}
        >
          Back to My Complaints
        </button>
      </div>
    );
  }

  const category = getCategory(complaint.category);
  const currentStep = statusSteps.indexOf(complaint.status);
  const timeStr = new Date(complaint.created_at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          aria-label="Go back"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Complaint Details</h1>
      </div>

      <div
        className={`mb-4 rounded-2xl border-2 p-4 ${category?.borderColor || "border-gray-200"} ${category?.bgColor || "bg-gray-50"}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category?.gradient || "from-gray-400 to-gray-500"} text-white`}
          >
            {category && <category.icon className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{complaint.problem_type}</h2>
            <p className="text-sm text-gray-500">{category?.label}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityColors[complaint.priority] || priorityColors.Medium}`}
          >
            {complaint.priority}
          </span>
        </div>
      </div>

      {complaint.image_urls.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700">
            <ImageIcon className="h-4 w-4" /> Photos
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {complaint.image_urls.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square overflow-hidden rounded-xl border"
              >
                <img
                  src={url}
                  alt={`Complaint photo ${index + 1}`}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        <InfoRow
          icon={<MapPin className="h-4 w-4" />}
          label="Location"
          value={`${complaint.location_name}${complaint.room_no ? ` - ${complaint.room_no}` : ""}`}
        />
        <InfoRow
          icon={<User className="h-4 w-4" />}
          label="Reported by"
          value={complaint.student_name}
        />
        <InfoRow
          icon={<Calendar className="h-4 w-4" />}
          label="Date"
          value={timeStr}
        />
        {complaint.description && (
          <InfoRow
            icon={<Tag className="h-4 w-4" />}
            label="Description"
            value={complaint.description}
          />
        )}
      </div>

      {complaint.ai_analysis &&
        Object.keys(complaint.ai_analysis).length > 0 && (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              AI Analysis
            </div>
            <div className="space-y-2 text-sm">
              {complaint.ai_analysis.problem_detected && (
                <div>
                  <span className="text-gray-500">Problem Detected:</span>
                  <p className="mt-0.5 font-medium text-gray-900">
                    {complaint.ai_analysis.problem_detected}
                  </p>
                </div>
              )}
              {(complaint.ai_analysis.category ||
                complaint.ai_analysis.priority) && (
                <div className="flex gap-4">
                  {complaint.ai_analysis.category && (
                    <div>
                      <span className="text-gray-500">Category:</span>{" "}
                      <span className="font-medium capitalize text-gray-900">
                        {complaint.ai_analysis.category}
                      </span>
                    </div>
                  )}
                  {complaint.ai_analysis.priority && (
                    <div>
                      <span className="text-gray-500">Priority:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {complaint.ai_analysis.priority}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {complaint.ai_analysis.auto_assign_to && (
                <div>
                  <span className="text-gray-500">Suggested Assignment:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {complaint.ai_analysis.auto_assign_to}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          Status Timeline
        </h3>
        <div className="relative flex items-center justify-between px-2">
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
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${isDone ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"} ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-1.5 text-xs ${isDone ? "font-medium text-blue-600" : "text-gray-400"}`}
                >
                  {step}
                </span>
              </div>
            );
          })}
          <div className="absolute left-5 right-5 top-5 -z-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {(complaint.assigned_to || complaint.admin_remark) && (
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
          {complaint.assigned_to && (
            <InfoRow
              icon={<Wrench className="h-4 w-4" />}
              label="Assigned To"
              value={complaint.assigned_to}
            />
          )}
          {complaint.admin_remark && (
            <div>
              <span className="text-sm text-gray-500">Admin Remark:</span>
              <p className="mt-0.5 text-sm text-gray-900">
                {complaint.admin_remark}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="flex-1">
        <span className="text-xs text-gray-500">{label}</span>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}
