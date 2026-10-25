"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, Sparkles, ImageIcon } from "lucide-react";
import { supabase, type Complaint } from "@/lib/supabase-client";
import { categories, priorityColors, statusColors } from "@/lib/categories";
import { useRole } from "@/hooks/use-role";

const statuses = ["Pending", "In Progress", "Resolved"];
const priorities = ["High", "Medium", "Low"];

export default function AdminComplaintsList() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (!roleLoading && !role) router.replace("/login");
  }, [role, roleLoading, router]);

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get(
      "category",
    );
    if (
      requestedCategory &&
      categories.some((category) => category.id === requestedCategory)
    ) {
      setCategoryFilter(requestedCategory);
    }
  }, []);

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
        setError("Could not load complaints. Please try again.");
        setLoading(false);
        return;
      }

      setComplaints((data as Complaint[]) || []);
      setError("");
      setLoading(false);
    }

    void fetchComplaints();

    const channel = supabase
      .channel("admin-list-realtime")
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

  const query = search.toLowerCase();
  const filtered = complaints.filter((complaint) => {
    const matchesSearch =
      !query ||
      complaint.problem_type.toLowerCase().includes(query) ||
      complaint.location_name.toLowerCase().includes(query) ||
      complaint.student_name.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || complaint.category === categoryFilter;
    const matchesPriority =
      priorityFilter === "all" || complaint.priority === priorityFilter;

    return (
      matchesSearch && matchesStatus && matchesCategory && matchesPriority
    );
  });

  if (roleLoading || (role === "admin" && loading)) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-8 md:px-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center md:px-6">
        <p className="text-gray-500">
          Admin access is required to view complaints.
        </p>
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
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-bold">All Complaints</h1>
        <p className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? "complaint" : "complaints"}{" "}
          found
        </p>
      </div>

      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by problem, location, or student..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FilterSelect
            label="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <option value="all">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Filter by category"
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Filter by priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
          >
            <option value="all">All Priority</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>

      {error ? (
        <p role="alert" className="py-10 text-center text-sm text-red-600">
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Filter className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">
            No complaints match your filters
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((complaint) => {
            const category = categories.find(
              (item) => item.id === complaint.category,
            );

            return (
              <Link
                key={complaint.id}
                href={`/admin/complaints/${complaint.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category?.gradient || "from-gray-400 to-gray-500"} text-white`}
                >
                  {category && <category.icon className="h-6 w-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-gray-900">
                      {complaint.problem_type}
                    </p>
                    {complaint.image_urls.length > 0 && (
                      <ImageIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {complaint.location_name}
                      {complaint.room_no && ` - ${complaint.room_no}`}
                    </span>
                  </div>
                  {complaint.ai_analysis?.problem_detected && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {complaint.ai_analysis.problem_detected}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityColors[complaint.priority] || priorityColors.Medium}`}
                  >
                    {complaint.priority}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[complaint.status] || "border-gray-300 bg-gray-100 text-gray-700"}`}
                  >
                    {complaint.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
    >
      {children}
    </select>
  );
}
