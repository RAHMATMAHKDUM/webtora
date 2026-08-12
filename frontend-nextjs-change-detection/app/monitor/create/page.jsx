"use client";

import { useState } from "react";
import api from "../../../lib/api";

export default function CreateMonitor() {

  const [url,setUrl] = useState("");
  const [selector,setSelector] = useState("");

  const submit = async () => {

    await api.post("sites/",{
      url,
      css_selector: selector,
      interval_seconds: 3600
    });

    alert("Monitoring berhasil ditambahkan");
  };

  return (
    <div className="p-5">

      <h1 className="text-2xl mb-4">
        Tambah Monitoring
      </h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="URL Website"
        onChange={(e)=>setUrl(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="CSS Selector"
        onChange={(e)=>setSelector(e.target.value)}
      />

      <button
        className="bg-green-500 text-white px-4 py-2"
        onClick={submit}
      >
        Simpan
      </button>

    </div>
  );
}