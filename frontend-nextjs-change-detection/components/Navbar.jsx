"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {

  const router = useRouter();

  const logout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    router.push("/login");
  };

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between">

      <h2>Change Detection</h2>

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}