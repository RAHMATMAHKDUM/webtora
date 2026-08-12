"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [logoutNotice, setLogoutNotice] = useState("");
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        async function checkAlreadyLoggedIn() {
            const token = localStorage.getItem("access");
            if (!token) {
                setCheckingAuth(false);
                return;
            }

            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.role === "ADMIN") {
                    router.replace("/admin");
                } else {
                    router.replace("/dashboard");
                }
            } catch (err) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                setCheckingAuth(false);
            }
        }
        checkAlreadyLoggedIn();
    }, [router]);

    useEffect(() => {
        const notice = localStorage.getItem("logout_notice");
        if (notice) {
            setLogoutNotice(notice);
            localStorage.removeItem("logout_notice");
        }
    }, []);

    const login = async () => {
        setError("");
        try {
            setLoading(true);

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token/`, {
                username: email,
                password,
            });

            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);

            const me = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me/`, {
                headers: { Authorization: `Bearer ${res.data.access}` },
            });

            localStorage.setItem("role", me.data.role);
            localStorage.setItem("username", me.data.username);

            if (me.data.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Email atau password salah.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return <LoadingScreen />;
    }

    return (
        <>
            {/* CSS override autofill untuk dark mode */}
            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus {
                    -webkit-text-fill-color: #1e293b;
                    -webkit-box-shadow: 0 0 0px 1000px #ffffff inset;
                    box-shadow: 0 0 0px 1000px #ffffff inset;
                    caret-color: #1e293b;
                    transition: background-color 0s ease-in-out 0s;
                }
                .dark input:-webkit-autofill,
                .dark input:-webkit-autofill:hover,
                .dark input:-webkit-autofill:focus {
                    -webkit-text-fill-color: #f1f5f9;
                    -webkit-box-shadow: 0 0 0px 1000px #1e293b inset;
                    box-shadow: 0 0 0px 1000px #1e293b inset;
                    caret-color: #f1f5f9;
                }
                /* Fix background input di dark mode jika autofill tidak aktif */
                .dark input:not(:-webkit-autofill) {
                    background-color: #1e293b !important;
                }
                .dark input {
                    color-scheme: dark;
                }
            `}</style>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 px-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Beranda
                    </Link>
                    <div className="text-center mb-8">
    <div className="w-18 h-18 rounded-2xl mx-auto mb-4 overflow-hidden">
        <img 
            src="/image/Logo fiks.png"   // ganti dengan path dan ekstensi yang sesuai
            alt="Logo WebTora"
            className="w-full h-full object-cover"
        />
    </div>
    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Selamat Datang</h1>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Masuk ke Website WebTora
    </p>
</div>

                    {logoutNotice && (
                        <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm px-4 py-2.5 flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{logoutNotice}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-2.5">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={login}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-medium transition disabled:opacity-50"
                        >
                            {loading ? "Memproses..." : "Masuk"}
                        </button>
                    </div>
                    <div className="text-right mt-1.5">
                        <a href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400">
                            Lupa password?
                        </a>
                    </div>
                    <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
                        Belum punya akun?
                        <a href="/register" className="text-indigo-600 dark:text-indigo-400 ml-1 font-medium">
                            Daftar
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}