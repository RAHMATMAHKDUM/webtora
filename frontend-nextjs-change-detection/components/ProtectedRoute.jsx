"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {

  const router = useRouter();

  useEffect(() => {

    const token =
      localStorage.getItem("access");

    if (!token) {
      router.push("/login");
    }

  }, []);

  return children;
}