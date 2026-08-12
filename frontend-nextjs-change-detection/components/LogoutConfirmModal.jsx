"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function LogoutConfirmModal({ open, onClose }) {
    const router = useRouter();
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Keluar dari akun?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Kamu harus login lagi untuk mengakses dashboard.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => logout(router)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}