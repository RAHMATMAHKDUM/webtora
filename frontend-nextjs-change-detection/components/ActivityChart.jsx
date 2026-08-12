"use client";

import { useMemo, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

const SERIES_CONFIG = [
    {
        key: "monitoring",
        label: "Total Monitored",
        color: "#4f46e5",
        gradientId: "colorMonitoring",
    },
    {
        key: "active",
        label: "Active Sites",
        color: "#7dd3fc",
        gradientId: "colorActive",
    },
];

const RANGES = ["Month", "Quarter", "Year"];

const EXPECTED_BUCKETS = {
    Month: 30,
    Quarter: 13,
    Year: 12,
};

const BUCKET_UNIT_LABEL = {
    Month: "days",
    Quarter: "weeks",
    Year: "months",
};

/**
 * Mengelompokkan data berdasarkan range.
 *
 * Data yang diharapkan:
 * {
 *   date: "2026-07-28",
 *   monitoring: 5,
 *   active: 3
 * }
 */
function aggregateByRange(rawData, range) {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        return [];
    }

    const hasDates = rawData.every((d) => d.date);

    if (!hasDates) {
        return rawData;
    }

    const sorted = [...rawData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    // MONTH
    if (range === "Month") {
        return sorted
            .slice(-EXPECTED_BUCKETS.Month)
            .map((d) => ({
                ...d,
                month: new Date(d.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                }),
            }));
    }

    // QUARTER
    if (range === "Quarter") {
        const buckets = new Map();

        sorted.forEach((d) => {
            const dt = new Date(d.date);

            const weekStart = new Date(dt);

            weekStart.setDate(
                dt.getDate() - dt.getDay()
            );

            const key = weekStart
                .toISOString()
                .slice(0, 10);

            if (!buckets.has(key)) {
                buckets.set(key, {
                    date: key,
                    monitoring: 0,
                    active: 0,
                    _count: 0,
                });
            }

            const bucket = buckets.get(key);

            bucket.monitoring += d.monitoring ?? 0;
            bucket.active += d.active ?? 0;
            bucket._count += 1;
        });

        return Array.from(buckets.values())
            .slice(-EXPECTED_BUCKETS.Quarter)
            .map((bucket) => ({
                month: `Wk of ${new Date(
                    bucket.date
                ).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                })}`,
                monitoring: Math.round(
                    bucket.monitoring / bucket._count
                ),
                active: Math.round(
                    bucket.active / bucket._count
                ),
            }));
    }

    // YEAR
    const buckets = new Map();

    sorted.forEach((d) => {
        const dt = new Date(d.date);

        const key = `${dt.getFullYear()}-${dt.getMonth()}`;

        if (!buckets.has(key)) {
            buckets.set(key, {
                label: dt.toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                }),
                monitoring: 0,
                active: 0,
                _count: 0,
            });
        }

        const bucket = buckets.get(key);

        bucket.monitoring += d.monitoring ?? 0;
        bucket.active += d.active ?? 0;
        bucket._count += 1;
    });

    return Array.from(buckets.values())
        .slice(-EXPECTED_BUCKETS.Year)
        .map((bucket) => ({
            month: bucket.label,
            monitoring: Math.round(
                bucket.monitoring / bucket._count
            ),
            active: Math.round(
                bucket.active / bucket._count
            ),
        }));
}

/**
 * Tooltip grafik
 */
function CustomTooltip({
    active,
    payload,
    label,
}) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg px-4 py-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {label}
            </p>

            {payload.map((item) => (
                <p
                    key={item.dataKey}
                    className="text-sm font-semibold flex items-center gap-1.5"
                    style={{
                        color: item.color,
                    }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                            background: item.color,
                        }}
                    />

                    <span>
                        {item.value} {item.name}
                    </span>
                </p>
            ))}
        </div>
    );
}

/**
 * Custom dot pada grafik
 */
function makeDot(color) {
    return function Dot(props) {
        const { cx, cy } = props;

        if (
            cx === undefined ||
            cy === undefined
        ) {
            return null;
        }

        return (
            <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
            />
        );
    };
}

/**
 * Legend
 */
function LegendDot({
    color,
    label,
    sub,
    badge,
}) {
    return (
        <div className="flex items-start gap-2">
            <span
                className="w-3 h-3 rounded-full mt-0.5 shrink-0 ring-4"
                style={{
                    background: color,
                    "--tw-ring-color": `${color}22`,
                }}
            />

            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span
                        className="text-sm font-semibold"
                        style={{
                            color,
                        }}
                    >
                        {label}
                    </span>

                    {badge}
                </div>

                {sub && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {sub}
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Grafik utama Activity
 */
function MainAreaChart({
    data,
    range,
    setRange,
}) {
    const rawData = data || [];

    const chartData = useMemo(
        () =>
            aggregateByRange(
                rawData,
                range
            ),
        [rawData, range]
    );

    const activeSeries = useMemo(
        () =>
            SERIES_CONFIG.filter((series) =>
                chartData.some(
                    (item) =>
                        item[series.key] !==
                        undefined
                )
            ),
        [chartData]
    );

    const rangeLabel = useMemo(() => {
        const first =
            chartData[0]?.month ??
            chartData[0]?.date;

        const last =
            chartData[
                chartData.length - 1
            ]?.month ??
            chartData[
                chartData.length - 1
            ]?.date;

        return first && last
            ? `${first} - ${last}`
            : "";
    }, [chartData]);

    const primaryTrend = useMemo(() => {
        const key =
            activeSeries[0]?.key ??
            "monitoring";

        const values = chartData.map(
            (item) =>
                item[key] ?? 0
        );

        const current =
            values[values.length - 1] ??
            0;

        const previous =
            values.length >= 2
                ? values[values.length - 2]
                : null;

        const difference =
            previous !== null
                ? current - previous
                : 0;

        const percentage =
            previous === null
                ? 0
                : previous === 0
                ? current === 0
                    ? 0
                    : 100
                : (difference /
                      previous) *
                  100;

        return {
            diff: difference,
            percent: percentage,
            trend:
                previous === null
                    ? "flat"
                    : difference > 0
                    ? "up"
                    : difference < 0
                    ? "down"
                    : "flat",
            hasPrev:
                previous !== null,
        };
    }, [
        chartData,
        activeSeries,
    ]);

    const trendStyles = {
        up: {
            text: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            Icon: TrendingUp,
        },

        down: {
            text: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-500/10",
            Icon: TrendingDown,
        },

        flat: {
            text: "text-slate-500 dark:text-slate-400",
            bg: "bg-slate-100 dark:bg-slate-800",
            Icon: Minus,
        },
    }[primaryTrend.trend];

    const expectedBuckets =
        EXPECTED_BUCKETS[range];

    const coverageNote =
        chartData.length > 0 &&
        chartData.length <
            expectedBuckets
            ? `Showing available history (${chartData.length} of ${expectedBuckets} expected ${BUCKET_UNIT_LABEL[range]})`
            : null;

    return (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-5 lg:p-6 h-full">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-6 flex-wrap">
                    {activeSeries.map(
                        (series, index) => (
                            <LegendDot
                                key={
                                    series.key
                                }
                                color={
                                    series.color
                                }
                                label={
                                    series.label
                                }
                                sub={
                                    rangeLabel
                                }
                                badge={
                                    index ===
                                        0 &&
                                    primaryTrend.hasPrev ? (
                                        <span
                                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${trendStyles.bg} ${trendStyles.text}`}
                                        >
                                            <trendStyles.Icon
                                                size={
                                                    11
                                                }
                                            />

                                            {primaryTrend.trend ===
                                            "flat"
                                                ? "0%"
                                                : `${
                                                      primaryTrend.diff >
                                                      0
                                                          ? "+"
                                                          : ""
                                                  }${primaryTrend.percent.toFixed(
                                                      1
                                                  )}%`}
                                        </span>
                                    ) : null
                                }
                            />
                        )
                    )}
                </div>

                {/* Range selector */}
                <div className="inline-flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {RANGES.map(
                        (item) => (
                            <button
                                key={
                                    item
                                }
                                onClick={() =>
                                    setRange(
                                        item
                                    )
                                }
                                className={`
                                    px-3.5 py-1.5 rounded-md text-xs font-medium transition
                                    ${
                                        range ===
                                        item
                                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                    }
                                `}
                            >
                                {item}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Coverage */}
            {coverageNote ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-4">
                    {coverageNote}
                </p>
            ) : (
                <div className="mb-6" />
            )}

            {/* Chart */}
            {chartData.length > 0 ? (
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 12,
                            left: -12,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            {activeSeries.map(
                                (series) => (
                                    <linearGradient
                                        key={
                                            series.gradientId
                                        }
                                        id={
                                            series.gradientId
                                        }
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={
                                                series.color
                                            }
                                            stopOpacity={
                                                0.35
                                            }
                                        />

                                        <stop
                                            offset="95%"
                                            stopColor={
                                                series.color
                                            }
                                            stopOpacity={
                                                0.03
                                            }
                                        />
                                    </linearGradient>
                                )
                            )}
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#eef1f6"
                            vertical={false}
                        />

                        <XAxis
                            dataKey={(item) =>
                                item.month ??
                                item.date
                            }
                            tick={{
                                fontSize: 12,
                                fill: "#94a3b8",
                            }}
                            axisLine={false}
                            tickLine={false}
                            dy={8}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{
                                fontSize: 12,
                                fill: "#94a3b8",
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            content={
                                <CustomTooltip />
                            }
                        />

                        {activeSeries.map(
                            (series) => (
                                <Area
                                    key={
                                        series.key
                                    }
                                    type="monotone"
                                    dataKey={
                                        series.key
                                    }
                                    name={
                                        series.label
                                    }
                                    stroke={
                                        series.color
                                    }
                                    strokeWidth={
                                        2.5
                                    }
                                    fillOpacity={
                                        1
                                    }
                                    fill={`url(#${series.gradientId})`}
                                    dot={makeDot(
                                        series.color
                                    )}
                                    activeDot={{
                                        r: 6,
                                        strokeWidth: 2,
                                        stroke: "#fff",
                                        fill: series.color,
                                    }}
                                />
                            )
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-slate-400">
                            Belum ada data
                            aktivitas.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * ActivityChart
 *
 * Versi ini hanya menampilkan:
 * - Total Monitored
 * - Active Sites
 * - Grafik Area
 * - Filter Month / Quarter / Year
 *
 * Card "This Week's Activity" sudah dihapus.
 */
export default function ActivityChart({
    data,
    range: rangeProp,
    onRangeChange,
}) {
    const [
        internalRange,
        setInternalRange,
    ] = useState("Month");

    const range =
        rangeProp ?? internalRange;

    const setRange = (value) => {
        if (onRangeChange) {
            onRangeChange(value);
        } else {
            setInternalRange(value);
        }
    };

    return (
        <MainAreaChart
            data={data}
            range={range}
            setRange={setRange}
        />
    );
}