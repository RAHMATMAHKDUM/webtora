"use client";
import Link from "next/link";
import { Globe } from "lucide-react";
import type { SVGProps } from "react";

function GithubIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.16v3.2c0 .3.21.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
        </svg>
    );
}
function TwitterIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
            <path d="M22.16 5.34c-.7.31-1.45.52-2.24.62a3.9 3.9 0 0 0 1.72-2.16 7.8 7.8 0 0 1-2.48.95 3.9 3.9 0 0 0-6.65 3.56A11.07 11.07 0 0 1 4.6 3.99a3.9 3.9 0 0 0 1.21 5.2 3.87 3.87 0 0 1-1.77-.49v.05a3.9 3.9 0 0 0 3.13 3.82 3.9 3.9 0 0 1-1.76.07 3.9 3.9 0 0 0 3.64 2.71A7.83 7.83 0 0 1 2 17.54a11.05 11.05 0 0 0 5.98 1.75c7.17 0 11.09-5.94 11.09-11.09l-.01-.5a7.9 7.9 0 0 0 1.94-2.02c-.7.32-1.46.53-2.24.62z" />
        </svg>
    );
}
function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
        </svg>
    );
}

interface SiteFooterProps {
    dark: boolean;
}

const COMPANY_LINKS = [
    { label: "Tentang Kami", href: "/landing_page/tentang" },
    { label: "Blog", href: "/landing_page/blog" },
    // { label: "Karier", href: "/landing_page/karier" },
];

const HELP_LINKS = [
    // { label: "FAQ", href: "/landing_page/faq" },
    { label: "Kontak", href: "/landing_page/kontak" },
    // { label: "Status", href: "/landing_page/status" },
];

export default function SiteFooter({ dark }: SiteFooterProps) {
    return (
        <footer className={`border-t transition-colors duration-500 ${dark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    <div className="col-span-2">
                        <Link href="/landing_page" className="flex items-center gap-2.5 mb-4 w-fit">
                            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
    <img src="/image/Logo fiks.png" alt="SiteWatch" className="w-full h-full object-cover" />
</div>
                            <span className={`font-bold text-lg tracking-tight ${dark ? "text-slate-100" : "text-slate-800"}`}>
                                WebTora
                            </span>
                        </Link>
                        <p className={`text-sm leading-relaxed max-w-xs mb-5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                            Alat sederhana untuk memantau perubahan website dan dapat notifikasi instan
                            saat ada yang berubah.
                        </p>
                        <div className="flex items-center gap-3">
                            {[GithubIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
                                <a
                                    key={i}
                                   href="#"
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${dark ? "bg-slate-800 text-slate-400 hover:text-slate-100" : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"}`}
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className={`text-sm font-semibold mb-4 ${dark ? "text-slate-200" : "text-slate-800"}`}>Perusahaan</h4>
                        <ul className="space-y-2.5">
                            {COMPANY_LINKS.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className={`text-sm transition-colors ${dark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"}`}>{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className={`text-sm font-semibold mb-4 ${dark ? "text-slate-200" : "text-slate-800"}`}>Bantuan</h4>
                        <ul className="space-y-2.5">
                            {HELP_LINKS.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className={`text-sm transition-colors ${dark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"}`}>{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={`mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${dark ? "border-slate-800" : "border-slate-200"}`}>
                    <p className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
                        © {new Date().getFullYear()} SiteWatch. Semua hak dilindungi.
                    </p>
                    <div className="flex items-center gap-5">
                        <a href="#" className={`text-xs transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>Privasi</a>
                        <a href="#" className={`text-xs transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>Syarat & Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}