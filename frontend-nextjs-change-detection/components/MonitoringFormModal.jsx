export default function MonitoringFormModal({ open, onClose, onSaved, initialData }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    {initialData ? "Edit Monitoring" : "Tambah Monitoring"}
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                    Form belum lengkap — placeholder sementara.
                </p>
                <button
                    onClick={onClose}
                    className="w-full rounded-lg bg-slate-200 dark:bg-slate-800 py-2 text-sm"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
}
