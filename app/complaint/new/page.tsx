"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { categories, getCategory } from "@/lib/categories";
import { uploadComplaintPhoto } from "@/lib/storage";
import { supabase, type Location } from "@/lib/supabase-client";
import { useRole } from "@/hooks/use-role";

type SelectedPhoto = {
  id: string;
  file: File;
};

const fieldClass =
  "mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function NewComplaintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, userId, loading: roleLoading } = useRole();
  const studentId = userId ?? "";
  const queryCategory = searchParams.get("category") ?? "";
  const [categoryId, setCategoryId] = useState(
    () => getCategory(queryCategory)?.id ?? "",
  );
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");
  const [location, setLocation] = useState("");
  const [room, setRoom] = useState("");
  const [problemType, setProblemType] = useState("");
  const [description, setDescription] = useState("");
  const [studentName, setStudentName] = useState("");
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = useMemo(
    () => getCategory(categoryId),
    [categoryId],
  );

  useEffect(() => {
    if (!roleLoading && role !== "student") {
      router.replace(role === "admin" ? "/admin" : "/login");
    }
  }, [role, roleLoading, router]);

  useEffect(() => {
    if (!queryCategory || !getCategory(queryCategory)) return;
    setCategoryId(queryCategory);
    setIsChangingCategory(false);
  }, [queryCategory]);

  useEffect(() => {
    if (!categoryId) {
      setLocations([]);
      setLocation("");
      return;
    }

    let active = true;
    async function fetchLocations() {
      setLocationsLoading(true);
      setLocationsError("");
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("type", categoryId)
        .order("name");

      if (!active) return;
      if (error) {
        console.error("Could not load complaint locations:", error);
        setLocationsError("Locations could not be loaded. Please try again.");
      } else {
        setLocations((data as Location[]) || []);
      }
      setLocationsLoading(false);
    }

    void fetchLocations();
    return () => {
      active = false;
    };
  }, [categoryId]);

  function chooseCategory(id: string) {
    setCategoryId(id);
    setLocation("");
    setProblemType("");
    setIsChangingCategory(false);
    router.replace(`/complaint/new?category=${encodeURIComponent(id)}`, {
      scroll: false,
    });
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const remaining = 3 - photos.length;
    if (files.length > remaining) {
      toast.error("You can upload up to 3 photos.");
    }

    const allowedFiles = files.slice(0, remaining);
    const oversizedFile = allowedFiles.find((file) => file.size > 8 * 1024 * 1024);
    if (oversizedFile) {
      toast.error("Each photo must be smaller than 8 MB.");
      event.target.value = "";
      return;
    }
    if (allowedFiles.some((file) => !file.type.startsWith("image/"))) {
      toast.error("Please select image files only.");
      event.target.value = "";
      return;
    }

    setPhotos((current) => [
      ...current,
      ...allowedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
      })),
    ]);
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCategory || !studentId || submitting) return;
    if (!location || !problemType) {
      toast.error("Select a location and problem type before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const photo of photos) {
        const imageUrl = await uploadComplaintPhoto(photo.file);
        if (!imageUrl) {
          toast.error(`Could not upload ${photo.file.name}. Please try again.`);
          return;
        }
        imageUrls.push(imageUrl);
      }

      const { error } = await supabase
        .from("complaints")
        .insert({
          student_id: studentId,
          student_name: studentName.trim() || "Anonymous",
          category: selectedCategory.id,
          location_name: location,
          room_no: room.trim(),
          problem_type: problemType,
          description: description.trim(),
          image_urls: imageUrls,
          ai_analysis: {},
          priority: "Medium",
          status: "Pending",
        });

      if (error) {
        console.error("Could not submit complaint:", error);
        toast.error("Your complaint could not be submitted. Please try again.");
        return;
      }

      toast.success("Complaint submitted successfully.");
      router.push("/my-complaints");
    } catch (error) {
      console.error("Could not submit complaint:", error);
      toast.error("Your complaint could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (roleLoading || role !== "student") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            New Complaint
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Take a photo and report the issue
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Category</h2>
            {selectedCategory && !isChangingCategory && (
              <button
                type="button"
                onClick={() => setIsChangingCategory(true)}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Change
              </button>
            )}
          </div>

          {isChangingCategory || !selectedCategory ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const selected = category.id === categoryId;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => chooseCategory(category.id)}
                    aria-pressed={selected}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      selected
                        ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} text-white`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {category.label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {category.labelSubtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`flex min-h-[66px] items-center gap-4 rounded-xl border-2 ${selectedCategory.borderColor} ${selectedCategory.bgColor} px-4 py-2`}>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${selectedCategory.gradient} text-white shadow-sm`}>
                <selectedCategory.icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">
                  {selectedCategory.label}
                </span>
                <span className="block text-sm text-slate-500">
                  {selectedCategory.labelSubtitle}
                </span>
              </span>
            </div>
          )}
        </section>

        {selectedCategory && (
          <>
            <section>
              <label
                htmlFor="location"
                className="text-sm font-semibold text-slate-800"
              >
                Location / Block
              </label>
              <select
                id="location"
                required
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                disabled={locationsLoading}
                className={fieldClass}
              >
                <option value="">
                  {locationsLoading ? "Loading locations..." : "Select location"}
                </option>
                {locations.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              {locationsError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {locationsError}
                </p>
              )}
            </section>

            <section>
              <label
                htmlFor="room"
                className="text-sm font-semibold text-slate-800"
              >
                Room No / Specific Area
              </label>
              <input
                id="room"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="e.g., A-101, Ground Floor..."
                className={fieldClass}
              />
            </section>

            <section>
              <label
                htmlFor="problem-type"
                className="text-sm font-semibold text-slate-800"
              >
                Problem Type
              </label>
              <select
                id="problem-type"
                required
                value={problemType}
                onChange={(event) => setProblemType(event.target.value)}
                className={fieldClass}
              >
                <option value="">Select problem type</option>
                {selectedCategory.problemTypes.map((problem) => (
                  <option key={problem} value={problem}>
                    {problem}
                  </option>
                ))}
              </select>
            </section>

            <section>
              <label
                htmlFor="description"
                className="text-sm font-semibold text-slate-800"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the problem in detail..."
                className={`${fieldClass} h-auto min-h-28 resize-y py-3`}
              />
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  Upload Photos (max 3)
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {photos.map(({ id, file }) => (
                  <div
                    key={id}
                    className="flex min-h-24 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <ImagePlus className="h-5 w-5 shrink-0 text-blue-600" />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((current) =>
                          current.filter((photo) => photo.id !== id),
                        )
                      }
                      aria-label={`Remove ${file.name}`}
                      className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700">
                    <Upload className="h-5 w-5" />
                    Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
            </section>

            <section>
              <label
                htmlFor="student-name"
                className="text-sm font-semibold text-slate-800"
              >
                Your Name (optional)
              </label>
              <input
                id="student-name"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Anonymous or your name"
                className={fieldClass}
              />
            </section>

            <div className="border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={submitting || !studentId || locationsLoading}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit Complaint
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
