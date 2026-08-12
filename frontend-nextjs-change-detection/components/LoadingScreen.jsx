export default function LoadingScreen({ dark = false }) {
    return (
        <div
            className={`min-h-screen flex flex-col items-center justify-center gap-4 transition-colors duration-500 ${
                dark ? "bg-slate-900" : "bg-white"
            }`}
        >
            <div className="relative w-12 h-12">
                <div
                    className={`absolute inset-0 rounded-full border-4 ${
                        dark ? "border-slate-700" : "border-slate-200"
                    }`}
                />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            </div>
            <p className={`text-sm font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Memuat...
            </p>
        </div>
    );
}