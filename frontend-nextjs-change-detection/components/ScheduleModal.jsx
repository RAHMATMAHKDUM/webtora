"use client";
import { useState, useEffect } from "react";
import { X, Minus, Plus, Clock, Repeat, CalendarDays, CalendarClock, CalendarRange, Check } from "lucide-react";

const WEEKDAYS = [
    { code: "mon", label: "Sen" },
    { code: "tue", label: "Sel" },
    { code: "wed", label: "Rab" },
    { code: "thu", label: "Kam" },
    { code: "fri", label: "Jum" },
    { code: "sat", label: "Sab" },
    { code: "sun", label: "Min" },
];

const SCHEDULE_TYPES = [
    { key: "interval", icon: Repeat, label: "Interval", desc: "Ulangi tiap X menit/jam" },
    { key: "daily", icon: CalendarClock, label: "Harian", desc: "Jam tertentu, tiap hari" },
    { key: "custom_days", icon: CalendarDays, label: "Tiap N Hari", desc: "Setiap beberapa hari" },
    { key: "weekly", icon: CalendarRange, label: "Mingguan", desc: "Pilih hari tertentu" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function Stepper({ value, onChange, min = 1, max = 999 }) {
    return (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-1.5">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition text-slate-600 dark:text-slate-200"
            >
                <Minus size={16} />
            </button>
            <span className="w-14 text-center text-lg font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition text-slate-600 dark:text-slate-200"
            >
                <Plus size={16} />
            </button>
        </div>
    );
}

function TimePicker({ hour, minute, onChangeHour, onChangeMinute }) {
    return (
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <select
                value={hour}
                onChange={(e) => onChangeHour(e.target.value)}
                className="flex-1 rounded-xl border-0 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm outline-none cursor-pointer appearance-none text-center"
            >
                {HOURS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                ))}
            </select>
            <span className="text-slate-400 font-bold">:</span>
            <select
                value={minute}
                onChange={(e) => onChangeMinute(e.target.value)}
                className="flex-1 rounded-xl border-0 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm outline-none cursor-pointer appearance-none text-center"
            >
                {MINUTES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
        </div>
    );
}

export default function ScheduleModal({ open, onClose, initialValue, onSave }) {
    const [scheduleType, setScheduleType] = useState("interval");
    const [intervalValue, setIntervalValue] = useState(1);
    const [intervalUnit, setIntervalUnit] = useState("hour");
    const [hour, setHour] = useState("08");
    const [minute, setMinute] = useState("00");
    const [customDays, setCustomDays] = useState(3);
    const [weeklyDays, setWeeklyDays] = useState([]);

    useEffect(() => {
        if (!open || !initialValue) return;
        setScheduleType(initialValue.scheduleType || "interval");
        setIntervalValue(initialValue.scheduleValue || 1);
        setIntervalUnit(initialValue.scheduleUnit || "hour");
        if (initialValue.scheduleTime) {
            const [h, m] = initialValue.scheduleTime.split(":");
            setHour(h || "08");
            setMinute(m || "00");
        }
        setCustomDays(initialValue.customDays || 3);
        setWeeklyDays(initialValue.scheduleDays || []);
    }, [open, initialValue]);

    if (!open) return null;

    function toggleDay(code) {
        setWeeklyDays((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    }

    function handleSave() {
        if (scheduleType === "weekly" && weeklyDays.length === 0) {
            alert("Pilih minimal 1 hari untuk jadwal mingguan.");
            return;
        }

        onSave({
            scheduleType,
            scheduleValue: scheduleType === "interval" ? intervalValue : scheduleType === "custom_days" ? customDays : null,
            scheduleUnit: scheduleType === "interval" ? intervalUnit : null,
            scheduleTime: scheduleType !== "interval" ? `${hour}:${minute}` : null,
            scheduleDays: scheduleType === "weekly" ? weeklyDays : null,
            customDays,
        });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
                            <CalendarClock size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Atur Jadwal</h2>
                            <p className="text-xs text-slate-400">Pilih kapan situs dicek</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                        {SCHEDULE_TYPES.map((opt) => {
                            const Icon = opt.icon;
                            const active = scheduleType === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setScheduleType(opt.key)}
                                    className={`relative text-left rounded-2xl border-2 p-3.5 transition-all duration-150 ${
                                        active
                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                            : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700"
                                    }`}
                                >
                                    {active && (
                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                            <Check size={12} className="text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                                            active ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-700"
                                        }`}
                                    >
                                        <Icon size={15} className={active ? "text-white" : "text-slate-500 dark:text-slate-300"} />
                                    </div>
                                    <div className={`text-sm font-semibold mb-0.5 ${active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200"}`}>
                                        {opt.label}
                                    </div>
                                    <div className="text-[11px] text-slate-400 leading-tight">{opt.desc}</div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4">
                        {scheduleType === "interval" && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                    Cek setiap
                                </label>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Stepper value={intervalValue} onChange={setIntervalValue} min={1} max={999} />
                                    <div className="flex gap-1.5">
                                        {["minute", "hour"].map((u) => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => setIntervalUnit(u)}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                                                    intervalUnit === u
                                                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                                        : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                                                }`}
                                            >
                                                {u === "minute" ? "Menit" : "Jam"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {scheduleType === "daily" && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                    Setiap hari, pukul
                                </label>
                                <TimePicker hour={hour} minute={minute} onChangeHour={setHour} onChangeMinute={setMinute} />
                            </div>
                        )}

                        {scheduleType === "custom_days" && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                        Setiap berapa hari
                                    </label>
                                    <Stepper value={customDays} onChange={setCustomDays} min={1} max={365} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                        Pukul
                                    </label>
                                    <TimePicker hour={hour} minute={minute} onChangeHour={setHour} onChangeMinute={setMinute} />
                                </div>
                            </div>
                        )}

                        {scheduleType === "weekly" && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                        Pilih hari
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {WEEKDAYS.map((d) => (
                                            <button
                                                key={d.code}
                                                type="button"
                                                onClick={() => toggleDay(d.code)}
                                                className={`w-11 h-11 rounded-2xl text-xs font-bold transition-all duration-150 ${
                                                    weeklyDays.includes(d.code)
                                                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-none scale-105"
                                                        : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-indigo-300"
                                                }`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                        Pukul
                                    </label>
                                    <TimePicker hour={hour} minute={minute} onChangeHour={setHour} onChangeMinute={setMinute} />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full mt-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold py-3.5 shadow-lg shadow-indigo-200 dark:shadow-none transition active:scale-[0.98]"
                    >
                        Simpan Jadwal
                    </button>
                </div>
            </div>
        </div>
    );
}