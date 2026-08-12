"use client";

// FITUR: Activity Log
// Log aktivitas persisten (login, CRUD user, CRUD monitoring, dll) — beda dari
// `recent_activity` di dashboard yang cuma derivasi dari data MonitoredSite.
// Konsumsi endpoint: /api/admin/activity-log/ (lihat backend/views_activity_log.py)

import { useCallback, useEffect, useState } from "react";
import { Search, LogIn, UserPlus, Pencil, Trash2, MonitorCheck, Bell, Settings } from "lucide-react";
import AdminLayout from "../../../components/AdminLayout";

const BASE = "/api/admin/activity-log";

const ACTION_META = {
  login: { icon: LogIn, color: "text-indigo-500", label: "Login" },
  user_create: { icon: UserPlus, color: "text-green-500", label: "Buat Pengguna" },
  user_update: { icon: Pencil, color: "text-amber-500", label: "Ubah Pengguna" },
  user_delete: { icon: Trash2, color: "text-red-500", label: "Hapus Pengguna" },
  monitoring_create: { icon: MonitorCheck, color: "text-green-500", label: "Buat Monitoring" },
  monitoring_update: { icon: Pencil, color: "text-amber-500", label: "Ubah Monitoring" },
  monitoring_delete: { icon: Trash2, color: "text-red-500", label: "Hapus Monitoring" },
  notification_sent: { icon: Bell, color: "text-indigo-500", label: "Kirim Notifikasi" },
  settings_update: { icon: Settings, color: "text-amber-500", label: "Ubah Pengaturan" },
};

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [count, setCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "15",
        ...(search ? { search } : {}),
        ...(actionType ? { action: actionType } : {}),
      });
      const res = await fetch(`${BASE}/?${params.toString()}`, { headers: authHeaders() });
      if (res.status === 403) throw new Error("Kamu tidak punya akses ke halaman ini.");
      if (!res.ok) throw new Error("Gagal memuat log aktivitas.");
      const data = await res.json();
      setLogs(data.results);
      setNumPages(data.num_pages);
      setCount(data.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <AdminLayout title="Log Aktivitas">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pengguna / deskripsi..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
            <select
              value={actionType}
              onChange={(e) => {
                setPage(1);
                setActionType(e.target.value);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
            >
              <option value="">Semua Aksi</option>
              {Object.entries(ACTION_META).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-2">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {loading ? (
              <p className="px-4 py-6 text-center text-slate-400 text-sm">Memuat data...</p>
            ) : logs.length === 0 ? (
              <p className="px-4 py-6 text-center text-slate-400 text-sm">Tidak ada log aktivitas yang cocok.</p>
            ) : (
              logs.map((log) => {
                const meta = ACTION_META[log.action] || { icon: Pencil, color: "text-slate-400", label: log.action };
                const Icon = meta.icon;
                return (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-medium">{log.actor_username}</span> — {meta.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span>{count} aktivitas total</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span>{page} / {numPages || 1}</span>
              <button
                disabled={page >= numPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}