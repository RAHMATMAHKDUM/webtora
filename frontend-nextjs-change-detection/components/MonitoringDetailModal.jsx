"use client";
import { X, Globe, Bell, Send, Clock, Sparkles } from "lucide-react";

const MODE_LABEL = {
    selector: "🎯 CSS Selector",
    crop: "✂️ Crop Area",
    fullpage: "🤖 Full Page + AI",
};

function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

export default function MonitoringDetailModal({ open, onClose, site, history }) {
    if (!open || !site) return null;

    const modeKey = site.mode || site.monitor_type;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Detail Monitoring</h2>
                        <p className="text-xs text-slate-400 font-[JetBrains_Mono] truncate max-w-md">{site.url}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Info dasar */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                <Globe size={13} /> Pengguna
                            </div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{site.user}</div>
                        </div>
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                <Sparkles size={13} /> Mode
                            </div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {MODE_LABEL[modeKey] || modeKey}
                            </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                <Clock size={13} /> Interval
                            </div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {site.check_interval_minutes ? `${site.check_interval_minutes} menit` : "—"}
                            </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                <Bell size={13} /> Status
                            </div>
                            <div className={`text-sm font-semibold ${site.is_active ? "text-green-600" : "text-slate-500"}`}>
                                {site.is_active ? "Aktif" : "Nonaktif"}
                            </div>
                        </div>
                    </div>

                    {/* Riwayat cek */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Riwayat Pengecekan</h3>
                        {!history || history.length === 0 ? (
                            <p className="text-sm text-slate-400">Belum ada riwayat pengecekan.</p>
                        ) : (
                            <div className="space-y-2">
                                {history.map((log) => (
                                    <div
                                        key={log.id}
                                        className="rounded-xl border border-slate-100 dark:border-slate-800 p-3"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-400">{formatDateTime(log.checked_at)}</span>
                                            {log.error ? (
                                                <span className="text-xs font-medium text-red-500">Error</span>
                                            ) : log.changed ? (
                                                <span className="text-xs font-medium text-green-600">● Berubah</span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Tidak berubah</span>
                                            )}
                                        </div>
                                        {log.error && (
                                            <p className="text-xs text-red-500">{log.error}</p>
                                        )}
                                        {log.ai_summary && (
                                            <div className="mt-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 p-2.5">
                                                <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                                                    <Sparkles size={11} /> Analisis AI
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    {log.ai_summary}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}