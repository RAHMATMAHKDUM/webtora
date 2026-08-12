"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import SiteNav from "@/components/landing_page/SiteNav";
import SiteFooter from "@/components/landing_page/SiteFooter";
import axios from "axios";
import LoadingScreen from "@/components/LoadingScreen";
import {
    Globe,
    Bell,
    MonitorCheck,
    MousePointerClick,
    Crop,
    Clock,
    Send,
    ShieldCheck,
    Sparkles,
    Infinity as InfinityIcon,
    type LucideIcon,
    ArrowRight,
    Star,
} from "lucide-react";

/* =========================================================
   SCROLL REVEAL
========================================================= */

interface RevealProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

function Reveal({
    children,
    delay = 0,
    className = "",
}: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
            }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
            } ${className}`}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

/* =========================================================
   COUNT UP
========================================================= */

interface CountUpProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

function CountUp({
    end,
    duration = 1400,
    suffix = "",
    prefix = "",
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [count, setCount] = useState(0);
    const startedRef = useRef(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !startedRef.current
                ) {
                    startedRef.current = true;

                    let startTime: number | null = null;

                    function step(timestamp: number) {
                        if (startTime === null) {
                            startTime = timestamp;
                        }

                        const progress = Math.min(
                            (timestamp - startTime) / duration,
                            1
                        );

                        setCount(
                            Math.floor(progress * end)
                        );

                        if (progress < 1) {
                            requestAnimationFrame(step);
                        } else {
                            setCount(end);
                        }
                    }

                    requestAnimationFrame(step);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.4,
            }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [end, duration]);

    return (
        <span ref={ref}>
            {prefix}
            {count}
            {suffix}
        </span>
    );
}

/* =========================================================
   FEATURES
========================================================= */

interface Feature {
    icon: LucideIcon;
    title: string;
    desc: string;
}

const FEATURES: Feature[] = [
    {
        icon: MousePointerClick,
        title: "Pantau Elemen Spesifik",
        desc: "Klik elemen mana pun di halaman — harga, stok, teks pengumuman — dan kami akan mengawasi perubahannya.",
    },
    {
        icon: Crop,
        title: "Crop Area Kustom",
        desc: "Tandai area tertentu di screenshot halaman untuk dipantau, cocok untuk elemen visual yang sulit di-selector.",
    },
    {
        icon: Clock,
        title: "Interval Fleksibel",
        desc: "Atur pengecekan per menit, jam, hari, atau minggu sesuai kebutuhan monitoring.",
    },
    {
        icon: Send,
        title: "Notifikasi Email & Telegram",
        desc: "Dapatkan kabar begitu ada perubahan, langsung ke inbox atau chat Telegram.",
    },
    {
        icon: ShieldCheck,
        title: "Keandalan Terjamin",
        desc: "Sistem pengecekan berjalan otomatis di background tanpa perlu membuka browser terus-menerus.",
    },
    {
        icon: Globe,
        title: "Pantau Banyak Situs",
        desc: "Tambahkan sebanyak mungkin website yang ingin kamu awasi dari satu dashboard.",
    },
];

/* =========================================================
   STEPS
========================================================= */

interface Step {
    num: string;
    title: string;
    desc: string;
}

const STEPS: Step[] = [
    {
        num: "1",
        title: "Masukkan URL",
        desc: "Tempel link website yang ingin kamu pantau perubahannya.",
    },
    {
        num: "2",
        title: "Pilih target & jadwal",
        desc: "Tentukan elemen atau area yang dipantau dan seberapa sering dicek.",
    },
    {
        num: "3",
        title: "Tunggu notifikasi",
        desc: "Sistem akan mengirim kabar setiap kali ada perubahan.",
    },
];

/* =========================================================
   TESTIMONIAL
========================================================= */

const TESTIMONIALS = [
    {
        name: "Ahmad F.",
        role: "E-commerce Owner",
        text: "Sejak pakai Webtora, saya nggak pernah ketinggalan perubahan harga competitor. Sangat membantu!",
        rating: 5,
    },
    {
        name: "Siti R.",
        role: "Digital Marketer",
        text: "Pantau promo dan konten website klien jadi lebih gampang. Notifikasinya cepat dan akurat.",
        rating: 5,
    },
    {
        name: "Budi H.",
        role: "Freelance Developer",
        text: "Saya pakai untuk pantau dokumentasi API dan status server. Fitur cropped area-nya sangat berguna.",
        rating: 4,
    },
];

/* =========================================================
   HOME
========================================================= */

export default function Home() {
    const router = useRouter();

    /* DARK MODE AKTIF */
    const [dark, setDark] = useDarkMode();

    const [mounted, setMounted] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    /* =====================================================
       CHECK LOGIN
    ===================================================== */

    useEffect(() => {
        async function checkAlreadyLoggedIn() {
            const token = localStorage.getItem("access");

            if (!token) {
                setCheckingAuth(false);
                return;
            }

            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://127.0.0.1:8000/api";

                const res = await axios.get(
                    `${baseUrl}/me/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data.role === "ADMIN") {
                    router.replace("/admin");
                } else {
                    router.replace("/dashboard");
                }
            } catch {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                setCheckingAuth(false);
            }
        }

        checkAlreadyLoggedIn();
    }, [router]);

    /* =====================================================
       THEME CLASSES
    ===================================================== */

    const pageBg = dark
        ? "bg-slate-950"
        : "bg-white";

    const primaryText = dark
        ? "text-slate-50"
        : "text-slate-900";

    const secondaryText = dark
        ? "text-slate-400"
        : "text-slate-500";

    const cardBg = dark
        ? "bg-slate-900/70 border-slate-800"
        : "bg-white border-slate-200";

    const sectionBg = dark
        ? "bg-slate-900/60"
        : "bg-slate-50/70";

    const mutedBg = dark
        ? "bg-slate-900"
        : "bg-slate-50";

    /* =====================================================
       LOADING
    ===================================================== */

    if (checkingAuth) {
        return <LoadingScreen dark={dark} />;
    }

    return (
        <div
            className={`min-h-screen transition-colors duration-500 ${pageBg}`}
        >
            {/* =================================================
                ANIMATION
            ================================================= */}

            <style>{`
                @keyframes floatY {
                    0%, 100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-6px);
                    }
                }

                @keyframes floatYDelay {
                    0%, 100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-9px);
                    }
                }

                @keyframes pulseSoft {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }

                    50% {
                        opacity: .7;
                        transform: scale(1.04);
                    }
                }

                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }

                    50% {
                        transform: translate(10px, -10px) scale(1.06);
                    }
                }

                .landing-float {
                    animation: floatY 5s ease-in-out infinite;
                }

                .landing-float-delay {
                    animation: floatYDelay 6s ease-in-out infinite;
                }

                .landing-pulse {
                    animation: pulseSoft 2.5s ease-in-out infinite;
                }

                .landing-blob {
                    animation: blob 7s ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                    .landing-float,
                    .landing-float-delay,
                    .landing-pulse,
                    .landing-blob {
                        animation: none !important;
                    }
                }
            `}</style>

            {/* =================================================
                NAVBAR
            ================================================= */}

            <SiteNav
                dark={dark}
                setDark={setDark}
            />

            {/* =================================================
                HERO
            ================================================= */}

            <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 md:pt-28 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

                    {/* LEFT */}

                    <div>
                        <div
                            className="transition-all duration-700 ease-out"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted
                                    ? "translateY(0)"
                                    : "translateY(20px)",
                            }}
                        >
                            <span
                                className={`inline-block text-xs font-bold tracking-[0.15em] px-3 py-1.5 rounded-full mb-5 ${
                                    dark
                                        ? "bg-indigo-500/10 text-indigo-400"
                                        : "bg-indigo-50 text-indigo-600"
                                }`}
                            >
                                WEBSITE WebTora
                            </span>
                        </div>

                        <h1
                            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6 transition-all duration-700 ${
                                primaryText
                            }`}
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted
                                    ? "translateY(0)"
                                    : "translateY(20px)",
                                transitionDelay: "100ms",
                            }}
                        >
                            Pantau Perubahan Website{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                Tanpa Ribet
                            </span>
                        </h1>

                        <p
                            className={`text-lg leading-relaxed max-w-xl mb-8 transition-all duration-700 ${secondaryText}`}
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted
                                    ? "translateY(0)"
                                    : "translateY(20px)",
                                transitionDelay: "200ms",
                            }}
                        >
                            Dapatkan notifikasi setiap kali ada perubahan
                            pada website yang kamu pantau — via email atau
                            Telegram. Cukup setel sekali, sistem yang
                            berjalan otomatis.
                        </p>

                        <div
                            className="flex flex-wrap items-center gap-4 transition-all duration-700"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted
                                    ? "translateY(0)"
                                    : "translateY(20px)",
                                transitionDelay: "300ms",
                            }}
                        >
                            <button
                                onClick={() =>
                                    router.push("/login")
                                }
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                            >
                                Mulai Sekarang
                                <ArrowRight size={18} />
                            </button>

                            <a
                                href="#fitur"
                                className={`px-5 py-3.5 font-medium transition-colors ${
                                    dark
                                        ? "text-slate-300 hover:text-white"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Lihat Fitur →
                            </a>
                        </div>

                        <div
                            className={`flex flex-wrap items-center gap-6 mt-8 text-sm transition-all duration-700 ${secondaryText}`}
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted
                                    ? "translateY(0)"
                                    : "translateY(20px)",
                                transitionDelay: "400ms",
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <MonitorCheck
                                    size={17}
                                    className="text-emerald-500"
                                />
                                Real-time
                            </span>

                            <span className="flex items-center gap-2">
                                <Bell
                                    size={17}
                                    className="text-indigo-500"
                                />
                                Notifikasi
                            </span>

                            <span className="flex items-center gap-2">
                                <Sparkles
                                    size={17}
                                    className="text-amber-500"
                                />
                                Tanpa coding
                            </span>
                        </div>
                    </div>

                    {/* RIGHT HERO */}

                    <div
                        className="relative transition-all duration-1000"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted
                                ? "scale(1)"
                                : "scale(.94)",
                            transitionDelay: "150ms",
                        }}
                    >
                        <div
                            className={`relative aspect-square max-w-lg mx-auto rounded-3xl p-8 ${
                                dark
                                    ? "bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-slate-800"
                                    : "bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100"
                            }`}
                        >
                            {/* Glow */}

                            <div
                                className={`absolute inset-10 rounded-full blur-3xl ${
                                    dark
                                        ? "bg-indigo-600/10"
                                        : "bg-indigo-200/30"
                                }`}
                            />

                            <div className="relative h-full flex flex-col items-center justify-center">

                                {/* Main Icon */}

                                <div className="landing-float w-28 h-28 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-7">
                                    <Globe
                                        size={52}
                                        className="text-white"
                                    />
                                </div>

                                {/* Monitoring Card */}

                                <div
                                    className={`landing-float-delay rounded-2xl shadow-xl px-6 py-5 w-full max-w-sm border ${
                                        dark
                                            ? "bg-slate-900 border-slate-700"
                                            : "bg-white border-slate-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 landing-pulse" />

                                        <span
                                            className={`text-sm font-semibold ${
                                                dark
                                                    ? "text-slate-100"
                                                    : "text-slate-800"
                                            }`}
                                        >
                                            Monitoring Aktif
                                        </span>

                                        <span
                                            className={`ml-auto text-xs ${
                                                dark
                                                    ? "text-slate-500"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            24/7
                                        </span>
                                    </div>

                                    <div
                                        className={`mt-4 h-2 rounded-full overflow-hidden ${
                                            dark
                                                ? "bg-slate-700"
                                                : "bg-slate-100"
                                        }`}
                                    >
                                        <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                                    </div>

                                    <div
                                        className={`flex justify-between mt-2 text-xs ${
                                            dark
                                                ? "text-slate-500"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <span>3 situs dipantau</span>
                                        <span>2 perubahan</span>
                                    </div>
                                </div>

                                {/* Bell */}

                                <div
                                    className={`absolute top-5 right-3 rounded-xl shadow-lg p-3 border ${
                                        dark
                                            ? "bg-slate-800 border-slate-700"
                                            : "bg-white border-slate-100"
                                    }`}
                                >
                                    <Bell
                                        size={20}
                                        className="text-amber-500"
                                    />
                                </div>

                                {/* Notification */}

                                <div
                                    className={`absolute bottom-5 left-0 rounded-xl shadow-lg px-4 py-2.5 border text-xs ${
                                        dark
                                            ? "bg-slate-800 border-slate-700 text-slate-300"
                                            : "bg-white border-slate-100 text-slate-600"
                                    }`}
                                >
                                    📧 Notifikasi dikirim
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                STATS
            ================================================= */}

            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    {[
                        {
                            icon: Clock,
                            value: 24,
                            suffix: "/7",
                            label: "Monitoring Otomatis",
                        },
                        {
                            icon: Send,
                            value: 2,
                            suffix: "+",
                            label: "Channel Notifikasi",
                        },
                        {
                            icon: Sparkles,
                            value: 0,
                            suffix: "",
                            label: "Analisis Perubahan",
                            isText: true,
                        },
                        {
                            icon: InfinityIcon,
                            value: 0,
                            suffix: "",
                            label: "Situs Dipantau",
                            isInfinity: true,
                        },
                    ].map((stat, i) => (
                        <Reveal
                            key={stat.label}
                            delay={i * 80}
                        >
                            <div
                                className={`rounded-2xl border p-5 text-center transition-colors duration-500 ${cardBg}`}
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-3">
                                    <stat.icon
                                        size={19}
                                        className="text-white"
                                    />
                                </div>

                                <div
                                    className={`text-2xl font-extrabold mb-1 ${primaryText}`}
                                >
                                    {stat.isInfinity
                                        ? "∞"
                                        : stat.isText
                                        ? "AI"
                                        : (
                                            <CountUp
                                                end={stat.value}
                                                suffix={stat.suffix}
                                            />
                                        )}
                                </div>

                                <div
                                    className={`text-xs ${secondaryText}`}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* =================================================
                FEATURES
            ================================================= */}

            <section
                id="fitur"
                className={`py-20 md:py-24 transition-colors duration-500 ${sectionBg}`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-10">

                    <Reveal className="text-center max-w-2xl mx-auto mb-14">

                        <span
                            className={`inline-block text-xs font-bold tracking-[0.15em] mb-3 ${
                                dark
                                    ? "text-indigo-400"
                                    : "text-indigo-600"
                            }`}
                        >
                            FITUR
                        </span>

                        <h2
                            className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 ${primaryText}`}
                        >
                            Semua yang kamu butuhkan
                            untuk memantau website
                        </h2>

                        <p className={secondaryText}>
                            Simpel digunakan, tetapi tetap fleksibel
                            untuk kebutuhan monitoring yang lebih spesifik.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                        {FEATURES.map((feature, i) => (
                            <Reveal
                                key={feature.title}
                                delay={i * 70}
                            >
                                <div
                                    className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardBg}`}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5">
                                        <feature.icon
                                            size={20}
                                            className="text-white"
                                        />
                                    </div>

                                    <h3
                                        className={`font-semibold mb-2 ${
                                            dark
                                                ? "text-slate-100"
                                                : "text-slate-800"
                                        }`}
                                    >
                                        {feature.title}
                                    </h3>

                                    <p
                                        className={`text-sm leading-relaxed ${secondaryText}`}
                                    >
                                        {feature.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* =================================================
                TESTIMONIAL
            ================================================= */}

            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-24">

                <Reveal className="text-center max-w-2xl mx-auto mb-14">

                    <span
                        className={`inline-block text-xs font-bold tracking-[0.15em] mb-3 ${
                            dark
                                ? "text-indigo-400"
                                : "text-indigo-600"
                        }`}
                    >
                        TESTIMONI
                    </span>

                    <h2
                        className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 ${primaryText}`}
                    >
                        Apa Kata Mereka?
                    </h2>

                    <p className={secondaryText}>
                        Pengalaman pengguna setelah menggunakan
                        sistem monitoring.
                    </p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {TESTIMONIALS.map((testimonial, i) => (
                        <Reveal
                            key={testimonial.name}
                            delay={i * 100}
                        >
                            <div
                                className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map(
                                        (_, index) => (
                                            <Star
                                                key={index}
                                                size={16}
                                                className={
                                                    index <
                                                    testimonial.rating
                                                        ? "text-amber-400 fill-amber-400"
                                                        : dark
                                                        ? "text-slate-700"
                                                        : "text-slate-300"
                                                }
                                            />
                                        )
                                    )}
                                </div>

                                <p
                                    className={`text-sm leading-relaxed mb-6 ${secondaryText}`}
                                >
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                                        {testimonial.name.charAt(0)}
                                    </div>

                                    <div>
                                        <p
                                            className={`font-medium text-sm ${
                                                dark
                                                    ? "text-slate-100"
                                                    : "text-slate-800"
                                            }`}
                                        >
                                            {testimonial.name}
                                        </p>

                                        <p
                                            className={`text-xs ${secondaryText}`}
                                        >
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* =================================================
                HOW IT WORKS
            ================================================= */}

            <section
                id="cara-kerja"
                className={`py-20 md:py-24 transition-colors duration-500 ${sectionBg}`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-10">

                    <Reveal className="text-center max-w-2xl mx-auto mb-14">

                        <span
                            className={`inline-block text-xs font-bold tracking-[0.15em] mb-3 ${
                                dark
                                    ? "text-indigo-400"
                                    : "text-indigo-600"
                            }`}
                        >
                            CARA KERJA
                        </span>

                        <h2
                            className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 ${primaryText}`}
                        >
                            Mulai dalam 3 langkah
                        </h2>

                        <p className={secondaryText}>
                            Gampang digunakan dan tidak membutuhkan
                            kemampuan coding.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {STEPS.map((step, i) => (
                            <Reveal
                                key={step.num}
                                delay={i * 100}
                            >
                                <div className="relative text-center">

                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
                                        {step.num}
                                    </div>

                                    <h3
                                        className={`font-semibold text-lg mb-2 ${
                                            dark
                                                ? "text-slate-100"
                                                : "text-slate-800"
                                        }`}
                                    >
                                        {step.title}
                                    </h3>

                                    <p
                                        className={`text-sm leading-relaxed max-w-sm mx-auto ${secondaryText}`}
                                    >
                                        {step.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* =================================================
                CTA
            ================================================= */}

            <Reveal className="max-w-7xl mx-auto px-6 lg:px-10 py-20">

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-14 md:px-16 text-center">

                    <div className="landing-blob absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />

                    <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-white/5" />

                    <div className="relative">

                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                            Siap Pantau Website Favoritmu?
                        </h2>

                        <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
                            Daftar gratis dan mulai pantau perubahan
                            website pertamamu hari ini.
                        </p>

                        <button
                            onClick={() =>
                                router.push("/login")
                            }
                            className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg"
                        >
                            Mulai Sekarang
                        </button>
                    </div>
                </div>
            </Reveal>

            {/* =================================================
                FOOTER
            ================================================= */}

            <SiteFooter dark={dark} />
        </div>
    );
}