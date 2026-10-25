"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  GraduationCap,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Shield,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { supabase } from "@/lib/supabase-client";
import { clearDemoSession } from "@/lib/demo-auth";
import { toast } from "sonner";

const defaultLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/complaint/new", label: "New Complaint", icon: Plus },
  { href: "/my-complaints", label: "My Complaints", icon: ListChecks },
];

const adminLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/complaints", label: "Complaints", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function DesktopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const isAdminPage = pathname.startsWith("/admin");
  const links = role === "admin" && isAdminPage ? adminLinks : defaultLinks;

  if (pathname === "/login" || roleLoading || !role) return null;

  async function handleSignOut() {
    clearDemoSession();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Could not sign out:", error);
      toast.error("Could not sign out. Please try again.");
      return;
    }
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white/95 backdrop-blur md:block">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="text-xl leading-none tracking-[-0.04em]">CollegeFix</span>
        </Link>

        <div className="flex items-center gap-1.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {role && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                {role === "admin" ? (
                  <Shield className="h-3.5 w-3.5" />
                ) : (
                  <GraduationCap className="h-3.5 w-3.5" />
                )}
              </span>
              {role === "admin" ? "Admin" : "Student"}
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
