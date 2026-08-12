"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail, Lock, KeyRound, Eye, EyeOff, Check, X } from "lucide-react";

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

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function handleRequestCode(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
           const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/password-reset/request/`, { email });
            setMessage(res.data.message);
            setStep(2);
        } catch {
            setError("Gagal mengirim kode. Coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirmReset(e) {
        e.preventDefault();
        setError("");

        if (!isPasswordStrongEnough(newPassword)) {
            setError("Password belum memenuhi semua syarat kombinasi di bawah.");
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setError("Password dan konfirmasi password tidak sama.");
            return;
        }

        setLoading(true);
        try {
           await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/password-reset/confirm/`, {
                email,
                code,
                new_password: newPassword,
                new_password_confirm: newPasswordConfirm,
            });
            router.push("/login");
        } catch (err) {
            setError(err?.response?.data?.detail || "Kode salah atau sudah kedaluwarsa.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
                <div className="text-center mb-8">
                    <div className="w-18 h-18 rounded-2xl mx-auto mb-4 overflow-hidden">
    <img 
        src="/image/Logo fiks.png"   // karena ada spasi, di-encode menjadi %20
        alt="Logo"
        className="w-full h-full object-cover"
    />
</div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {step === 1 ? "Lupa Password" : "Masukkan Kode"}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {step === 1
                            ? "Masukkan email, kami kirim kode verifikasi."
                            : `Kode dikirim ke ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-2.5">
                        {error}
                    </div>
                )}
                {message && step === 2 && (
                    <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm px-4 py-2.5">
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestCode} className="space-y-4">
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? "Mengirim..." : "Kirim Kode"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleConfirmReset} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                Kode Verifikasi
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                Password Baru
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onFocus={() => setPasswordTouched(true)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {(passwordTouched || newPassword) && <PasswordChecklist password={newPassword} />}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                Konfirmasi Password Baru
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPasswordConfirm ? "text" : "password"}
                                    value={newPasswordConfirm}
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 transition ${
                                        newPasswordConfirm && newPassword !== newPasswordConfirm
                                            ? "border-red-300 dark:border-red-800 focus:ring-red-400"
                                            : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                                <p className="text-xs text-red-500 mt-1.5">Password tidak sama.</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? "Memproses..." : "Ubah Password"}
                        </button>
                    </form>
                )}

                <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
                    <a href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Kembali ke Login
                    </a>
                </p>
            </div>
        </div>
    );
}