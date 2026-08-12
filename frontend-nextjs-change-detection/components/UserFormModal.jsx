"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function UserFormModal({ open, onClose, onSubmit, initialData }) {
    const isEdit = Boolean(initialData);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "USER",
        is_active: true,
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm({
                username: initialData.username || "",
                email: initialData.email || "",
                password: "",
                role: initialData.role || "USER",
                is_active: initialData.is_active ?? true,
            });
        } else {
            setForm({ username: "", email: "", password: "", role: "USER", is_active: true });
        }
        setError("");
    }, [initialData, open]);

    if (!open) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!isEdit && (!form.username.trim() || !form.email.trim() || !form.password.trim())) {
            setError("Username, email, dan password wajib diisi.");
            return;
        }

        setSaving(true);
        try {
            await onSubmit(form);
            onClose();
        } catch (err) {
            setError(err.message || "Gagal menyimpan.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {isEdit ? "Edit Pengguna" : "Tambah Pengguna"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-3 py-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={form.username}
                            disabled={isEdit}
                            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            {isEdit ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            placeholder={isEdit ? "••••••••" : ""}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                Role
                            </label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                Status
                            </label>
                            <select
                                value={form.is_active ? "active" : "inactive"}
                                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "active" }))}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 disabled:opacity-50"
                    >
                        {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
                    </button>
                </form>
            </div>
        </div>
    );
}