"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    Globe,
    Bell,
    History,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
    User, // ✅ tambahkan ikon User
} from "lucide-react";

const menus = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { title: "Users", icon: Users, href: "/admin/users" },
    { title: "Monitoring", icon: Globe, href: "/admin/monitoring" },
    { title: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
    const pathname = usePathname();
    const [collapse, setCollapse] = useState(false);
    const [username, setUsername] = useState("Administrator");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

            <div
                className={`
                    fixed lg:sticky top-0 h-screen z-40
                    bg-white dark:bg-slate-900
                    border-r border-slate-200 dark:border-slate-800
                    transition-all duration-300 flex flex-col
                    w-72 ${collapse ? "lg:w-20" : "lg:w-78"}
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
            >
                {/* HEADER dengan logo */}
                <div className="h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5">
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {!collapse ? (
                            <>
                                <img
                                    src="/image/Logo fiks.png"
                                    alt="Logo"
                                    className="h-8 w-auto object-contain shrink-0"
                                />
                                <div className="overflow-hidden">
                                    <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                        WebTore
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        Admin Panel
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

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setCollapse(!collapse)}
                            className="hidden lg:flex w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 items-center justify-center text-slate-500 dark:text-slate-400"
                        >
                            {collapse ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
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
                                key={item.title}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`mx-3 mb-2 flex items-center gap-4 rounded-xl px-4 py-3 transition ${
                                    collapse ? "lg:justify-center lg:px-0" : ""
                                } ${
                                    active
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                            >
                                <Icon size={20} className="shrink-0" />
                                {!collapse && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* USER & LOGOUT */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                    <div className={`flex items-center gap-3 mb-4 ${collapse ? "lg:justify-center" : ""}`}>
                        {/* 🔥 Ganti huruf pertama dengan ikon User */}
                        <div className="w-11 h-11 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <User size={20} />
                        </div>
                        {!collapse && (
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                    {username}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className={`w-full rounded-xl bg-red-500 text-white py-2 flex items-center hover:bg-red-600 ${
                            collapse ? "lg:justify-center lg:gap-0" : "justify-center gap-2"
                        }`}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!collapse && <span>Logout</span>}
                    </button>
                </div>
            </div>

            <LogoutConfirmModal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} />
        </>
    );
}