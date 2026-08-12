"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Globe,
    Bell,
    Settings,
    LogOut,
    X,
    ChevronLeft,
    ChevronRight,
    User,
} from "lucide-react";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { useState, useEffect } from "react";

const menus = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Monitoring", icon: Globe, href: "/dashboard/monitoring" },
    { title: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const pathname = usePathname();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [username, setUsername] = useState("User");
    const [collapse, setCollapse] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("username");
        if (stored) setUsername(stored);
    }, []);

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`
                fixed lg:sticky top-0 h-screen z-40
                ${collapse ? "lg:w-20" : "lg:w-72"}
                bg-white dark:bg-slate-900
                border-r border-slate-200 dark:border-slate-800
                flex flex-col transition-all duration-300
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
                w-72
            `}>
                {/* HEADER dengan justify-between agar tombol selalu di kanan */}
                <div className="h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5">
                    {/* Kiri: logo + teks */}
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {!collapse ? (
                            <>
                                <img
                                    src="/image/Logo fiks.png"
                                    alt="Logo"
                                    className="h-12 w-auto object-contain shrink-0"
                                />
                                <div className="overflow-hidden">
                                    <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                        WebTora
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        Dashboard
                                    </p>
                                </div>
                            </>
                        ) : (
                            <img
                                src="/image/Logo fiks.png"
                                alt="Logo"
                                className="h-8 w-auto object-contain"
                            />
                        )}
                    </div>

                    {/* Kanan: tombol-tombol */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Tombol collapse (desktop) */}
                        <button
                            onClick={() => setCollapse(!collapse)}
                            title={collapse ? "Buka menu" : "Tutup menu"}
                            className="hidden lg:flex w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 items-center justify-center text-slate-500 dark:text-slate-400"
                        >
                            {collapse ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>

                        {/* Tombol close (mobile) — selalu di kanan dan center */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* MENU */}
                <div className="flex-1 py-6 overflow-y-auto">
                    {menus.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                title={collapse ? item.title : undefined}
                                className={`mx-3 mb-2 flex items-center gap-4 rounded-xl px-4 py-3 transition ${
                                    collapse ? "lg:justify-center lg:px-0" : ""
                                } ${
                                    active
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                            >
                                <Icon size={20} className="shrink-0" />
                                <span className={collapse ? "lg:hidden" : ""}>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* USER & LOGOUT */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                    <div className={`flex items-center gap-3 mb-4 ${collapse ? "lg:justify-center" : ""}`}>
                        <div className="w-11 h-11 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <User size={18} />
                        </div>
                        <div className={collapse ? "lg:hidden" : ""}>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                {username}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">User</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        title={collapse ? "Logout" : undefined}
                        className={`w-full rounded-xl bg-red-500 text-white py-2 flex items-center hover:bg-red-600 ${
                            collapse ? "lg:justify-center lg:gap-0" : "justify-center gap-2"
                        }`}
                    >
                        <LogOut size={18} className="shrink-0" />
                        <span className={collapse ? "lg:hidden" : ""}>Logout</span>
                    </button>
                </div>
            </div>

            <LogoutConfirmModal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} />
        </>
    );
}