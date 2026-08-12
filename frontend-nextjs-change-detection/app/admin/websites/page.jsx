"use client";

// Halaman ini belum diimplementasikan, redirect ke dashboard admin
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminWebsitesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-slate-400 text-sm">Mengalihkan...</p>
    </div>
  );
}
