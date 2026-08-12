"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * Central dictionary for the app's 2 supported languages.
 * Add new keys here as more pages/components get wired up to useLanguage().
 */
const translations = {
    en: {
        // Settings
        language: "Language",
        settingsTitle: "Settings",
        settingsSubtitle: "Manage your account information and notification preferences.",
        accountInfo: "Account Information",
        username: "Username",
        readOnly: "read-only",
        email: "Email",
        noEmail: "No email yet",
        passwordHint: "Leave this section blank if you don't want to change your password.",
        oldPassword: "Current Password",
        newPassword: "New Password",
        saveChanges: "Save Changes",
        saving: "Saving...",
        savedOk: "Changes saved successfully.",
        loading: "Loading...",
        loadErrorGeneric: "Couldn't load your profile. Please log in again.",

        // Common brand
        brandName: "Change Detection",
        brandSubUser: "Dashboard",
        brandSubAdmin: "Admin Panel",

        // Sidebar (user)
        navDashboard: "Dashboard",
        navMonitoring: "Monitoring",
        navNotifications: "Notifications",
        navSettings: "Settings",
        logout: "Logout",
        openMenu: "Open menu",
        closeMenu: "Close menu",

        // AdminSidebar
        navUsers: "Users",
        navNotification: "Notification",
        navActivity: "Activity",
        administrator: "Administrator",
        superAdmin: "Super Admin",

        // Topbar / AdminHeader
        searchPlaceholder: "Search...",
        profile: "Profile",

        // Logout confirm modal
        logoutConfirmTitle: "Sign out of your account?",
        logoutConfirmDesc: "You'll need to log in again to access the dashboard.",
        cancel: "Cancel",

        // Monitoring page
        monStatTotal: "Total Monitored",
        monStatActive: "Active",
        monStatInactive: "Inactive",
        monPickerTitle: "Choose a monitoring model",
        monPickerSub: "Choose how the system compares your site's old and new versions",
        monModel1Name: "Specific element / area",
        monModel1Desc: "Click a specific element on the page, or mark an area on the screenshot, as the point compared on every check.",
        monModel2Name: "Full page monitoring",
        monModel2Desc: "Monitor the entire page at once. AI compares the old and new snapshot and explains what changed.",
        monPickerCta: "Choose this model",
        monDiffStockOut: "Stock: Out",
        monDiffStockAvail: "Stock: Available",
        monDiffTitleBefore: "<title>Shop — Maintenance</title>",
        monDiffTitleAfter: "<title>Shop — Open</title>",
        monPanel1Sub: "Monitor a specific part of the page",
        monBackBtn: "← Change model",
        monUrlLabel: "Website URL",
        monTypeLabel: "Monitoring type",
        monScheduleLabel: "Check schedule",
        monSetScheduleBtn: "Set schedule",
        monNotifLabel: "Notifications",
        monTelegramNotConnected: "Your Telegram account isn't connected yet.",
        monTelegramConnectLink: "Connect it in Settings →",
        monTelegramConnected: "Your Telegram account is connected, notifications will be sent automatically.",
        monPreviewBtn: "Preview",
        monLoadingDots: "Loading...",
        monSaveBtn: "Save monitoring",
        monCssSelectorLabel: "CSS selector",
        monFindingSelector: "Finding selector…",
        monTrackedBaselineLabel: "Tracked baseline",
        monFetchingContent: "Fetching content…",
        monSelectedAreaLabel: "Selected area",
        monPanel2Sub: "Automatic change analysis with AI",
        monAiBannerPre: "The entire page is captured on every scheduled check. When AI detects a difference from the previous snapshot, you get an explanation in your notification — not just \"something changed\", but ",
        monAiBannerStrong: "exactly what changed, line by line.",
        monAiModeLabel: "AI mode",
        monAiModeDesc: "+ Reference snapshot saved. Whenever there's a change, AI compares the old and new version and explains the details.",
        monTableTitle: "Monitored websites",
        monEmptyTitle: "No websites monitored yet",
        monEmptySub: "Choose a model above to get started",
        monThElement: "Element",
        monThType: "Type",
        monThSchedule: "Schedule",
        monThLastChecked: "Last checked",
        monThAction: "Action",
        monEntirePage: "Entire page",
        monNeverChecked: "Never checked",
        monChangedTag: "± changed",
        monCheckBtn: "Check",
        monCheckingBtn: "Checking...",
        monAlertUrlRequired: "URL is required",
        monAlertEmailRequired: "Enter a notification email, or turn off the Email toggle.",
        monAlertTelegramRequired: "Connect your Telegram account first on the Settings page.",
        monAlertWeeklyRequired: "Set up the weekly schedule first (pick days) via the Set Schedule button.",
        monAlertCreateSuccess: "Monitoring added successfully",
        monAlertCreateFail: "Failed to add monitoring",
        monAlertUrlNeeded: "Enter a URL",
        monAlertScreenshotFail: "Failed to capture screenshot",
        monAlertSelectorFail: "Failed to get selector",
        monAlertCheckFail: "Check failed.",
    },
    id: {
        // Settings
        language: "Bahasa",
        settingsTitle: "Pengaturan",
        settingsSubtitle: "Kelola informasi akun dan preferensi notifikasi kamu.",
        accountInfo: "Informasi Akun",
        username: "Username",
        readOnly: "read-only",
        email: "Email",
        noEmail: "Belum ada email",
        passwordHint: "Kosongkan bagian ini jika tidak mau ganti password.",
        oldPassword: "Password Lama",
        newPassword: "Password Baru",
        saveChanges: "Simpan Perubahan",
        saving: "Menyimpan...",
        savedOk: "Perubahan berhasil disimpan.",
        loading: "Memuat...",
        loadErrorGeneric: "Gagal memuat profil. Silakan login ulang.",

        // Common brand
        brandName: "Change Detection",
        brandSubUser: "Dashboard",
        brandSubAdmin: "Admin Panel",

        // Sidebar (user)
        navDashboard: "Dashboard",
        navMonitoring: "Monitoring",
        navNotifications: "Notifikasi",
        navSettings: "Pengaturan",
        logout: "Logout",
        openMenu: "Buka menu",
        closeMenu: "Tutup menu",

        // AdminSidebar
        navUsers: "Pengguna",
        navNotification: "Notifikasi",
        navActivity: "Aktivitas",
        administrator: "Administrator",
        superAdmin: "Super Admin",

        // Topbar / AdminHeader
        searchPlaceholder: "Cari...",
        profile: "Profil",

        // Logout confirm modal
        logoutConfirmTitle: "Keluar dari akun?",
        logoutConfirmDesc: "Kamu harus login lagi untuk mengakses dashboard.",
        cancel: "Batal",

        // Monitoring page
        monStatTotal: "Total Dipantau",
        monStatActive: "Aktif",
        monStatInactive: "Nonaktif",
        monPickerTitle: "Pilih model monitoring",
        monPickerSub: "Pilih cara sistem membandingkan versi lama dan baru dari situsmu",
        monModel1Name: "Elemen / area spesifik",
        monModel1Desc: "Klik elemen tertentu di halaman, atau tandai area di screenshot, sebagai titik yang dibandingkan setiap pengecekan.",
        monModel2Name: "Full page monitoring",
        monModel2Desc: "Pantau seluruh halaman sekaligus. AI membandingkan snapshot lama dan baru lalu menjelaskan apa yang berubah.",
        monPickerCta: "Pilih model ini",
        monDiffStockOut: "Stok: Habis",
        monDiffStockAvail: "Stok: Tersedia",
        monDiffTitleBefore: "<title>Toko — Maintenance</title>",
        monDiffTitleAfter: "<title>Toko — Buka</title>",
        monPanel1Sub: "Pantau bagian tertentu dari halaman",
        monBackBtn: "← Ganti model",
        monUrlLabel: "URL website",
        monTypeLabel: "Tipe pemantauan",
        monScheduleLabel: "Jadwal pengecekan",
        monSetScheduleBtn: "Atur jadwal",
        monNotifLabel: "Notifikasi",
        monTelegramNotConnected: "Akun Telegram kamu belum terhubung.",
        monTelegramConnectLink: "Hubungkan dulu di Settings →",
        monTelegramConnected: "Akun Telegram kamu sudah terhubung, notifikasi akan dikirim otomatis.",
        monPreviewBtn: "Preview",
        monLoadingDots: "Memuat...",
        monSaveBtn: "Simpan monitoring",
        monCssSelectorLabel: "CSS selector",
        monFindingSelector: "Mencari selector…",
        monTrackedBaselineLabel: "Baseline yang dilacak",
        monFetchingContent: "Mengambil konten…",
        monSelectedAreaLabel: "Area terpilih",
        monPanel2Sub: "Analisis perubahan otomatis dengan AI",
        monAiBannerPre: "Seluruh halaman di-screenshot setiap jadwal pengecekan. Saat AI mendeteksi perbedaan dari snapshot sebelumnya, kamu dapat penjelasan lewat notifikasi — bukan cuma \"ada perubahan\", tapi ",
        monAiBannerStrong: "apa yang berubah, baris per baris.",
        monAiModeLabel: "Mode AI",
        monAiModeDesc: "+ Snapshot referensi disimpan. Setiap ada perubahan, AI membandingkan versi lama dan baru lalu menjelaskan detailnya.",
        monTableTitle: "Website dipantau",
        monEmptyTitle: "Belum ada website dipantau",
        monEmptySub: "Pilih model di atas untuk memulai",
        monThElement: "Elemen",
        monThType: "Tipe",
        monThSchedule: "Jadwal",
        monThLastChecked: "Terakhir dicek",
        monThAction: "Aksi",
        monEntirePage: "Seluruh halaman",
        monNeverChecked: "Belum pernah",
        monChangedTag: "± berubah",
        monCheckBtn: "Cek",
        monCheckingBtn: "Cek...",
        monAlertUrlRequired: "URL wajib diisi",
        monAlertEmailRequired: "Isi email tujuan notifikasi, atau matikan toggle Email.",
        monAlertTelegramRequired: "Hubungkan akun Telegram kamu dulu di halaman Settings.",
        monAlertWeeklyRequired: "Atur jadwal mingguan dulu (pilih hari) lewat tombol Atur Jadwal.",
        monAlertCreateSuccess: "Monitoring berhasil ditambahkan",
        monAlertCreateFail: "Gagal menambahkan monitoring",
        monAlertUrlNeeded: "Masukkan URL",
        monAlertScreenshotFail: "Gagal mengambil screenshot",
        monAlertSelectorFail: "Gagal mengambil selector",
        monAlertCheckFail: "Gagal melakukan pengecekan.",
    },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState("id");

    useEffect(() => {
        const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
        if (stored === "en" || stored === "id") setLangState(stored);
    }, []);

    const setLang = useCallback((next) => {
        setLangState(next);
        if (typeof window !== "undefined") localStorage.setItem("lang", next);
    }, []);

    const t = useCallback(
        (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
        [lang]
    );

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error("useLanguage must be used inside <LanguageProvider>");
    }
    return ctx;
}