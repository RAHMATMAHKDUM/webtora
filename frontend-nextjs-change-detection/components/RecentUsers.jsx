export default function RecentUsers({ users = [] }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 lg:p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Pengguna Terbaru</h2>
            <ul className="space-y-3">
                {users.length === 0 && <li className="text-sm text-slate-400">Belum ada pengguna.</li>}
                {users.map((u) => (
                    <li key={u.id} className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-slate-700 dark:text-slate-200 font-medium">{u.username}</p>
                            <p className="text-xs text-slate-400">{u.email || "-"}</p>
                        </div>
                        <span className="text-xs text-slate-400">
                            {new Date(u.joined).toLocaleDateString("id-ID")}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}