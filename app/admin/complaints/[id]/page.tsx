"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Sparkles,
  ImageIcon,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, type Complaint } from "@/lib/supabase-client";
import { getCategory, departmentOptions } from "@/lib/categories";
import { useRole } from "@/hooks/use-role";

const statuses = ["Pending", "In Progress", "Resolved"];
const priorities = ["High", "Medium", "Low"];

export default function AdminComplaintDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!roleLoading && !role) router.replace("/login");
  }, [role, roleLoading, router]);

  useEffect(() => {
    if (roleLoading) return;
    if (role !== "admin") {
      setLoading(false);
      return;
    }
    if (!params.id) {
      setLoadError("Complaint not found.");
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchComplaint() {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setLoadError("Could not load this complaint. Please try again.");
      } else if (data) {
        const result = data as Complaint;
        setComplaint(result);
        setStatus(result.status);
        setPriority(result.priority);
        setAssignedTo(result.assigned_to || "");
        setRemark(result.admin_remark || "");
      }
      setLoading(false);
    }

    void fetchComplaint();
    return () => {
      active = false;
    };
  }, [params.id, role, roleLoading]);

  async function handleSave() {
    if (!complaint || saving) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .update({
          status,
          priority,
          assigned_to: assignedTo,
          admin_remark: remark,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaint.id)
        .select("*")
        .maybeSingle();

      if (error) {
        toast.error("Failed to update complaint");
        return;
      }
      if (!data) {
        toast.error("Complaint could not be found or updated");
        return;
      }

      const updatedComplaint = data as Complaint;
      setComplaint(updatedComplaint);
      setStatus(updatedComplaint.status);
      setPriority(updatedComplaint.priority);
      setAssignedTo(updatedComplaint.assigned_to || "");
      setRemark(updatedComplaint.admin_remark || "");
      toast.success("Complaint updated successfully");
    } catch (error) {
      console.error("Failed to update complaint:", error);
      toast.error("Failed to update complaint");
    } finally {
      setSaving(false);
    }
  }

  if (loading || roleLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-gray-500">Admin access is required to view this complaint.</p>
        <button
          type="button"
          className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => router.push("/")}
        >
          Go to Home
        </button>
      </div>
    );
  }

  if (loadError || !complaint) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className={loadError ? "text-red-600" : "text-gray-500"} role={loadError ? "alert" : undefined}>
          {loadError || "Complaint not found"}
        </p>
        <button
          type="button"
          className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => router.push("/admin/complaints")}
        >
          Back to Complaints
        </button>
      </div>
    );
  }

  const category = getCategory(complaint.category);
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
        <h1 className="text-lg font-bold">Complaint Management</h1>
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
        </div>
      </div>

      {complaint.image_urls.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700">
            <ImageIcon className="h-4 w-4" /> Photos ({complaint.image_urls.length})
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
                  alt={`Photo ${index + 1}`}
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
        <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date" value={timeStr} />
        {complaint.description && (
          <InfoRow
            icon={<Sparkles className="h-4 w-4" />}
            label="Description"
            value={complaint.description}
          />
        )}
      </div>

      {complaint.ai_analysis &&
        Object.keys(complaint.ai_analysis).length > 0 && (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" /> AI Analysis
            </div>
            <div className="space-y-2 text-sm">
              {complaint.ai_analysis.problem_detected && (
                <div>
                  <span className="text-gray-500">Problem:</span>
                  <p className="mt-0.5 font-medium text-gray-900">
                    {complaint.ai_analysis.problem_detected}
                  </p>
                </div>
              )}
              {(complaint.ai_analysis.category ||
                complaint.ai_analysis.auto_assign_to) && (
                <div className="flex flex-wrap gap-4">
                  {complaint.ai_analysis.category && (
                    <div>
                      <span className="text-gray-500">Category:</span>{" "}
                      <span className="font-medium capitalize text-gray-900">
                        {complaint.ai_analysis.category}
                      </span>
                    </div>
                  )}
                  {complaint.ai_analysis.auto_assign_to && (
                    <div>
                      <span className="text-gray-500">Suggested:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {complaint.ai_analysis.auto_assign_to}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold text-gray-900">Manage Complaint</h3>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {priorities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Assign To">
          <select
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">Select department / worker</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </Field>

        <Field label="Admin Remark">
          <textarea
            placeholder="Add a remark or note about this complaint..."
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            rows={3}
            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>

        <button
          type="button"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-gray-700">
      <span>{label}</span>
      {children}
    </label>
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
