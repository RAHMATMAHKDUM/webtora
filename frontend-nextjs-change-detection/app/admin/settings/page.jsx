"use client";
import { useEffect, useState } from "react";
import { User, Mail, Lock, Shield, Eye, EyeOff, LogIn } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function LanguageSwitch() {
    const { lang, setLang, t } = useLanguage();
    return (
        <div className="inline-flex items-center gap-2">
            <span className="text-xs text-slate-400">{t("language")}</span>
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {["en", "id"].map((code) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => setLang(code)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                            lang === code
                                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                    >
                        {code.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function AdminSettingsPage() {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchMe() {
            try {
                const token = localStorage.getItem("access");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json().catch(() => null);

                if (!res.ok || !data?.username) {
                    throw new Error(data?.detail || t("loadErrorGeneric"));
                }

                setProfile(data);
                setEmail(data.email || "");
            } catch (err) {
                setLoadError(err.message || t("loadErrorGeneric"));
            }
        }
        fetchMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSave(e) {
        e.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);
        try {
            const token = localStorage.getItem("access");
            const body = { email };
            if (newPassword) {
                body.old_password = oldPassword;
                body.new_password = newPassword;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Gagal menyimpan perubahan.");
            }
            setProfile((p) => ({ ...p, email }));
            setMessage(t("savedOk"));
            setOldPassword("");
            setNewPassword("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <LogIn className="h-6 w-6 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">{loadError}</p>
            </div>
        );
    }

    if (!profile) {
        return <p className="text-slate-400">{t("loading")}</p>;
    }

    return (
        <div>
            {/* Override background autofill */}
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

            {/* <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("settingsTitle")}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("settingsSubtitle")}</p>
                </div>
                <LanguageSwitch />
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom kiri — ringkasan profil */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center sticky top-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            {profile.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{profile.username}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{profile.email || t("noEmail")}</p>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Shield className="h-3 w-3" />
                            {profile.role}
                        </span>
                    </div>
                </div>

                {/* Kolom kanan — form */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-3">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm px-4 py-3">
                            {message}
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <User className="h-4 w-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t("accountInfo")}</h2>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("username")}
                                </label>
                                <input
                                    type="text"
                                    value={profile.username || ""}
                                    disabled
                                    autoComplete="username"
                                    className="w-full pl-4 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("email")}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />
                            <p className="text-xs text-slate-400">{t("passwordHint")}</p>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                        {t("oldPassword")}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                         <input
                                            type={showOldPassword ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            autoComplete="new-password"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                        {t("newPassword")}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            autoComplete="new-password"
                                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 px-6 disabled:opacity-50"
                                >
                                    {saving ? t("saving") : t("saveChanges")}
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* TelegramConnect telah dihapus */}
                </div>
            </div>
        </div>
    );
}