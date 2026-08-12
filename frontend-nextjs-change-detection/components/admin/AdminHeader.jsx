"use client";

import Link from "next/link";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { useState, useEffect, useRef } from "react";
import {
    Bell,
    Moon,
    Sun,
    Search,
    Menu,
    UserCircle,
    ChevronDown,
    User,
    Settings,
    LogOut,
} from "lucide-react";

export default function AdminHeader({
    sidebarOpen,
    setSidebarOpen,
    dark,
    setDark,
}) {
    const [openUser, setOpenUser] = useState(false);
    const [username, setUsername] = useState("Administrator");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem("username");
        if (stored) setUsername(stored);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setOpenUser(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <style>{`
                @keyframes headerDropdownIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .header-dropdown-anim { animation: headerDropdownIn 0.15s ease-out; transform-origin: top right; }
            `}</style>

            <div className={`
                w-full h-16 border-b flex items-center justify-between px-6
                sticky top-0 z-40 backdrop-blur-xl transition-all
                ${dark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-gray-200"}
            `}>
                {/* LEFT */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`
                            lg:hidden p-2 rounded-xl transition
                            ${dark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100 text-gray-600"}
                        `}
                    >
                        <Menu size={22} />
                    </button>

                    <div className="relative hidden md:block">
                        <Search
                            size={17}
                            className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${dark ? "text-slate-500" : "text-gray-400"}`}
                        />
                        <input
                            placeholder="Search..."
                            className={`
                                pl-10 pr-4 py-2.5 rounded-xl w-72 text-sm outline-none border transition
                                focus:ring-4 focus:border-indigo-500
                                ${dark
                                    ? "bg-slate-800/70 border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-indigo-500/15"
                                    : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-indigo-500/10 focus:bg-white"}
                            `}
                        />
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                    <button
                        title={dark ? "Mode terang" : "Mode gelap"}
                        onClick={() => setDark(!dark)}
                        className={`
                            p-2.5 rounded-xl transition
                            ${dark ? "hover:bg-slate-800 text-amber-300" : "hover:bg-gray-100 text-slate-500"}
                        `}
                    >
                        {dark ? <Sun size={19} /> : <Moon size={19} />}
                    </button>

                    <div className={`w-px h-7 mx-1.5 ${dark ? "bg-slate-800" : "bg-gray-200"}`} />

                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setOpenUser(!openUser)}
                            className={`
                                flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl transition
                                ${dark ? "hover:bg-slate-800" : "hover:bg-gray-100"}
                                ${openUser ? (dark ? "bg-slate-800" : "bg-gray-100") : ""}
                            `}
                        >
                            {/* 🔥 Ganti inisial dengan ikon User */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                <User size={18} />
                            </div>
                            <div className="hidden md:block text-left leading-tight">
                                <div className="font-semibold text-sm">{username}</div>
                                <div className={`text-xs ${dark ? "text-slate-400" : "text-gray-500"}`}>Super Admin</div>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`hidden md:block transition-transform duration-200 ${openUser ? "rotate-180" : ""} ${dark ? "text-slate-500" : "text-gray-400"}`}
                            />
                        </button>

                        {openUser && (
                            <div className={`
                                header-dropdown-anim absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden border
                                ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}
                            `}>
                                {/* Profile summary */}
                                <div className={`flex items-center gap-3 px-4 py-4 ${dark ? "bg-slate-800/60" : "bg-gray-50/70"}`}>
                                    {/* 🔥 Ganti inisial dengan ikon User di dropdown juga */}
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <User size={22} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm truncate">{username}</div>
                                        <div className={`text-xs truncate ${dark ? "text-slate-400" : "text-gray-500"}`}>Super Admin</div>
                                    </div>
                                </div>

                                <div className={`h-px ${dark ? "bg-slate-700" : "bg-gray-100"}`} />

                                {/* Menu items */}
                                <div className="py-1.5">
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setOpenUser(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-2.5 text-sm transition
                                            ${dark ? "text-slate-200 hover:bg-indigo-500/10" : "text-gray-700 hover:bg-indigo-50"}
                                        `}
                                    >
                                        <User size={17} className={dark ? "text-slate-400" : "text-gray-400"} />
                                        Profile
                                    </Link>
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setOpenUser(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-2.5 text-sm transition
                                            ${dark ? "text-slate-200 hover:bg-indigo-500/10" : "text-gray-700 hover:bg-indigo-50"}
                                        `}
                                    >
                                        <Settings size={17} className={dark ? "text-slate-400" : "text-gray-400"} />
                                        Settings
                                    </Link>
                                </div>

                                <div className={`h-px ${dark ? "bg-slate-700" : "bg-gray-100"}`} />

                                <div className="py-1.5">
                                    <button
                                        onClick={() => {
                                            setOpenUser(false);
                                            setShowLogoutConfirm(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition"
                                    >
                                        <LogOut size={17} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LogoutConfirmModal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} />
        </>
    );
}