"use client";

import { useEffect, useState } from "react";
import { Globe, MonitorCheck, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import api from "@/lib/api";

function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
}

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await api.get("dashboard/");
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6"></h1>

            {loading ? (
                <div className="animate-pulse space-y-6">
                    <div className="grid md:grid-cols-3 gap-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        ))}
                    </div>
                    <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
            ) : error ? (
                <div className="rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-4">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-3 gap-5 mb-8">
                        <StatCard
                            label="Total Monitoring"
                            value={data.total_sites}
                            icon={Globe}
                            accent="indigo"
                        />
                        <StatCard
                            label="Monitoring Aktif"
                            value={data.active_sites}
                            icon={MonitorCheck}
                            accent="green"
                        />
                        <StatCard
                            label="Perubahan Ditemukan"
                            value={data.changes_found}
                            icon={Sparkles}
                            accent="indigo"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow mb-8">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
                            Tren Perubahan 7 Hari Terakhir
                        </h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={data.chart}>
                                <defs>
                                    <linearGradient id="colorChanges" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="changes" stroke="#4f46e5" fillOpacity={1} fill="url(#colorChanges)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
                            Aktivitas Terbaru
                        </h2>

                        {data.recent_activity.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">Belum ada aktivitas monitoring.</p>
                        ) : (
                            <div className="space-y-2">
                                {data.recent_activity.map((act, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles className="h-4 w-4 text-indigo-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm text-slate-700 dark:text-slate-200">
                                                    Perubahan terdeteksi pada{" "}
                                                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">
                                                        {act.url}
                                                    </span>
                                                </p>
                                                <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                                                    {formatDateTime(act.checked_at)}
                                                </span>
                                            </div>
                                            {act.ai_summary && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                                    {act.ai_summary}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}