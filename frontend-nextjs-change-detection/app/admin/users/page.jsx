"use client";

// FITUR: User Management
// List semua pengguna + search + filter role/status + pagination + edit + export Excel.
// Konsumsi endpoint: /api/admin/users/ (lihat backend/views_admin_users.py)

import { useCallback, useEffect, useState } from "react";
import { Search, Pencil, Trash2, ShieldCheck, Download } from "lucide-react";
import * as XLSX from "xlsx";
import api from "@/lib/api";
import UserFormModal from "@/components/UserFormModal";

const BASE = "admin/users";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [count, setCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`${BASE}/`, {
        params: {
          page,
          page_size: 10,
          ...(search ? { search } : {}),
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
        },
      });
      setUsers(res.data.results);
      setNumPages(res.data.num_pages);
      setCount(res.data.count);
    } catch (err) {
      setError("Gagal memuat daftar pengguna.");
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreateOrUpdate(form) {
    const isEdit = Boolean(editingUser);
    const url = isEdit ? `${BASE}/${editingUser.id}/` : `${BASE}/create/`;
    const body = isEdit ? { ...form, password: form.password || undefined } : form;

    try {
      if (isEdit) {
        await api.patch(url, body);
      } else {
        await api.post(url, body);
      }
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Gagal menyimpan pengguna.");
    }

    fetchUsers().catch((err) => console.error("Gagal refresh tabel:", err));
  }

  async function handleDelete() {
    if (!deletingUser) return;
    try {
      await api.delete(`${BASE}/${deletingUser.id}/delete/`);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menghapus pengguna.");
      setDeletingUser(null);
    }
  }

  async function handleExportExcel() {
    try {
      const res = await api.get(`${BASE}/`, {
        params: {
          page: 1,
          page_size: 10000,
          ...(search ? { search } : {}),
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
        },
      });

      const rows = res.data.results.map((u) => ({
        Username: u.username,
        Email: u.email || "-",
        Role: u.role,
        Status: u.is_active ? "Aktif" : "Nonaktif",
        "Tanggal Bergabung": formatDate(u.date_joined),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pengguna");
      XLSX.writeFile(workbook, `daftar-pengguna-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
              placeholder="Cari username / email..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
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
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bergabung</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Tidak ada pengguna yang cocok.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {u.username}
                        {u.role === "ADMIN" && <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "ADMIN"
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.is_active
                            ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-[JetBrains_Mono] text-xs">
                      {formatDate(u.date_joined)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>{count} pengguna total</span>
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

      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateOrUpdate} initialData={editingUser} />

      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeletingUser(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Hapus Pengguna</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Yakin mau hapus <strong>{deletingUser.username}</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingUser(null)}
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