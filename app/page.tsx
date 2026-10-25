'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, ArrowRight, Zap, TrendingUp, Clock, CheckCircle2, GraduationCap, Shield } from 'lucide-react';
import { categories } from '@/lib/categories';
import { supabase } from '@/lib/supabase-client';
import { useRole } from '@/hooks/use-role';

export default function Home() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !role) router.replace('/login');
  }, [role, roleLoading, router]);

  useEffect(() => {
    async function fetchStats() {
      if (roleLoading) return;
      if (role !== 'admin') {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { count: total } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true });
      const { count: pending } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');
      const { count: inProgress } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'In Progress');
      const { count: resolved } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Resolved');

      setStats({
        total: total || 0,
        pending: pending || 0,
        inProgress: inProgress || 0,
        resolved: resolved || 0,
      });
      setLoading(false);
    }
    void fetchStats();
  }, [role, roleLoading]);

  if (roleLoading || !role) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div id="home" className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-[0_30px_60px_rgba(37,99,235,0.35)] md:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">CollegeFix</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                {role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-black leading-tight md:text-[2.75rem]">
            {role === 'admin' ? 'Admin Dashboard Overview' : 'Report Issues, Get Them Fixed'}
          </h1>
          <p className="mb-5 max-w-xl text-sm text-blue-100 md:text-lg">
            {role === 'admin'
              ? 'Monitor all college complaints, assign workers, and track resolution progress in real-time.'
              : 'Add photos to help explain any college maintenance issue. Submit your complaint and track its status while the campus team reviews it.'}
          </p>
          {role === 'student' && (
            <Link
              href="/complaint/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Zap className="h-4 w-4" />
              File a Complaint
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {role === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Shield className="h-4 w-4" />
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {role === 'admin' && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Total"
          labelSubtitle="All time"
          value={loading ? '...' : stats.total}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending"
          labelSubtitle="Awaiting action"
          value={loading ? '...' : stats.pending}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          icon={<Wrench className="h-5 w-5" />}
          label="In Progress"
          labelSubtitle="Being fixed"
          value={loading ? '...' : stats.inProgress}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Resolved"
          labelSubtitle="Issue fixed"
          value={loading ? '...' : stats.resolved}
          color="bg-green-50 text-green-600"
        />
      </div>
      )}

      {/* Student: Category Grid */}
      {role === 'student' && (
        <>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Choose Category
            </h2>
            <p className="text-sm text-gray-500">What&apos;s the problem? Select a category</p>
          </div>

          <div id="categories" className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/complaint/new?category=${cat.id}`}
                  className={`group relative overflow-hidden rounded-2xl border-2 ${cat.borderColor} ${cat.bgColor} p-5 transition-all hover:shadow-lg hover:-translate-y-1 active:translate-y-0`}
                >
                  <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${cat.gradient} opacity-10 transition-transform group-hover:scale-150`} />
                  <div className="relative z-10">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-white shadow-md mb-3`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-0.5">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-gray-500">{cat.labelSubtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6">
        {role === 'student' && (
          <Link
            href="/my-complaints"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-gray-900">My Complaints</h3>
              <p className="text-sm text-gray-500">Track your complaints status</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </Link>
        )}
        {role === 'admin' && (
          <>
            <Link
              href="/admin"
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
            >
              <div>
                <h3 className="font-bold text-gray-900">Admin Dashboard</h3>
                <p className="text-sm text-gray-500">Manage all complaints</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
            >
              <div>
                <h3 className="font-bold text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500">Department-wise analysis</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function RoleSelector({ onSelect }: { onSelect: (role: 'student' | 'admin') => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-10 md:py-20">
      <div className="text-center mb-8">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg mb-4">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-1">CollegeFix</h1>
        <p className="text-sm text-gray-500">College Complaint Management System</p>
      </div>

      <p className="text-center text-gray-600 font-medium mb-6">Who are you?</p>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('student')}
          className="w-full flex items-center gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-gray-900 text-lg">Student</h3>
            <p className="text-sm text-gray-500">File complaints and track their status</p>
          </div>
          <ArrowRight className="h-5 w-5 text-blue-400" />
        </button>

        <button
          onClick={() => onSelect('admin')}
          className="w-full flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-gray-50 p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-md">
            <Shield className="h-7 w-7" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-gray-900 text-lg">Admin / Principal</h3>
            <p className="text-sm text-gray-500">Manage complaints, assign workers, view reports</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  labelSubtitle,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  labelSubtitle: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-[10px] text-gray-400">{labelSubtitle}</p>
    </div>
  );
}
