"use client";
import { useDarkMode } from "@/hooks/useDarkMode";
import SiteNav from "@/components/landing_page/SiteNav";
import SiteFooter from "@/components/landing_page/SiteFooter";
import { Target, Users, Sparkles } from "lucide-react";

const VALUES = [
    { icon: Target, title: "Fokus pada Ketepatan", desc: "Kami percaya notifikasi yang bermanfaat adalah notifikasi yang akurat — bukan yang paling sering muncul." },
    { icon: Users, title: "Sederhana untuk Siapa Saja", desc: "Nggak perlu jago teknis untuk mulai memantau website. Klik, atur, selesai." },
    { icon: Sparkles, title: "Terus Berkembang", desc: "Kami terus menambah cara baru untuk memantau perubahan yang penting bagi kamu." },
];

export default function TentangPage() {
    const [dark, setDark] = useDarkMode();

    return (
        <div className={`min-h-screen transition-colors duration-500 ${dark ? "bg-slate-900" : "bg-white"}`}>
            <SiteNav dark={dark} setDark={setDark} />

            <section className="max-w-4xl mx-auto px-6 lg:px-10 pt-20 pb-16 text-center">
                <p className="text-xs font-bold tracking-[0.15em] text-indigo-500 mb-4">TENTANG KAMI</p>
                <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 ${dark ? "text-slate-50" : "text-slate-900"}`}>
                    Kami bangun SiteWatch supaya kamu nggak perlu cek website berulang-ulang
                </h1>
                <p className={`text-lg leading-relaxed max-w-2xl mx-auto ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    Terlalu sering kita ketinggalan info penting — harga yang turun, stok yang habis,
                    atau pengumuman yang berubah — cuma karena lupa cek ulang halamannya. SiteWatch lahir
                    dari masalah sederhana itu: biar komputer yang mengecek, kamu tinggal terima kabarnya.
                </p>
            </section>

            <section className={`py-20 transition-colors duration-500 ${dark ? "bg-slate-800/40" : "bg-slate-50/70"}`}>
                <div className="max-w-6xl mx-auto px-6 lg:px-10">
                    <h2 className={`text-2xl font-bold text-center mb-12 ${dark ? "text-slate-50" : "text-slate-900"}`}>
                        Yang kami pegang teguh
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {VALUES.map((v) => (
                            <div key={v.title} className={`rounded-2xl border p-6 ${dark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-100"}`}>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-sm">
                                    <v.icon size={20} className="text-white" />
                                </div>
                                <h3 className={`font-semibold mb-2 ${dark ? "text-slate-100" : "text-slate-800"}`}>{v.title}</h3>
                                <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <SiteFooter dark={dark} />
        </div>
    );
}