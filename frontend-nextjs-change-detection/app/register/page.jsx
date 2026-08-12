"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, RotateCcw, Check, X } from "lucide-react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import { useDarkMode } from "@/hooks/useDarkMode";

const PASSWORD_RULES = [
    { key: "length", label: "Minimal 8 karakter", test: (v) => v.length >= 8 },
    { key: "upper", label: "Ada huruf besar (A-Z)", test: (v) => /[A-Z]/.test(v) },
    { key: "lower", label: "Ada huruf kecil (a-z)", test: (v) => /[a-z]/.test(v) },
    { key: "number", label: "Ada angka (0-9)", test: (v) => /[0-9]/.test(v) },
];

function passwordRuleResults(value) {
    return PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(value) }));
}

function isPasswordStrongEnough(value) {
    return passwordRuleResults(value).every((r) => r.passed);
}

function PasswordChecklist({ password }) {
    const results = passwordRuleResults(password);
    return (
        <ul className="mt-2 space-y-1">
            {results.map((r) => (
                <li
                    key={r.key}
                    className={`flex items-center gap-1.5 text-xs ${
                        r.passed ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"
                    }`}
                >
                    {r.passed ? <Check size={13} /> : <X size={13} />}
                    {r.label}
                </li>
            ))}
        </ul>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState("form"); // "form" | "otp"

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const [otp, setOtp] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [dark] = useDarkMode();

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
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    function validateForm() {
        if (!username.trim()) return "Username wajib diisi.";
        if (!email.trim()) return "Email wajib diisi.";
        if (!password) return "Password wajib diisi.";
        if (!passwordConfirm) return "Konfirmasi password wajib diisi.";
        if (!isPasswordStrongEnough(password)) {
            return "Password belum memenuhi semua syarat kombinasi di bawah.";
        }
        if (password !== passwordConfirm) return "Password dan konfirmasi password tidak sama.";
        return "";
    }

    const register = async () => {
        setError("");
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register/`, {
                username,
                email,
                password,
                password_confirm: passwordConfirm,
            });
            setInfo(`Kode verifikasi telah dikirim ke ${email}. Cek inbox (atau folder spam) kamu.`);
            setStep("otp");
            setResendCooldown(30);
        } catch (err) {
            setError(err?.response?.data?.error || "Register gagal.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setError("");
        if (!otp.trim() || otp.trim().length !== 6) {
            setError("Masukkan kode verifikasi 6 digit.");
            return;
        }
        try {
            setVerifying(true);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register/verify/`, {
                email,
                code: otp.trim(),
            });
            router.push("/login");
        } catch (err) {
            setError(err?.response?.data?.error || "Verifikasi gagal.");
        } finally {
            setVerifying(false);
        }
    };

    const resendCode = async () => {
        if (resendCooldown > 0) return;
        setError("");
        setInfo("");
        try {
            setResending(true);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register/resend-code/`, { email });
            setInfo("Kode verifikasi baru telah dikirim.");
            setResendCooldown(30);
        } catch (err) {
            setError(err?.response?.data?.error || "Gagal mengirim ulang kode.");
        } finally {
            setResending(false);
        }
    };

    if (checkingAuth) {
        return <LoadingScreen dark={dark} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 px-4">
            {/* CSS override autofill (sama seperti di Admin Settings) */}
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
            `}</style>

            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
                {step === "form" ? (
                    <>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
                        >
                            <ArrowLeft size={16} />
                            Kembali ke Beranda
                        </Link>

                        <div className="text-center mb-8">
    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 overflow-hidden">
        <img 
           src="/image/Logo fiks.png"  // URL encode untuk spasi
            alt="Logo WebTora"
            className="w-full h-full object-cover"
        />
    </div>
    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Buat Akun</h1>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Daftar untuk mulai memantau situs kamu
    </p>
</div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-2.5">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        autoComplete="username"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    />
                                </div>
                            </div>

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
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Pastikan ini email aktif — kode verifikasi akan dikirim ke sini.
                                </p>
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
                                        onFocus={() => setPasswordTouched(true)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
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
                                {(passwordTouched || password) && <PasswordChecklist password={password} />}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type={showPasswordConfirm ? "text" : "password"}
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 transition ${
                                            passwordConfirm && password !== passwordConfirm
                                                ? "border-red-300 dark:border-red-800 focus:ring-red-400"
                                                : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordConfirm && password !== passwordConfirm && (
                                    <p className="text-xs text-red-500 mt-1.5">Password tidak sama.</p>
                                )}
                            </div>

                            <button
                                onClick={register}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Memproses..." : "Daftar"}
                            </button>
                        </div>

                        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
                            Sudah punya akun?
                            <a href="/login" className="text-indigo-600 dark:text-indigo-400 ml-1 font-medium">
                                Masuk
                            </a>
                        </p>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => { setStep("form"); setError(""); setInfo(""); }}
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
                        >
                            <ArrowLeft size={16} />
                            Ubah data pendaftaran
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck size={26} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Verifikasi Email</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Masukkan kode 6 digit yang dikirim ke <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>
                            </p>
                        </div>

                        {info && (
                            <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm px-4 py-2.5">
                                {info}
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
                                    Kode Verifikasi
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="123456"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center text-lg tracking-[0.5em] font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <button
                                onClick={verifyOtp}
                                disabled={verifying}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {verifying ? "Memverifikasi..." : "Verifikasi & Masuk"}
                            </button>

                            <button
                                onClick={resendCode}
                                disabled={resending || resendCooldown > 0}
                                className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw size={14} />
                                {resendCooldown > 0
                                    ? `Kirim ulang kode (${resendCooldown}s)`
                                    : resending
                                    ? "Mengirim..."
                                    : "Kirim ulang kode"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}