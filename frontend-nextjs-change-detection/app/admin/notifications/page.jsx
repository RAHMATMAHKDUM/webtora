"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const TYPE_META = {
  info: { icon: Info, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
};

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/admin/notifications`;

function authHeaders(json = true) {
  const token = localStorage.getItem("access");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ title: "", message: "", type: "info", target: "all" });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/`, {
        headers: authHeaders(false),
      });
      if (res.status === 403) throw new Error("Kamu tidak punya akses ke halaman ini.");
      if (!res.ok) throw new Error("Gagal memuat notifikasi.");
      const data = await res.json();
      setNotifs(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  async function handleSend(e) {
    e.preventDefault();
    setSendError("");
    setSendSuccess("");

    if (!form.title.trim() || !form.message.trim()) {
      setSendError("Judul dan pesan wajib diisi.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${BASE}/create/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Gagal mengirim notifikasi.");
      }
      setForm({ title: "", message: "", type: "info", target: "all" });
      setSendSuccess("Notifikasi berhasil dikirim.");
      fetchNotifs();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form kirim notifikasi */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sticky top-20">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Kirim Notifikasi
          </h2>

          {sendError && (
            <div className="mb-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-3 py-2">
              {sendError}
            </div>
          )}
          {sendSuccess && (
            <div className="mb-3 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs px-3 py-2">
              {sendSuccess}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Judul
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                placeholder="Pemeliharaan Server"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Pesan
              </label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 resize-none"
                placeholder="Server akan maintenance pukul 23.00 - 01.00 WIB."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Tipe
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Tujuan
                </label>
                <select
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                >
                  <option value="all">Semua Pengguna</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sending ? "Mengirim..." : "Kirim Notifikasi"}
            </button>
          </form>
        </div>
      </div>

      {/* Histori notifikasi */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Histori Notifikasi
          </h2>

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-3 py-2">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-400">Memuat...</p>
          ) : notifs.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada notifikasi yang dikirim.</p>
          ) : (
            <ul className="space-y-2">
              {notifs.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.info;
                const Icon = meta.icon;
                return (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3"
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {n.title}
                        </p>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {formatDateTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tujuan: {n.target}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
