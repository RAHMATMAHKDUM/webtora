"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Search, Moon, Sun } from "lucide-react";

interface SiteNavProps {
    dark: boolean;
    setDark: (value: boolean) => void;
}

export default function SiteNav({ dark, setDark }: SiteNavProps) {
    const router = useRouter();

    return (
        <header className={`w-full border-b sticky top-0 z-40 backdrop-blur-xl transition-colors duration-500 ${dark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-100"}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
                <Link href="/landing_page" className="flex items-center gap-2.5 shrink-0 group">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
    <img src="/image/Logo fiks.png" alt="SiteWatch" className="w-full h-full object-cover" />
</div>
                    <span className={`font-bold text-lg tracking-tight ${dark ? "text-slate-100" : "text-slate-800"}`}>
                        WebTora
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 shrink-0">
                    <Link href="/landing_page#fitur" className={`nav-underline text-[15px] transition ${dark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"}`}>Fitur</Link>
                    <Link href="/landing_page#cara-kerja" className={`nav-underline text-[15px] transition ${dark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"}`}>Cara Kerja</Link>
                    <Link href="/landing_page/tentang" className={`nav-underline text-[15px] transition ${dark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"}`}>Tentang</Link>
                </nav>

                <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="relative hidden lg:block w-full max-w-[220px]">
                        <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${dark ? "text-slate-500" : "text-gray-400"}`} />
                        <input
                            placeholder="Cari website..."
                            className={`
                                w-full pl-9 pr-3 py-2.5 rounded-full text-sm outline-none border transition-all duration-200
                                focus:ring-4 focus:border-indigo-500 focus:scale-[1.02]
                                ${dark
                                    ? "bg-slate-800/70 border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-indigo-500/15"
                                    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-indigo-500/10 focus:bg-white"}
                            `}
                        />
                    </div>

                    <button
                        title={dark ? "Mode terang" : "Mode gelap"}
                        onClick={() => setDark(!dark)}
                        className={`p-2.5 rounded-xl transition-all duration-200 active:scale-90 shrink-0 ${dark ? "hover:bg-slate-800 text-amber-300" : "hover:bg-gray-100 text-slate-500"}`}
                    >
                        {dark ? <Sun size={19} /> : <Moon size={19} />}
                    </button>

                    <button
                        className="btn-press bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold text-[15px] shadow-sm hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 transition-colors shrink-0"
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </button>
                </div>
            </div>

            <style>{`
                .nav-underline { position: relative; }
                .nav-underline::after {
                    content: ''; position: absolute; left: 0; bottom: -4px; width: 0%; height: 2px;
                    background: currentColor; transition: width .25s ease;
                }
                .nav-underline:hover::after { width: 100%; }
                .btn-press { transition: transform .15s ease, box-shadow .2s ease; }
                .btn-press:hover { transform: translateY(-2px); }
                .btn-press:active { transform: translateY(0) scale(0.97); }
            `}</style>
        </header>
    );
}