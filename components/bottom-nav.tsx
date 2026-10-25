"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import {
  BarChart3,
  ClipboardList,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";
import { clearDemoSession } from "@/lib/demo-auth";
import { toast } from "sonner";

const studentLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/complaint/new", label: "New", icon: Plus },
  { href: "/my-complaints", label: "My Complaints", icon: ListChecks },
];

const adminLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/complaints", label: "Complaints", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useRole();
  const isAdminPage = pathname.startsWith("/admin");
  const links = role === "admin" && isAdminPage ? adminLinks : studentLinks;

  if (pathname === "/login" || loading || !role) return null;

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
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 grid border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden",
        links.length === 4 ? "grid-cols-5" : "grid-cols-4",
      )}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium",
              active ? "text-blue-700" : "text-slate-500",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => void handleSignOut()}
        className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-500"
      >
        <LogOut className="h-5 w-5" />
        Sign out
      </button>
    </nav>
  );
}
