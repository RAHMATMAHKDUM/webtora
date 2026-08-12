"use client";

// FITUR: Monitoring Management
// List semua target monitoring dari SEMUA user + hapus/toggle aktif/lihat detail/export Excel.
// Admin tidak ikut campur mengedit konfigurasi monitoring milik user.
// Konsumsi endpoint: /api/admin/monitoring/ (lihat backend/views_admin_monitoring.py)

import { useCallback, useEffect, useState } from "react";
import { Search, Trash2, Power, Eye, Download } from "lucide-react";
import * as XLSX from "xlsx";
import api from "@/lib/api";
import MonitoringDetailModal from "@/components/MonitoringDetailModal";

const BASE = "admin/monitoring";

export default function MonitoringManagementPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [count, setCount] = useState(0);
  const [siteHistories, setSiteHistories] = useState({});

  const [detailSite, setDetailSite] = useState(null);
  const [deletingSite, setDeletingSite] = useState(null);
  const [deactivatingSite, setDeactivatingSite] = useState(null);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`${BASE}/`, {
        params: {
          page,
          page_size: 10,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      });
      setSites(res.data.results);
      setNumPages(res.data.num_pages);
      setCount(res.data.count);
    } catch (err) {
      setError("Gagal memuat daftar monitoring.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    sites.forEach((s) => loadHistory(s.id));
  }, [sites.length]);

  async function loadHistory(siteId) {
    try {
      const res = await api.get(`sites/${siteId}/history/`);
      setSiteHistories((prev) => ({ ...prev, [siteId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  }

  async function doToggleActive(site, nextActive) {
    try {
      await api.patch(`${BASE}/${site.id}/`, { is_active: nextActive });
      await fetchSites();
    } catch (err) {
      setError("Gagal mengubah status.");
    }
  }

  function handleToggleClick(site) {
    if (site.is_active) {
      setDeactivatingSite(site);
    } else {
      doToggleActive(site, true);
    }
  }

  async function confirmDeactivate() {
    if (!deactivatingSite) return;
    await doToggleActive(deactivatingSite, false);
    setDeactivatingSite(null);
  }

  async function handleDelete() {
    if (!deletingSite) return;
    try {
      await api.delete(`${BASE}/${deletingSite.id}/delete/`);
      setDeletingSite(null);
      await fetchSites();
    } catch (err) {
      setError("Gagal menghapus target monitoring.");
      setDeletingSite(null);
    }
  }

  async function handleExportExcel() {
    try {
      const res = await api.get(`${BASE}/`, {
        params: {
          page: 1,
          page_size: 10000,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      });

      const rows = res.data.results.map((s) => ({
        URL: s.url,
        Pengguna: s.user,
        Mode: s.mode === "fullpage" ? "Full Page + AI" : s.mode === "crop" ? "Crop Area" : "CSS Selector",
        "Email Notifikasi": s.notify_email && s.email_target ? s.email_target : "Tidak aktif",
        Telegram: s.notify_telegram ? "Aktif" : "Nonaktif",
        Status: s.is_active ? "Aktif" : "Nonaktif",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Monitoring");
      XLSX.writeFile(workbook, `daftar-monitoring-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      setError("Gagal mengambil data untuk export.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari URL / pengguna..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-indigo-700 text-white text-sm font-medium shrink-0"
        >
          <Download className="h-4 w-4" />
          Export ke Excel
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-2">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Pengguna</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Email Notifikasi</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : sites.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">Tidak ada target monitoring yang cocok.</td>
                </tr>
              ) : (
                sites.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                    <td className="px-4 py-3 font-[JetBrains_Mono] text-xs text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                      {s.url}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{s.user}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {s.mode === "fullpage" ? "🤖 Full Page + AI" : s.mode === "crop" ? "✂️ Crop Area" : "🎯 CSS Selector"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {s.notify_email && s.email_target ? (
                        <span className="text-slate-600 dark:text-slate-300">{s.email_target}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">Tidak aktif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {s.notify_telegram ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleClick(s)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.is_active
                            ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        {s.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailSite(s)}
                          className="p-1.5 rounded-md text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                          title="Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSite(s)}
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>{count} target monitoring total</span>
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

      <MonitoringDetailModal
        open={Boolean(detailSite)}
        onClose={() => setDetailSite(null)}
        site={detailSite}
        history={detailSite ? siteHistories[detailSite.id]?.results : []}
      />

      {deactivatingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeactivatingSite(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Nonaktifkan Monitoring</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Yakin mau nonaktifkan monitoring untuk <strong>{deactivatingSite.url}</strong>? Situs ini akan berhenti dicek sampai diaktifkan lagi.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeactivatingSite(null)}
                className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button onClick={confirmDeactivate} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700">
                Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeletingSite(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Hapus Target Monitoring</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Yakin mau hapus <strong>{deletingSite.url}</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingSite(null)}
                className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}