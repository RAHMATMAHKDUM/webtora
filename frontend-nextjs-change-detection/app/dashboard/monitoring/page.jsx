"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import ScheduleModal from "@/components/ScheduleModal";

/* ---------------------------------------------------------------
   Icon set — geometric line icons, no emoji.
   Single-color, stroke-based, drawn to match a code/diff tool
   rather than a generic consumer app.
---------------------------------------------------------------- */
const iconBase = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

function IconTarget(props) {
  return (
    <svg {...iconBase} {...props}>
      <circle cx="12" cy="12" r="6.5" />
      <line x1="12" y1="2" x2="12" y2="5.5" />
      <line x1="12" y1="18.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5.5" y2="12" />
      <line x1="18.5" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconCrop(props) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M2 6h14a2 2 0 0 1 2 2v14" />
    </svg>
  );
}
function IconPage(props) {
  return (
    <svg {...iconBase} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <line x1="7.5" y1="8" x2="16.5" y2="8" />
      <line x1="7.5" y1="12" x2="16.5" y2="12" />
      <line x1="7.5" y1="16" x2="13" y2="16" />
    </svg>
  );
}
function IconMail(props) {
  return (
    <svg {...iconBase} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </svg>
  );
}
function IconSend(props) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M21.5 2.5 10.5 13.5" />
      <path d="M21.5 2.5 14.7 21.5l-4.2-8-8-4.2z" />
    </svg>
  );
}
function IconCamera(props) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="14" r="3.4" />
    </svg>
  );
}
function IconCommit(props) {
  return (
    <svg {...iconBase} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <line x1="1" y1="12" x2="8.3" y2="12" />
      <line x1="15.7" y1="12" x2="23" y2="12" />
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg {...iconBase} {...props}>
      <circle cx="10.2" cy="10.2" r="6.2" />
      <line x1="14.8" y1="14.8" x2="20" y2="20" />
    </svg>
  );
}
function IconPulse(props) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M2 12h4l1.8-6 3.6 12 2.4-9 1.4 3h6.8" />
    </svg>
  );
}
function IconEmptyBox(props) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M3 8l9-5 9 5-9 5-9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}
function IconClock(props) {
  return (
    <svg {...iconBase} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2v5l3.3 2.6" />
    </svg>
  );
}
function IconChevron(props) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M8 4l8 8-8 8" />
    </svg>
  );
}
function IconPower(props) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg {...iconBase} {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/* Small dual-tone mark: a minus/plus pair, the recurring
   signature motif for "this is a diff tool", used anywhere
   we want to gesture at "before vs after" without full example text. */
function DiffMark({ size = 13 }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: size, lineHeight: 1, fontWeight: 700 }}>
      <span style={{ color: "#B34A3C" }}>−</span>
      <span style={{ color: "#1F7A4D" }}>+</span>
    </span>
  );
}

export default function MonitoringPage() {
  const [sites, setSites] = useState([]);
  const [url, setUrl] = useState("");

  const [model, setModel] = useState(null); // null = belum pilih, "model1" | "model2"
  const [subType, setSubType] = useState("selector"); // dipakai hanya kalau model1

  const [scheduleConfig, setScheduleConfig] = useState({
    scheduleType: "interval",
    scheduleValue: 1,
    scheduleUnit: "hour",
    scheduleTime: null,
    scheduleDays: null,
    customDays: 3,
  });
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyTelegram, setNotifyTelegram] = useState(false);
  const [emailTarget, setEmailTarget] = useState("");
  const [telegramConnected, setTelegramConnected] = useState(false);

  const [cropArea, setCropArea] = useState(null);
  const [cropDescription, setCropDescription] = useState("");
  const [loadingCropDescription, setLoadingCropDescription] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedSelector, setSelectedSelector] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [loadingSelector, setLoadingSelector] = useState(false);
  const [pageMeta, setPageMeta] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [siteHistories, setSiteHistories] = useState({});
  const imgRef = useRef(null);

  // NEW: nonaktifkan / hapus monitoring
  const [deactivatingSite, setDeactivatingSite] = useState(null);
  const [deletingSite, setDeletingSite] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const monitorType = model === "model2" ? "fullpage" : subType;

  function resetFormState() {
    setUrl("");
    setPreviewImage("");
    setSelectedPoint(null);
    setSelectedSelector("");
    setSelectedText("");
    setCropArea(null);
    setPageMeta(null);
  }

  function chooseModel(m) {
    resetFormState();
    setModel(m);
  }

  function backToPicker() {
    resetFormState();
    setModel(null);
  }

  const loadSites = async () => {
    try {
      const res = await api.get("sites/");
      setSites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async (siteId) => {
    try {
      const res = await api.get(`sites/${siteId}/history/`);
      setSiteHistories((prev) => ({ ...prev, [siteId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const checkNow = async (siteId) => {
    setCheckingId(siteId);
    try {
      await api.post(`sites/${siteId}/check-now/`);
      await loadHistory(siteId);
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan pengecekan.");
    } finally {
      setCheckingId(null);
    }
  };

  // NEW: toggle aktif/nonaktif
  async function doToggleActive(site, nextActive) {
    setTogglingId(site.id);
    try {
      await api.patch(`sites/${site.id}/`, { is_active: nextActive });
      await loadSites();
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status monitoring.");
    } finally {
      setTogglingId(null);
    }
  }

  function handleToggleClick(site) {
    if (site.is_active) {
      setDeactivatingSite(site);
    } else {
      doToggleActive(site, true);
    }
  }

  async function confirmDeactivate() {
    if (!deactivatingSite) return;
    await doToggleActive(deactivatingSite, false);
    setDeactivatingSite(null);
  }

  // NEW: hapus monitoring
  async function handleDelete() {
    if (!deletingSite) return;
    setDeletingBusy(true);
    try {
      await api.delete(`sites/${deletingSite.id}/`);
      setDeletingSite(null);
      await loadSites();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus monitoring.");
    } finally {
      setDeletingBusy(false);
    }
  }

  const createSite = async () => {
    if (!url) { alert("URL wajib diisi"); return; }
    if (notifyEmail && !emailTarget.trim()) {
      alert("Isi email tujuan notifikasi, atau matikan toggle Email.");
      return;
    }
    if (notifyTelegram && !telegramConnected) {
      alert("Hubungkan akun Telegram kamu dulu di halaman Settings.");
      return;
    }
    if (scheduleConfig.scheduleType === "weekly" && (!scheduleConfig.scheduleDays || scheduleConfig.scheduleDays.length === 0)) {
      alert("Atur jadwal mingguan dulu (pilih hari) lewat tombol Atur Jadwal.");
      return;
    }

    try {
      await api.post("sites/", {
        url,
        monitor_type: monitorType,
        css_selector: monitorType === "selector" ? selectedSelector : "",
        selected_text: monitorType === "selector" ? selectedText : "",
        crop_x: monitorType === "crop" ? cropArea?.x : null,
        crop_y: monitorType === "crop" ? cropArea?.y : null,
        crop_width: monitorType === "crop" ? cropArea?.width : null,
        crop_height: monitorType === "crop" ? cropArea?.height : null,
        schedule_type: scheduleConfig.scheduleType,
        schedule_value: scheduleConfig.scheduleValue,
        schedule_unit: scheduleConfig.scheduleUnit,
        schedule_time: scheduleConfig.scheduleTime,
        schedule_days: scheduleConfig.scheduleDays ? scheduleConfig.scheduleDays.join(",") : null,
        notify_email: notifyEmail,
        notify_telegram: notifyTelegram,
        email_target: emailTarget,
      });
      alert("Monitoring berhasil ditambahkan");
      loadSites();
      backToPicker();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan monitoring");
    }
  };

  const previewWebsite = async () => {
    if (!url) { alert("Masukkan URL"); return; }
    try {
      setLoadingPreview(true);
      const res = await api.post("screenshot/", { url });
      setPreviewImage(`data:image/png;base64,${res.data.image}`);
      setPageMeta({ viewportWidth: res.data.viewport_width, viewportHeight: res.data.viewport_height });
      setSelectedPoint(null);
      setSelectedSelector("");
      setSelectedText("");
      setCropArea(null);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil screenshot");
    } finally {
      setLoadingPreview(false);
    }
  };

  const getSelector = async (realX, realY) => {
    try {
      setLoadingSelector(true);
      const res = await api.post("get-selector/", { url, x: Math.round(realX), y: Math.round(realY) });
      setSelectedSelector(res.data.selector);
      setSelectedText(res.data.text);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil selector");
    } finally {
      setLoadingSelector(false);
    }
  };

  const describeCropArea = async (area) => {
    if (!previewImage) return;
    setLoadingCropDescription(true);
    setCropDescription("");
    try {
        const canvas = document.createElement("canvas");
        canvas.width = area.width;
        canvas.height = area.height;
        const ctx = canvas.getContext("2d");
        const fullImg = new Image();
        fullImg.src = previewImage;
        await new Promise((resolve) => { fullImg.onload = resolve; });
        ctx.drawImage(fullImg, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
        const croppedBase64 = canvas.toDataURL("image/png").split(",")[1];

        const res = await api.post("describe-crop/", { image: croppedBase64 });
        setCropDescription(res.data.description || "Tidak dapat mendeskripsikan area ini.");
    } catch (err) {
        console.error(err);
        setCropDescription("Gagal menganalisis area.");
    } finally {
        setLoadingCropDescription(false);
    }
};

  const handleCropMouseDown = (e) => {
    if (monitorType !== "crop") return;
    const rect = imgRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
    setCropArea(null);
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging || !dragStart || monitorType !== "crop") return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropArea({ x: Math.min(dragStart.x, x), y: Math.min(dragStart.y, y), width: Math.abs(x - dragStart.x), height: Math.abs(y - dragStart.y) });
  };

  const handleCropMouseUp = (e) => {
    if (!isDragging || !dragStart || monitorType !== "crop") return;
    setIsDragging(false);
    if (pageMeta && imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        const scaleX = pageMeta.viewportWidth / rect.width;
        const scaleY = pageMeta.viewportHeight / rect.height;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const area = {
            x: Math.round(Math.min(dragStart.x, x) * scaleX),
            y: Math.round(Math.min(dragStart.y, y) * scaleY),
            width: Math.round(Math.abs(x - dragStart.x) * scaleX),
            height: Math.round(Math.abs(y - dragStart.y) * scaleY),
        };
        setCropArea(area);
        if (area.width > 5 && area.height > 5) {
            describeCropArea(area);
        }
    }
};

  const handleSelectorClick = (e) => {
    if (monitorType !== "selector") return;
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    setSelectedPoint({ x: clickX, y: clickY });
    if (pageMeta) {
      getSelector(clickX * (pageMeta.viewportWidth / rect.width), clickY * (pageMeta.viewportHeight / rect.height));
    }
  };

  useEffect(() => { loadSites(); }, []);

  useEffect(() => {
    sites.forEach((s) => loadHistory(s.id));
  }, [sites.length]);

  useEffect(() => {
    async function checkTelegramStatus() {
      try {
        const res = await api.get("telegram/status/");
        setTelegramConnected(res.data.connected);
      } catch (err) {
        console.error(err);
      }
    }
    checkTelegramStatus();
  }, []);

  const scheduleUnitLabel = { minute: "mnt", hour: "jam", day: "hari", week: "minggu" };
  const weekdayLabel = { mon: "Sen", tue: "Sel", wed: "Rab", thu: "Kam", fri: "Jum", sat: "Sab", sun: "Min" };

  function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
  }

  function formatScheduleConfig(cfg) {
    if (cfg.scheduleType === "interval") {
      return `Tiap ${cfg.scheduleValue} ${scheduleUnitLabel[cfg.scheduleUnit] || cfg.scheduleUnit}`;
    }
    if (cfg.scheduleType === "daily") {
      return `Harian, ${cfg.scheduleTime || "-"}`;
    }
    if (cfg.scheduleType === "custom_days") {
      return `Tiap ${cfg.customDays} hari, ${cfg.scheduleTime || "-"}`;
    }
    if (cfg.scheduleType === "weekly") {
      const days = (cfg.scheduleDays || []).map((d) => weekdayLabel[d] || d).join(", ");
      return days ? `${days}, ${cfg.scheduleTime || "-"}` : "Belum pilih hari";
    }
    return "-";
  }

  function formatSchedule(site) {
    if (site.schedule_type === "interval" || !site.schedule_type) {
      return `Tiap ${site.schedule_value} ${scheduleUnitLabel[site.schedule_unit] || site.schedule_unit}`;
    }
    if (site.schedule_type === "daily") {
      return `Harian, ${site.schedule_time?.slice(0, 5) || "-"}`;
    }
    if (site.schedule_type === "custom_days") {
      return `Tiap ${site.schedule_value} hari, ${site.schedule_time?.slice(0, 5) || "-"}`;
    }
    if (site.schedule_type === "weekly") {
      const days = (site.schedule_days || "")
        .split(",")
        .map((d) => weekdayLabel[d.trim()] || d)
        .join(", ");
      return `${days}, ${site.schedule_time?.slice(0, 5) || "-"}`;
    }
    return "-";
  }

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        :root {
          --paper: #F7F8FA;
          --surface: #FFFFFF;
          --surface-hover: #FDFDFE;
          --ink: #14171F;
          --muted: #767B87;
          --line: #E3E5EA;
          --line-strong: #C7CAD2;
          --red: #B34A3C;
          --red-bg: rgba(179,74,60,0.07);
          --red-bg-strong: rgba(179,74,60,0.12);
          --green: #1F7A4D;
          --green-bg: rgba(31,122,77,0.07);
          --green-bg-strong: rgba(31,122,77,0.12);
          --amber: #B8791F;
          --amber-bg: rgba(184,121,31,0.08);
        }

        .dark .m-wrap {
          --paper: #14161D;
          --surface: #1C1F29;
          --surface-hover: #22262F;
          --ink: #E7E8ED;
          --muted: #8B90A0;
          --line: rgba(255,255,255,0.08);
          --line-strong: rgba(255,255,255,0.16);
          --red: #E0776A;
          --red-bg: rgba(224,119,106,0.12);
          --red-bg-strong: rgba(224,119,106,0.18);
          --green: #3FBE84;
          --green-bg: rgba(63,190,132,0.12);
          --green-bg-strong: rgba(63,190,132,0.18);
          --amber: #E0A83F;
          --amber-bg: rgba(224,168,63,0.12);
        }

        .m-wrap { font-family: 'Inter', sans-serif; color: var(--ink); max-width: 100%; width: 100%; box-sizing: border-box; }
        .m-mono { font-family: 'JetBrains Mono', monospace; }

        .m-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 26px; }
        .m-title { font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
        .m-live {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--green);
        }
        .m-live::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--green); animation: mpulse 1.8s ease-in-out infinite;
        }
        @keyframes mpulse { 0%,100%{opacity:1} 50%{opacity:.25} }

        .m-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; margin-bottom: 28px; background: var(--line); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
        .m-stat { background: var(--surface); padding: 16px 20px; }
        .m-stat-label { font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; color: var(--muted); margin-bottom: 8px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .m-stat-val { font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
        .m-stat-val.green { color: var(--green); }

        .m-picker-title { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
        .m-picker-sub { font-size: 0.85rem; color: var(--muted); margin-bottom: 20px; }
        .m-picker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 720px) { .m-picker-grid { grid-template-columns: 1fr; } }

        .m-picker-card {
          position: relative; text-align: left; border-radius: 8px; padding: 22px;
          cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease;
          border: 1px solid var(--line); background: var(--surface);
        }
        .m-picker-card:hover { border-color: var(--line-strong); background: var(--surface-hover); }
        .m-picker-icon {
          width: 36px; height: 36px; border-radius: 7px; display: flex; align-items: center;
          justify-content: center; margin-bottom: 16px; border: 1px solid var(--line); background: var(--paper); color: var(--ink);
        }
        .m-picker-name { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 700; color: var(--ink); margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
        .m-picker-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
        .m-picker-badge {
          display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.04em;
          border: 1px solid var(--line-strong); color: var(--ink); padding: 2px 7px; border-radius: 4px;
        }

        .m-diffstrip {
          font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; line-height: 1.9;
          border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 16px;
        }
        .m-diffrow { display: flex; }
        .m-diffgutter { width: 22px; flex-shrink: 0; text-align: center; user-select: none; font-weight: 700; }
        .m-diffrow.del { background: var(--red-bg); color: var(--red); }
        .m-diffrow.del .m-diffgutter { background: var(--red-bg-strong); }
        .m-diffrow.add { background: var(--green-bg); color: var(--green); }
        .m-diffrow.add .m-diffgutter { background: var(--green-bg-strong); }
        .m-diffrow.del .m-difftext { text-decoration: line-through; text-decoration-color: rgba(179,74,60,0.5); }
        .m-difftext { padding: 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .m-picker-cta {
          display: inline-flex; align-items: center; gap: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 600;
          color: var(--ink);
        }

        .m-panel {
          border-radius: 8px; overflow: hidden; margin-bottom: 20px;
          border: 1px solid var(--line);
        }
        .m-panel-head {
          padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; gap: 12px;
          background: var(--paper); border-bottom: 1px solid var(--line);
        }
        .m-panel-head-left { display: flex; align-items: center; gap: 12px; }
        .m-panel-icon {
          width: 34px; height: 34px; border-radius: 7px; display: flex; align-items: center; justify-content: center;
          color: var(--ink); background: var(--surface); border: 1px solid var(--line); flex-shrink: 0;
        }
        .m-panel-title { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; }
        .m-panel-sub { font-size: 0.76rem; color: var(--muted); margin-top: 2px; }
        .m-back-btn {
          display: inline-flex; align-items: center; gap: 5px; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 600;
          padding: 7px 12px; border-radius: 6px; background: var(--surface); border: 1px solid var(--line-strong); color: var(--ink);
          cursor: pointer; transition: background 0.15s;
        }
        .m-back-btn:hover { background: var(--paper); }
        .m-panel-body { background: var(--surface); padding: 24px 22px; }

        .m-label {
          display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
        }
        .m-input {
          width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--line-strong); border-radius: 6px;
          font-size: 0.88rem; font-family: 'JetBrains Mono', monospace; color: var(--ink); background: var(--paper);
          outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
        }
        .m-input:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(20,23,31,0.08); background: var(--surface); }
        .m-input::placeholder { color: #B6BAC3; }
        .m-segment { display: inline-flex; gap: 3px; background: var(--paper); border: 1px solid var(--line); border-radius: 7px; padding: 3px; }
        .m-seg {
          padding: 7px 15px; border-radius: 5px; font-size: 0.82rem; font-weight: 600; color: var(--muted);
          cursor: pointer; border: none; background: transparent; transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif;
        }
        .m-seg.active { background: var(--ink); color: var(--surface); }
        .m-divider { height: 1px; background: var(--line); margin: 20px 0; }
        .m-notif-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--paper); }
        .m-notif-row:last-child { border-bottom: none; }
        .m-notif-icon {
          width: 30px; height: 30px; border-radius: 6px; background: var(--paper); border: 1px solid var(--line); display: flex;
          align-items: center; justify-content: center; color: var(--ink); flex-shrink: 0;
        }
        .m-notif-label { font-size: 0.86rem; font-weight: 500; color: var(--ink); flex: 1; }
        .m-notif-input {
          height: 34px; padding: 0 12px; border: 1px solid var(--line-strong); border-radius: 6px;
          font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; color: var(--ink); background: var(--paper);
          outline: none; width: 210px; box-sizing: border-box; transition: border-color 0.15s;
        }
        .m-notif-input:focus { border-color: var(--ink); background: var(--surface); }
        .m-notif-help { font-size: 0.72rem; color: var(--muted); margin: -6px 0 12px 42px; }
        .m-toggle-wrap { position: relative; width: 34px; height: 19px; cursor: pointer; flex-shrink: 0; }
        .m-toggle-wrap input { opacity: 0; width: 0; height: 0; }
        .m-toggle-slider { position: absolute; inset: 0; border-radius: 99px; background: var(--line-strong); transition: background 0.2s; }
        .m-toggle-slider::after {
          content: ''; position: absolute; left: 2px; top: 2px; width: 15px; height: 15px; border-radius: 50%;
          background: #fff; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .m-toggle-wrap input:checked + .m-toggle-slider { background: var(--ink); }
        .m-toggle-wrap input:checked + .m-toggle-slider::after { transform: translateX(15px); }
        .m-btn-row { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }
        .m-btn {
          display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 6px;
          font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: 1px solid var(--line-strong);
          background: var(--surface); color: var(--ink); transition: all 0.15s;
        }
        .m-btn:hover { background: var(--paper); }
        .m-btn:active { transform: scale(0.98); }
        .m-btn-primary { background: var(--green); color: #fff; border: 1px solid var(--green); }
        .m-btn-primary:hover { filter: brightness(1.08); background: var(--green); }
        .m-btn:disabled { opacity: 0.5; cursor: wait; }
        .m-btn-sm { padding: 5px 11px; font-size: 0.7rem; }
        .m-spin {
          width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff; animation: mspin 0.6s linear infinite;
        }
        .m-spin.dark { border-color: rgba(20,23,31,0.18); border-top-color: var(--ink); }
        @keyframes mspin { to { transform: rotate(360deg); } }
        .m-preview-outer { display: flex; gap: 18px; align-items: flex-start; margin-top: 22px; }
        .m-preview-col { flex: 0 0 auto; width: 640px; max-width: 100%; }
        .m-preview-side { flex: 1; min-width: 0; }
        @media (max-width: 768px) { .m-preview-outer { flex-direction: column; } .m-preview-col { width: 100%; } }
        .m-preview-wrap { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--line-strong); }
        .m-preview-img { width: 100%; display: block; }
        .m-preview-img.sel { cursor: crosshair; }
        .m-preview-img.crop { cursor: cell; }
        .m-preview-img.locked { cursor: default; }
        .m-pin {
          position: absolute; width: 16px; height: 16px; background: var(--green); border-radius: 50%;
          border: 2px solid var(--surface); box-shadow: 0 1px 4px rgba(31,122,77,0.5);
          transform: translate(-50%,-50%); pointer-events: none;
        }
        .m-crop-box { position: absolute; border: 1.5px dashed var(--green); background: var(--green-bg); pointer-events: none; }
        .m-coords { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .m-coord {
          display: flex; align-items: center; gap: 5px; background: var(--paper); border: 1px solid var(--line);
          border-radius: 6px; padding: 5px 10px; font-family: 'JetBrains Mono', monospace; font-size: 0.73rem; color: var(--ink);
        }
        .m-coord span { color: var(--muted); font-size: 0.66rem; }
        .m-info-label { font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .m-info-box {
          border-radius: 6px; padding: 12px 14px; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;
          font-size: 0.76rem; line-height: 1.6; word-break: break-all; white-space: pre-wrap;
          border: 1px solid var(--line); background: var(--paper); color: var(--ink);
        }
        .m-info-box.tracked, .m-info-box.new { background: var(--green-bg); border-color: rgba(31,122,77,0.25); color: var(--green); }
        .m-ai-banner {
          display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 8px;
          background: var(--paper); border: 1px solid var(--line); margin-bottom: 22px;
        }
        .m-ai-banner-icon {
          width: 30px; height: 30px; border-radius: 6px; background: var(--surface); border: 1px solid var(--line);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--ink);
        }
        .m-ai-banner-text { font-size: 0.81rem; color: var(--ink); line-height: 1.6; }
        .m-ai-banner-text strong { color: var(--ink); }
        .m-tbl { width: 100%; border-collapse: collapse; font-size: 0.82rem; table-layout: fixed; }
        .m-tbl th {
          text-align: left; padding: 10px 14px; white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line);
        }
        .m-tbl td {
          padding: 13px 14px; border-bottom: 1px solid var(--paper); color: var(--ink); vertical-align: middle;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .m-tbl tr:last-child td { border-bottom: none; }
        .m-tbl tbody tr:hover { background: var(--paper); }
        .m-url { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; color: var(--ink); }
        .m-el { font-size: 0.78rem; color: var(--muted); }
        .m-type-tag {
          display: inline-flex; align-items: center; gap: 5px; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; padding: 3px 8px;
          border-radius: 5px; background: var(--paper); border: 1px solid var(--line); color: var(--ink); font-weight: 600;
        }
        .m-interval { display: inline-flex; align-items: center; gap: 5px; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }
        .m-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; }
        .m-pill.on { background: var(--green-bg); color: var(--green); border: 1px solid rgba(31,122,77,0.25); }
        .m-pill.on::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; animation:mpulse 1.8s ease-in-out infinite; }
        .m-pill.off { background: var(--surface); color: var(--muted); border: 1px solid var(--line); }
        .m-empty { text-align: center; padding: 44px 16px; }
        .m-empty-ico { color: var(--muted); margin-bottom: 10px; display: flex; justify-content: center; }
        .m-empty-txt { font-family: 'JetBrains Mono', monospace; font-size: 0.86rem; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
        .m-empty-sub { font-size: 0.78rem; color: var(--muted); }
        .m-lastcheck { font-family: 'JetBrains Mono', monospace; font-size: 0.73rem; color: var(--muted); }
        .m-lastcheck .changed { color: var(--green); font-weight: 700; margin-left: 6px; }
        .m-lastcheck.none { color: var(--line-strong); }
        .m-table-card { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 20px; }
        .m-table-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
        .m-table-icon {
          width: 30px; height: 30px; border-radius: 6px; background: var(--paper); display: flex;
          align-items: center; justify-content: center; color: var(--ink); border: 1px solid var(--line);
        }
        .m-table-title { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; color: var(--ink); }

        .m-schedule-summary {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          border: 1px solid var(--line-strong); border-radius: 6px; padding: 12px 14px; background: var(--paper);
        }
        .m-schedule-summary-text { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 7px; }

        /* Aksi: tombol icon-only untuk toggle & hapus */
        .m-actions { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
        .m-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--line);
          background: var(--surface); color: var(--muted); cursor: pointer; transition: all 0.15s; flex-shrink: 0;
        }
        .m-icon-btn:hover { background: var(--paper); color: var(--ink); }
        .m-icon-btn:disabled { opacity: 0.5; cursor: wait; }
        .m-icon-btn.danger:hover { background: var(--red-bg); color: var(--red); border-color: var(--red); }

        /* Modal konfirmasi (nonaktifkan / hapus) */
        .m-modal-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .m-modal-backdrop { position: absolute; inset: 0; background: rgba(10,12,16,0.45); }
        .m-modal { position: relative; width: 100%; max-width: 360px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); padding: 20px; }
        .m-modal-title { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .m-modal-desc { font-size: 0.83rem; color: var(--muted); line-height: 1.55; margin-bottom: 18px; }
        .m-modal-desc strong { color: var(--ink); font-family: 'JetBrains Mono', monospace; font-weight: 600; word-break: break-all; }
        .m-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .m-modal-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; font-weight: 600; padding: 8px 14px; border-radius: 6px; cursor: pointer; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); transition: background 0.15s; }
        .m-modal-btn:hover { background: var(--paper); }
        .m-modal-btn.warn { background: var(--amber); border-color: var(--amber); color: #fff; }
        .m-modal-btn.warn:hover { filter: brightness(1.08); }
        .m-modal-btn.danger { background: var(--red); border-color: var(--red); color: #fff; }
        .m-modal-btn.danger:hover { filter: brightness(1.08); }
        .m-modal-btn:disabled { opacity: 0.5; cursor: wait; }
      `}</style>

      <div className="m-wrap">

        {/* Header */}
        <div className="m-header">
          <h1 className="m-title">monitoring</h1>
          <span className="m-live">live</span>
        </div>

        {/* Stats */}
        <div className="m-stats">
          <div className="m-stat">
            <div className="m-stat-label">Total dipantau</div>
            <div className="m-stat-val">{sites.length}</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-label">Aktif</div>
            <div className="m-stat-val green">{sites.filter(s => s.is_active).length}</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-label">Nonaktif</div>
            <div className="m-stat-val">{sites.filter(s => !s.is_active).length}</div>
          </div>
        </div>

        {/* MODEL PICKER (full, hanya muncul kalau belum pilih model) */}
        {!model && (
          <div style={{ marginBottom: 28 }}>
            <div className="m-picker-title">Pilih model monitoring</div>
            <div className="m-picker-sub">Pilih cara sistem membandingkan versi lama dan baru dari situsmu</div>

            <div className="m-picker-grid">
              <div className="m-picker-card" onClick={() => chooseModel("model1")}>
                <div className="m-picker-icon"><IconTarget width={18} height={18} /></div>
                <div className="m-picker-name">Elemen / area spesifik</div>
                <div className="m-picker-desc">
                  Klik elemen tertentu di halaman, atau tandai area di screenshot, AI sebagai titik yang dibandingkan setiap pengecekan.
                </div>
                <div className="m-picker-cta">Pilih model ini <IconChevron width={13} height={13} /></div>
              </div>

              <div className="m-picker-card" onClick={() => chooseModel("model2")}>
                <div className="m-picker-icon"><IconPage width={18} height={18} /></div>
                <div className="m-picker-name">
                  Full page monitoring
                  <span className="m-picker-badge">AI</span>
                </div>
                <div className="m-picker-desc">
                  Pantau seluruh halaman sekaligus. AI membandingkan snapshot lama dan baru lalu menjelaskan apa yang berubah.
                </div>
                <div className="m-picker-cta">Pilih model ini <IconChevron width={13} height={13} /></div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL MODEL 1 */}
        {model === "model1" && (
          <div className="m-panel">
            <div className="m-panel-head">
              <div className="m-panel-head-left">
                <div className="m-panel-icon"><IconTarget width={17} height={17} /></div>
                <div>
                  <div className="m-panel-title">Elemen / area spesifik</div>
                  <div className="m-panel-sub">Pantau bagian tertentu dari halaman</div>
                </div>
              </div>
              <button className="m-back-btn" onClick={backToPicker}>← Ganti model</button>
            </div>

            <div className="m-panel-body">
              <div style={{ marginBottom: 18 }}>
                <label className="m-label">URL website</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="m-input"
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="m-label">Tipe pemantauan</label>
                <div className="m-segment">
                  <button
                    className={`m-seg${subType === "selector" ? " active" : ""}`}
                    onClick={() => { setSubType("selector"); setCropArea(null); }}
                  >
                    <IconTarget width={14} height={14} /> Selector
                  </button>
                  <button
                    className={`m-seg${subType === "crop" ? " active" : ""}`}
                    onClick={() => { setSubType("crop"); setSelectedPoint(null); setSelectedSelector(""); setSelectedText(""); }}
                  >
                    <IconCrop width={14} height={14} /> Crop area
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="m-label">Jadwal pengecekan</label>
                <div className="m-schedule-summary">
                  <span className="m-schedule-summary-text"><IconClock width={14} height={14} /> {formatScheduleConfig(scheduleConfig)}</span>
                  <button type="button" onClick={() => setScheduleModalOpen(true)} className="m-btn m-btn-sm">
                    Atur jadwal
                  </button>
                </div>
              </div>

              <div className="m-divider" />

              <label className="m-label">Notifikasi</label>
              <div className="m-notif-row">
                <div className="m-notif-icon"><IconMail width={15} height={15} /></div>
                <span className="m-notif-label">Email</span>
                {notifyEmail && (
                  <input
                    type="email"
                    placeholder="nama@gmail.com"
                    value={emailTarget}
                    onChange={(e) => setEmailTarget(e.target.value)}
                    className="m-notif-input"
                  />
                )}
                <label className="m-toggle-wrap">
                  <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                  <span className="m-toggle-slider" />
                </label>
              </div>

              <div className="m-notif-row">
                <div className="m-notif-icon"><IconSend width={15} height={15} /></div>
                <span className="m-notif-label">Telegram</span>
                <label className="m-toggle-wrap">
                  <input type="checkbox" checked={notifyTelegram} onChange={(e) => setNotifyTelegram(e.target.checked)} />
                  <span className="m-toggle-slider" />
                </label>
              </div>
              {notifyTelegram && !telegramConnected && (
                <p className="m-notif-help">
                  Akun Telegram kamu belum terhubung.{" "}
                  <a href="/dashboard/settings" style={{ color: "var(--ink)", fontWeight: 700 }}>
                    Hubungkan dulu di Settings →
                  </a>
                </p>
              )}
              {notifyTelegram && telegramConnected && (
                <p className="m-notif-help" style={{ color: "var(--green)" }}>
                  Akun Telegram kamu sudah terhubung, notifikasi akan dikirim otomatis.
                </p>
              )}

              <div className="m-btn-row">
                <button onClick={previewWebsite} className="m-btn" disabled={loadingPreview}>
                  {loadingPreview ? <><span className="m-spin dark" /> Memuat...</> : <><IconCamera width={14} height={14} /> Preview</>}
                </button>
                <button onClick={createSite} className="m-btn m-btn-primary">
                  <IconCommit width={14} height={14} /> Simpan monitoring
                </button>
              </div>

              {previewImage && (
                <div className="m-preview-outer">
                  <div className="m-preview-col">
                    <div
                      className="m-preview-wrap"
                      onMouseDown={subType === "crop" ? handleCropMouseDown : undefined}
                      onMouseMove={subType === "crop" ? handleCropMouseMove : undefined}
                      onMouseUp={subType === "crop" ? handleCropMouseUp : undefined}
                    >
                      <img
                        ref={imgRef}
                        src={previewImage}
                        alt="Preview"
                        className={`m-preview-img ${subType === "selector" ? "sel" : "crop"}`}
                        onClick={subType === "selector" ? handleSelectorClick : undefined}
                        draggable={false}
                      />
                      {subType === "selector" && selectedPoint && (
                        <div className="m-pin" style={{ left: selectedPoint.x, top: selectedPoint.y }} />
                      )}
                      {subType === "crop" && cropArea && (
                        <div className="m-crop-box" style={{ left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height }} />
                      )}
                    </div>

                    {subType === "selector" && selectedPoint && (
                      <div className="m-coords">
                        <div className="m-coord"><span>X</span>{Math.round(selectedPoint.x)}</div>
                        <div className="m-coord"><span>Y</span>{Math.round(selectedPoint.y)}</div>
                      </div>
                    )}
                    {subType === "crop" && cropArea && (
                      <div className="m-coords">
                        <div className="m-coord"><span>X</span>{cropArea.x}</div>
                        <div className="m-coord"><span>Y</span>{cropArea.y}</div>
                        <div className="m-coord"><span>W</span>{cropArea.width}</div>
                        <div className="m-coord"><span>H</span>{cropArea.height}</div>
                      </div>
                    )}
                  </div>

                  {subType === "selector" && selectedPoint && (
                    <div className="m-preview-side">
                      <div className="m-info-label">CSS selector</div>
                      <div className="m-info-box">
                        {loadingSelector ? "Mencari selector…" : selectedSelector || "—"}
                      </div>
                      <div className="m-info-label">Baseline yang dilacak</div>
                      <div className="m-info-box tracked">
                        {loadingSelector ? "Mengambil konten…" : (selectedText ? `+ ${selectedText}` : "—")}
                      </div>
                    </div>
                  )}

                  {subType === "crop" && cropArea && (
                    <div className="m-preview-side">
        <div className="m-info-label">Isi Area Terpilih</div>
        <div className="m-info-box new">
            {loadingCropDescription ? "Menganalisis area…" : cropDescription || "—"}
        </div>
    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL MODEL 2 */}
        {model === "model2" && (
          <div className="m-panel">
            <div className="m-panel-head">
              <div className="m-panel-head-left">
                <div className="m-panel-icon"><IconPage width={17} height={17} /></div>
                <div>
                  <div className="m-panel-title">
                    Full page monitoring
                    <span className="m-picker-badge">AI</span>
                  </div>
                  <div className="m-panel-sub">Analisis perubahan otomatis dengan AI</div>
                </div>
              </div>
              <button className="m-back-btn" onClick={backToPicker}>← Ganti model</button>
            </div>

            <div className="m-panel-body">
              <div className="m-ai-banner">
                <div className="m-ai-banner-icon"><DiffMark size={11} /></div>
                <div className="m-ai-banner-text">
                  Seluruh halaman di-screenshot setiap jadwal pengecekan. Saat AI mendeteksi perbedaan dari snapshot
                  sebelumnya, kamu dapat penjelasan lewat notifikasi — bukan cuma "ada perubahan", tapi
                  <strong> apa yang berubah, baris per baris.</strong>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="m-label">URL website</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="m-input"
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="m-label">Jadwal pengecekan</label>
                <div className="m-schedule-summary">
                  <span className="m-schedule-summary-text"><IconClock width={14} height={14} /> {formatScheduleConfig(scheduleConfig)}</span>
                  <button type="button" onClick={() => setScheduleModalOpen(true)} className="m-btn m-btn-sm">
                    Atur jadwal
                  </button>
                </div>
              </div>

              <div className="m-divider" />

              <label className="m-label">Notifikasi</label>
              <div className="m-notif-row">
                <div className="m-notif-icon"><IconMail width={15} height={15} /></div>
                <span className="m-notif-label">Email</span>
                {notifyEmail && (
                  <input
                    type="email"
                    placeholder="nama@gmail.com"
                    value={emailTarget}
                    onChange={(e) => setEmailTarget(e.target.value)}
                    className="m-notif-input"
                  />
                )}
                <label className="m-toggle-wrap">
                  <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                  <span className="m-toggle-slider" />
                </label>
              </div>

              <div className="m-notif-row">
                <div className="m-notif-icon"><IconSend width={15} height={15} /></div>
                <span className="m-notif-label">Telegram</span>
                <label className="m-toggle-wrap">
                  <input type="checkbox" checked={notifyTelegram} onChange={(e) => setNotifyTelegram(e.target.checked)} />
                  <span className="m-toggle-slider" />
                </label>
              </div>
              {notifyTelegram && !telegramConnected && (
                <p className="m-notif-help">
                  Akun Telegram kamu belum terhubung.{" "}
                  <a href="/dashboard/settings" style={{ color: "var(--ink)", fontWeight: 700 }}>
                    Hubungkan dulu di Settings →
                  </a>
                </p>
              )}
              {notifyTelegram && telegramConnected && (
                <p className="m-notif-help" style={{ color: "var(--green)" }}>
                  Akun Telegram kamu sudah terhubung, notifikasi akan dikirim otomatis.
                </p>
              )}

              <div className="m-btn-row">
                <button onClick={previewWebsite} className="m-btn" disabled={loadingPreview}>
                  {loadingPreview ? <><span className="m-spin dark" /> Memuat...</> : <><IconCamera width={14} height={14} /> Preview</>}
                </button>
                <button onClick={createSite} className="m-btn m-btn-primary">
                  <IconCommit width={14} height={14} /> Simpan monitoring
                </button>
              </div>

              {previewImage && (
                <div className="m-preview-outer">
                  <div className="m-preview-col">
                    <div className="m-preview-wrap">
                      <img src={previewImage} alt="Preview" className="m-preview-img locked" draggable={false} />
                    </div>
                  </div>
                  <div className="m-preview-side">
                    <div className="m-info-label">Mode AI</div>
                    <div className="m-info-box tracked">
                      + Snapshot referensi disimpan. Setiap ada perubahan, AI membandingkan versi lama dan baru lalu menjelaskan detailnya.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sites Table */}
        <div className="m-table-card">
          <div className="m-table-head">
            <div className="m-table-icon"><IconPulse width={15} height={15} /></div>
            <span className="m-table-title">Website dipantau</span>
          </div>

          {sites.length === 0 ? (
            <div className="m-empty">
              <div className="m-empty-ico"><IconEmptyBox width={26} height={26} /></div>
              <div className="m-empty-txt">Belum ada website dipantau</div>
              <div className="m-empty-sub">Pilih model di atas untuk memulai</div>
            </div>
          ) : (
            <table className="m-tbl">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>URL</th>
                  <th style={{ width: "13%" }}>Elemen</th>
                  <th style={{ width: "9%" }}>Tipe</th>
                  <th style={{ width: "15%" }}>Jadwal</th>
                  <th style={{ width: "15%" }}>Terakhir dicek</th>
                  <th style={{ width: "9%" }}>Status</th>
                  <th style={{ width: "17%" }} className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td><span className="m-url" title={site.url}>{site.url}</span></td>
                    <td>
                      <span className="m-el" title={site.css_selector}>
                        {site.monitor_type === "crop"
                          ? `Crop ${site.crop_width}×${site.crop_height}`
                          : site.monitor_type === "fullpage"
                          ? "Seluruh halaman"
                          : site.selected_text || site.css_selector || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="m-type-tag">
                        {site.monitor_type === "crop"
                          ? <><IconCrop width={11} height={11} /> Crop</>
                          : site.monitor_type === "fullpage"
                          ? <><IconPage width={11} height={11} /> AI</>
                          : <><IconTarget width={11} height={11} /> Selector</>}
                      </span>
                    </td>
                    <td>
                      <span className="m-interval"><IconClock width={12} height={12} /> {formatSchedule(site)}</span>
                    </td>
                    <td>
                      {siteHistories[site.id]?.last_checked_at ? (
                        <span className="m-lastcheck">
                          {formatDateTime(siteHistories[site.id].last_checked_at)}
                          {siteHistories[site.id].last_changed && (
                            <span className="changed">± berubah</span>
                          )}
                        </span>
                      ) : (
                        <span className="m-lastcheck none">Belum pernah</span>
                      )}
                    </td>
                    <td>
                      <span className={`m-pill ${site.is_active ? "on" : "off"}`}>
                        {site.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="m-actions">
                        <button
                          onClick={() => checkNow(site.id)}
                          disabled={checkingId === site.id}
                          className="m-btn m-btn-sm"
                          title="Cek sekarang"
                        >
                          {checkingId === site.id ? <span className="m-spin dark" /> : <IconSearch width={12} height={12} />}
                        </button>
                        <button
                          onClick={() => handleToggleClick(site)}
                          disabled={togglingId === site.id}
                          className="m-icon-btn"
                          title={site.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {togglingId === site.id ? <span className="m-spin dark" /> : <IconPower width={13} height={13} />}
                        </button>
                        <button
                          onClick={() => setDeletingSite(site)}
                          className="m-icon-btn danger"
                          title="Hapus monitoring"
                        >
                          <IconTrash width={13} height={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        initialValue={scheduleConfig}
        onSave={(cfg) => setScheduleConfig(cfg)}
      />

      {/* Modal konfirmasi nonaktifkan */}
      {deactivatingSite && (
        <div className="m-modal-overlay">
          <div className="m-modal-backdrop" onClick={() => setDeactivatingSite(null)} />
          <div className="m-modal">
            <div className="m-modal-title">Nonaktifkan Monitoring</div>
            <div className="m-modal-desc">
              Yakin mau nonaktifkan monitoring untuk <strong>{deactivatingSite.url}</strong>? Situs ini akan berhenti dicek sampai diaktifkan lagi.
            </div>
            <div className="m-modal-actions">
              <button className="m-modal-btn" onClick={() => setDeactivatingSite(null)}>Batal</button>
              <button className="m-modal-btn warn" onClick={confirmDeactivate} disabled={togglingId === deactivatingSite.id}>
                {togglingId === deactivatingSite.id ? "Memproses..." : "Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal konfirmasi hapus */}
      {deletingSite && (
        <div className="m-modal-overlay">
          <div className="m-modal-backdrop" onClick={() => !deletingBusy && setDeletingSite(null)} />
          <div className="m-modal">
            <div className="m-modal-title">Hapus Monitoring</div>
            <div className="m-modal-desc">
              Yakin mau hapus monitoring untuk <strong>{deletingSite.url}</strong>? Tindakan ini tidak bisa dibatalkan, dan seluruh riwayat pengecekannya ikut terhapus.
            </div>
            <div className="m-modal-actions">
              <button className="m-modal-btn" onClick={() => setDeletingSite(null)} disabled={deletingBusy}>Batal</button>
              <button className="m-modal-btn danger" onClick={handleDelete} disabled={deletingBusy}>
                {deletingBusy ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}