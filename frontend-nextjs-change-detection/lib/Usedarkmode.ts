"use client";
import { useState, useEffect } from "react";

/**
 * Shared dark-mode hook — persists the choice to localStorage so it
 * carries over across pages/navigations (landing, login, dashboard, etc).
 * Use this SAME hook on every page that should share the theme.
 */
export function useDarkMode(): [boolean, (value: boolean) => void, boolean] {
    const [dark, setDarkState] = useState<boolean>(false);
    const [ready, setReady] = useState(false);

    // Read stored preference (or system preference as fallback) on mount
    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            setDarkState(true);
        } else if (stored === "light") {
            setDarkState(false);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setDarkState(true);
        }
        setReady(true);
    }, []);

    // Keep in sync if theme is changed from another tab/page
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "theme") setDarkState(e.newValue === "dark");
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const setDark = (value: boolean) => {
        setDarkState(value);
        localStorage.setItem("theme", value ? "dark" : "light");
    };

    return [dark, setDark, ready];
}