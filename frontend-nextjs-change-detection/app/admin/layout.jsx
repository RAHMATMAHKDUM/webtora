"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import api from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";


export default function AdminRootLayout({ children }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dark, setDark] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("access");
            if (!token) {
                router.replace("/login");
                return;
            }
            try {
                const res = await api.get("me/");
                if (res.data.role !== "ADMIN") {
                    router.replace("/dashboard");
                    return;
                }
                setChecking(false);
            } catch (err) {
                router.replace("/login");
            }
        }
        checkAuth();
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            setDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

   if (checking) {
    return <LoadingScreen dark={dark} />;
}

    return (
        <div className="flex">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950">
                <AdminHeader
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