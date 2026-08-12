"use client";
import { useDarkMode } from "@/hooks/useDarkMode";
import SiteNav from "@/components/landing_page/SiteNav";
import SiteFooter from "@/components/landing_page/SiteFooter";
import { ArrowRight } from "lucide-react";

/* Contoh/placeholder — ganti dengan post asli */
const POSTS = [
    {
        title: "5 Elemen Website yang Paling Sering Perlu Dipantau",
        excerpt: "Dari harga produk sampai status stok, ini daftar elemen yang paling sering bikin orang ketinggalan info penting.",
        date: "10 Jul 2026",
        tag: "Tips",
    },
    {
        title: "Selector vs Crop Area: Kapan Pakai yang Mana?",
        excerpt: "Dua cara memantau perubahan punya kelebihan masing-masing. Ini cara memilih yang paling cocok untuk kebutuhanmu.",
        date: "2 Jul 2026",
        tag: "Panduan",
    },
    {
        title: "Cara Atur Notifikasi Telegram Biar Nggak Kelewat",
        excerpt: "Langkah demi langkah menghubungkan bot Telegram ke akun SiteWatch kamu.",
        date: "24 Jun 2026",
        tag: "Tutorial",
    },
];

export default function BlogPage() {
    const [dark, setDark] = useDarkMode();

    return (
        <div className={`min-h-screen transition-colors duration-500 ${dark ? "bg-slate-900" : "bg-white"}`}>
            <SiteNav dark={dark} setDark={setDark} />

            <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-16">
                <div className="text-center mb-14">
                    <p className="text-xs font-bold tracking-[0.15em] text-indigo-500 mb-4">BLOG</p>
                    <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 ${dark ? "text-slate-50" : "text-slate-900"}`}>
                        Tips & pembaruan seputar monitoring website
                    </h1>
                    <p className={`text-lg ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        Panduan singkat, studi kasus, dan hal-hal baru dari tim SiteWatch.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {POSTS.map((p) => (
                        <a
                            key={p.title}
                            href="#"
                            className={`group rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${dark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-100"}`}
                        >
                            <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 ${dark ? "bg-indigo-500/10 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
                                {p.tag}
                            </span>
                            <h3 className={`font-semibold mb-2 leading-snug ${dark ? "text-slate-100" : "text-slate-800"}`}>{p.title}</h3>
                            <p className={`text-sm leading-relaxed mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>{p.excerpt}</p>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{p.date}</span>
                                <ArrowRight size={16} className="text-indigo-500 transition-transform duration-300 group-hover:translate-x-1" />
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            <SiteFooter dark={dark} />
        </div>
    );
}