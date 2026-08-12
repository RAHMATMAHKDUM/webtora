export default function StatCard({ title, label, value, icon: Icon, accent = "indigo" }) {
    const accentMap = {
        indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        green: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
        slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm flex items-center gap-4">
            {Icon && (
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentMap[accent] || accentMap.indigo}`}>
                    <Icon size={22} />
                </div>
            )}
            <div>
                <h3 className="text-sm text-slate-500 dark:text-slate-400">{label || title}</h3>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
            </div>
        </div>
    );
}