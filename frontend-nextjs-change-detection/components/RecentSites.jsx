export default function RecentSites({ sites = [] }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 lg:p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Situs Terbaru</h2>
            <ul className="space-y-3">
                {sites.length === 0 && <li className="text-sm text-slate-400">Belum ada situs.</li>}
                {sites.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                        <div className="min-w-0">
                            <p className="text-slate-700 dark:text-slate-200 font-[JetBrains_Mono] truncate max-w-[200px]">{s.url}</p>
                            <p className="text-xs text-slate-400">oleh {s.user}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${s.active ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            {s.active ? "Aktif" : "Nonaktif"}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}