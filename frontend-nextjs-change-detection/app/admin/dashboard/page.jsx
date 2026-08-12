"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, MonitorCheck, MonitorX, Globe, AlertTriangle, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import ActivityChart from "@/components/ActivityChart";
import RecentUsers from "@/components/RecentUsers";
import RecentSites from "@/components/RecentSites";
import { getAdminDashboard } from "@/lib/adminApi";

function formatDateTime(iso) {
    return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchDashboard() {
            try {
                const json = await getAdminDashboard();
                if (isMounted) setData(json);
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.status === 403
                            ? "Kamu tidak punya akses ke halaman ini."
                            : "Gagal memuat data dashboard."
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchDashboard();
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center gap-3 overflow-hidden relative"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-2.5 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                <div className="h-4 w-14 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
                    <div className="h-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 p-6 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Terjadi kesalahan</p>
                    <p className="text-sm text-red-500/90 dark:text-red-400/80 mt-0.5">{error}</p>
                </div>
            </div>
        );
    }

    const { stats, latest_users, latest_sites, recent_activity, chart } = data;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Total Pengguna" value={stats.total_users} icon={Users} accent="indigo" />
                <StatCard label="Admin" value={stats.admin_count} icon={ShieldCheck} accent="indigo" />
                <StatCard label="Pengguna Biasa" value={stats.user_count} icon={Users} accent="slate" />
                <StatCard label="Total Situs Dipantau" value={stats.total_sites} icon={Globe} accent="indigo" />
                <StatCard label="Situs Aktif" value={stats.active_sites} icon={MonitorCheck} accent="green" />
                <StatCard label="Situs Nonaktif" value={stats.inactive_sites} icon={MonitorX} accent="slate" />
            </div>

            <ActivityChart data={chart} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentUsers users={latest_users} />
                <RecentSites sites={latest_sites} />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 lg:p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Activity size={15} className="text-indigo-500" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Aktivitas Terbaru</h2>
                </div>

                {recent_activity.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-3">
                            <Activity size={18} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-400">Belum ada aktivitas.</p>
                    </div>
                ) : (
                    <ul className="relative">
                        {recent_activity.map((act, i) => (
                            <li key={i} className="flex items-start gap-3.5 relative pb-5 last:pb-0">
                                {i !== recent_activity.length - 1 && (
                                    <span className="absolute left-[5px] top-4 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
                                )}
                                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-500/10 shrink-0 relative z-10" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                        {act.message}{" "}
                                        {act.url && (
                                            <span className="inline-block font-[JetBrains_Mono] text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300 px-1.5 py-0.5 rounded-md align-middle">
                                                {act.url}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(act.time)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}