"use client";
import { useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import SiteNav from "@/components/landing_page/SiteNav";
import SiteFooter from "@/components/landing_page/SiteFooter";
import { ChevronDown } from "lucide-react";

const FAQS = [
    {
        q: "Apa itu SiteWatch?",
        a: "SiteWatch adalah alat untuk memantau perubahan pada halaman website — baik elemen tertentu (lewat selector) maupun area tertentu (lewat crop screenshot) — dan mengirim notifikasi begitu ada perubahan.",
    },
    {
        q: "Apa bedanya monitoring Selector dan Crop Area?",
        a: "Selector cocok untuk memantau elemen berbasis teks/HTML, seperti harga atau status stok. Crop Area cocok untuk elemen visual yang sulit ditandai lewat selector, seperti banner atau grafik.",
    },
    {
        q: "Seberapa sering website saya dicek?",
        a: "Kamu bisa atur sendiri intervalnya — mulai dari per menit, per jam, per hari, sampai per minggu — sesuai kebutuhan masing-masing situs.",
    },
    {
        q: "Notifikasi dikirim ke mana saja?",
        a: "Saat ini tersedia notifikasi lewat email dan Telegram. Kamu bisa aktifkan salah satu atau keduanya sekaligus untuk tiap situs yang dipantau.",
    },
    {
        q: "Apakah saya bisa memantau lebih dari satu website?",
        a: "Bisa. Kamu bisa menambahkan sebanyak mungkin website yang ingin dipantau dari satu dashboard yang sama.",
    },
];

export default function FaqPage() {
    const [dark, setDark] = useDarkMode();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className={`min-h-screen transition-colors duration-500 ${dark ? "bg-slate-900" : "bg-white"}`}>
            <SiteNav dark={dark} setDark={setDark} />

            <section className="max-w-3xl mx-auto px-6 lg:px-10 pt-20 pb-24">
                <div className="text-center mb-14">
                    <p className="text-xs font-bold tracking-[0.15em] text-indigo-500 mb-4">FAQ</p>
                    <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 ${dark ? "text-slate-50" : "text-slate-900"}`}>
                        Pertanyaan yang sering ditanyakan
                    </h1>
                </div>

                <div className="space-y-3">
                    {FAQS.map((item, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={item.q}
                                className={`rounded-2xl border overflow-hidden transition-colors ${dark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-100"}`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                >
                                    <span className={`font-semibold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}>{item.q}</span>
                                    <ChevronDown
                                        size={18}
                                        className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${dark ? "text-slate-500" : "text-gray-400"}`}
                                    />
                                </button>
                                <div
                                    className="grid transition-all duration-300 ease-out"
                                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                                >
                                    <div className="overflow-hidden">
                                        <p className={`px-5 pb-4 text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                            {item.a}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={`mt-10 rounded-2xl border p-6 text-center ${dark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-100"}`}>
                    <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        Masih ada pertanyaan?{" "}
                        <a href="/landing_page/kontak" className="text-indigo-500 font-semibold hover:underline">Hubungi kami</a>
                    </p>
                </div>
            </section>

            <SiteFooter dark={dark} />
        </div>
    );
}