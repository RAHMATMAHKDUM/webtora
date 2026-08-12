"use client";

import { useDarkMode } from "@/hooks/useDarkMode";
import SiteNav from "@/components/landing_page/SiteNav";
import SiteFooter from "@/components/landing_page/SiteFooter";
import { Mail, MessageCircle, Clock } from "lucide-react";

export default function KontakPage() {
    const [dark, setDark] = useDarkMode();

    const cardClass = `
        rounded-2xl border p-6 transition-colors duration-500
        ${
            dark
                ? "bg-slate-800/60 border-slate-700"
                : "bg-white border-slate-100"
        }
    `;

    return (
        <div
            className={`min-h-screen transition-colors duration-500 ${
                dark ? "bg-slate-900" : "bg-white"
            }`}
        >
            <SiteNav dark={dark} setDark={setDark} />

            {/* HERO */}
            <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-16">
                <div className="text-center max-w-2xl mx-auto">
                    <p className="text-xs font-bold tracking-[0.15em] text-indigo-500 mb-4">
                        KONTAK
                    </p>

                    <h1
                        className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-5 ${
                            dark ? "text-slate-50" : "text-slate-900"
                        }`}
                    >
                        Hubungi Kami
                    </h1>

                    <p
                        className={`text-lg leading-relaxed ${
                            dark ? "text-slate-400" : "text-slate-500"
                        }`}
                    >
                        Punya pertanyaan atau membutuhkan bantuan terkait
                        WebTora? Silakan hubungi kami melalui
                        informasi kontak yang tersedia.
                    </p>
                </div>
            </section>

            {/* CONTACT INFORMATION */}
            <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* EMAIL */}
                    <a
                        href="mailto:hello@sitewatch.app"
                        className={`${cardClass} hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5">
                            <Mail size={20} className="text-white" />
                        </div>

                        <h2
                            className={`font-semibold text-lg mb-2 ${
                                dark ? "text-slate-100" : "text-slate-800"
                            }`}
                        >
                            Email
                        </h2>

                        <p
                            className={`text-sm mb-3 ${
                                dark ? "text-slate-400" : "text-slate-500"
                            }`}
                        >
                            Hubungi kami melalui email untuk pertanyaan,
                            bantuan, atau informasi lainnya.
                        </p>

                        <span className="text-sm font-medium text-indigo-500">
                            webmonitoing@gmail.com
                        </span>
                    </a>

                    {/* JAM RESPONS */}
                    <div className={cardClass}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5">
                            <Clock size={20} className="text-white" />
                        </div>

                        <h2
                            className={`font-semibold text-lg mb-2 ${
                                dark ? "text-slate-100" : "text-slate-800"
                            }`}
                        >
                            Jam Respons
                        </h2>

                        <p
                            className={`text-sm leading-relaxed ${
                                dark ? "text-slate-400" : "text-slate-500"
                            }`}
                        >
                            Senin–Jumat
                            <br />
                            09.00–17.00 WIB
                        </p>
                    </div>

                    {/* BANTUAN */}
                    <div className={cardClass}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5">
                            <MessageCircle
                                size={20}
                                className="text-white"
                            />
                        </div>

                        <h2
                            className={`font-semibold text-lg mb-2 ${
                                dark ? "text-slate-100" : "text-slate-800"
                            }`}
                        >
                            Bantuan
                        </h2>

                        <p
                            className={`text-sm leading-relaxed ${
                                dark ? "text-slate-400" : "text-slate-500"
                            }`}
                        >
                            Untuk bantuan penggunaan sistem, sertakan
                            informasi masalah agar kami dapat membantu dengan
                            lebih cepat.
                        </p>
                    </div>
                </div>

                {/* INFO TAMBAHAN */}
                <div
                    className={`mt-8 rounded-2xl border p-8 text-center ${
                        dark
                            ? "bg-slate-800/40 border-slate-700"
                            : "bg-slate-50/70 border-slate-100"
                    }`}
                >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                        <Mail
                            size={20}
                            className="text-indigo-600 dark:text-indigo-400"
                        />
                    </div>

                    <h2
                        className={`text-xl font-bold mb-2 ${
                            dark ? "text-slate-100" : "text-slate-900"
                        }`}
                    >
                        Kami siap membantu
                    </h2>

                    <p
                        className={`text-sm max-w-xl mx-auto leading-relaxed ${
                            dark ? "text-slate-400" : "text-slate-500"
                        }`}
                    >
                        Jika mengalami kendala atau memiliki pertanyaan
                        mengenai layanan WebTora, silakan kirim email
                        kepada kami. Kami akan memberikan respons pada jam
                        operasional.
                    </p>

                    <a
                        href="mailto:hello@sitewatch.app"
                        className="inline-flex items-center gap-2 mt-5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition"
                    >
                        <Mail size={17} />
                        Hubungi melalui Email
                    </a>
                </div>
            </section>

            <SiteFooter dark={dark} />
        </div>
    );
}