"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import api from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dark, setDark, ready] = useDarkMode();

    // Auth check
    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("access");
            if (!token) {
                router.replace("/login");
                return;
            }
            try {
                await api.get("me/");
                setChecking(false);
            } catch (err) {
                router.replace("/login");
            }
        }
        checkAuth();
    }, [router]);

    // Tunggu sampai hook siap dan auth selesai
    if (!ready || checking) {
        return <LoadingScreen dark={dark} />;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 min-h-screen bg-slate-100 dark:bg-slate-950">
                <Topbar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    dark={dark}
                    setDark={setDark}
                />
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}