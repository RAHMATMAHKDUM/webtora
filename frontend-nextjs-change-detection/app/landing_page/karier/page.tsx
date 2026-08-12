"use client";
import { useDarkMode } from "@/hooks/useDarkMode";
import SiteNav from "@/components/landing_page/SiteNav";
import SiteFooter from "@/components/landing_page/SiteFooter";
import { MapPin, Briefcase } from "lucide-react";

/* Contoh/placeholder — ganti dengan lowongan asli */
const JOBS = [
    { title: "Frontend Engineer", type: "Full-time", location: "Remote" },
    { title: "Backend Engineer (Go/Node)", type: "Full-time", location: "Remote" },
    { title: "Customer Support", type: "Part-time", location: "Jakarta" },
];

export default function KarierPage() {
    const [dark, setDark] = useDarkMode();

    return (
        <div className={`min-h-screen transition-colors duration-500 ${dark ? "bg-slate-900" : "bg-white"}`}>
            <SiteNav dark={dark} setDark={setDark} />

            <section className="max-w-4xl mx-auto px-6 lg:px-10 pt-20 pb-16 text-center">
                <p className="text-xs font-bold tracking-[0.15em] text-indigo-500 mb-4">KARIER</p>
                <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 ${dark ? "text-slate-50" : "text-slate-900"}`}>
                    Bangun SiteWatch bareng kami
                </h1>
                <p className={`text-lg leading-relaxed max-w-2xl mx-auto ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    Tim kecil, kerja remote-friendly, dan fokus bikin produk yang beneran dipakai orang.
                </p>
            </section>

            <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-24">
                <h2 className={`text-xl font-bold mb-6 ${dark ? "text-slate-50" : "text-slate-900"}`}>Posisi terbuka</h2>
                <div className="space-y-3">
                    {JOBS.map((j) => (
                        <a
                            key={j.title}
                            href="#"
                            className={`flex items-center justify-between rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${dark ? "bg-slate-800/60 border-slate-700 hover:bg-slate-800" : "bg-white border-slate-100 hover:bg-slate-50"}`}
                        >
                            <div>
                                <h3 className={`font-semibold mb-1.5 ${dark ? "text-slate-100" : "text-slate-800"}`}>{j.title}</h3>
                                <div className={`flex items-center gap-4 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                    <span className="flex items-center gap-1"><Briefcase size={13} />{j.type}</span>
                                    <span className="flex items-center gap-1"><MapPin size={13} />{j.location}</span>
                                </div>
                            </div>
                            <span className="text-indigo-500 text-sm font-semibold shrink-0">Lamar →</span>
                        </a>
                    ))}
                </div>

                <div className={`mt-10 rounded-2xl border p-6 text-center ${dark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-100"}`}>
                    <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        Nggak nemu posisi yang cocok? Kirim aja CV kamu ke{" "}
                        <a href="mailto:karier@sitewatch.app" className="text-indigo-500 font-semibold hover:underline">karier@sitewatch.app</a>
                    </p>
                </div>
            </section>

            <SiteFooter dark={dark} />
        </div>
    );
}