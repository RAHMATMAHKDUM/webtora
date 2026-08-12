"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Send, CheckCircle2, XCircle, Trash2, Loader2, X } from "lucide-react";

export default function TelegramConnect() {
    const [status, setStatus] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [polling, setPolling] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState(null);

    async function loadStatus() {
        try {
            const res = await api.get("telegram/status/");
            setStatus(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadStatus();
    }, []);

    useEffect(() => {
        if (!polling) return;
        const interval = setInterval(loadStatus, 3000);
        return () => clearInterval(interval);
    }, [polling]);

    useEffect(() => {
        if (status?.connected) setPolling(false);
    }, [status]);

    async function handleConnect() {
        setConnecting(true);
        setMessage(null);
        try {
            const res = await api.post("telegram/generate-link/");
            window.open(res.data.link, "_blank");
            setPolling(true);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Gagal membuat link Telegram." });
        } finally {
            setConnecting(false);
        }
    }

    async function handleDisconnect() {
        setDisconnecting(true);
        setMessage(null);
        try {
            await api.post("telegram/disconnect/");
            await loadStatus();
            setMessage({ type: "success", text: "Telegram berhasil diputuskan." });
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Gagal memutuskan koneksi." });
        } finally {
            setDisconnecting(false);
            setShowConfirm(false);
        }
    }

    if (!status) {
        return <p className="text-sm text-slate-400">Memuat status Telegram...</p>;
    }

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Send className="h-4 w-4" />
                Notifikasi Telegram
            </h2>

            {/* Pesan sukses/error */}
            {message && (
                <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                    message.type === "success"
                        ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                }`}>
                    {message.text}
                </div>
            )}

            {status.connected ? (
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Terhubung{status.phone_number ? ` (${status.phone_number})` : ""}
                    </div>
                    {/* Tombol PUTUSKAN yang sudah diperbaiki */}
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={disconnecting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                        {disconnecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Putuskan
                    </button>
                </div>
            ) : (
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <XCircle className="h-4 w-4" />
                        Belum terhubung
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        {connecting ? "Membuka..." : "Hubungkan Telegram"}
                    </button>
                    {polling && (
                        <p className="text-xs text-slate-400 mt-2">
                            Menunggu konfirmasi... klik &quot;Start&quot; di jendela Telegram yang baru terbuka.
                        </p>
                    )}
                </div>
            )}

            {/* Modal Konfirmasi */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                Konfirmasi Pemutusan
                            </h4>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Yakin ingin memutuskan koneksi Telegram? Anda tidak akan menerima notifikasi lagi.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {disconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Ya, putuskan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}