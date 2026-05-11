"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import Card from "./Card";
import { SensitivityResult } from "@/lib/sensitivity";
import { SolverInput } from "@/lib/solver";
import { downloadSensitivityExcel } from "@/lib/sensitivityExport";

interface Props {
  data: SensitivityResult;
  input: SolverInput;
}

/* ── Tornado Chart ────────────────────────────────────── */

function TornadoChart({ data }: { data: SensitivityResult }) {
  const items = data.tornado.slice(0, 10).reverse(); // top 10, reversed for horizontal bars
  const base = data.baseline.P;

  const chartData = items.map((t) => {
    const lowDelta = Math.round((t.lowPatients - base) * 100) / 100;
    const highDelta = Math.round((t.highPatients - base) * 100) / 100;
    // For the tornado, we want red = worse direction, green = better direction
    // Show as a range bar: [min(lowDelta, highDelta), max(lowDelta, highDelta)]
    const negSide = Math.min(lowDelta, highDelta);
    const posSide = Math.max(lowDelta, highDelta);
    return {
      name: t.paramLabel,
      negative: negSide,
      positive: posSide,
      range: t.range,
    };
  });

  return (
    <Card delay={0.1}>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">
        Tornado Chart — Impact of ±20% Change on Patients
      </h3>
      <p className="text-[10px] text-slate-500 mb-4">
        Bars show ΔP relative to baseline ({base} patients). Longer bars = higher sensitivity.
      </p>
      <ResponsiveContainer width="100%" height={Math.max(280, items.length * 32)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            label={{ value: "ΔP (patients)", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 10 }}
          />
          <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={160} />
          <Tooltip
            contentStyle={{ background: "#0f1219", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 10, color: "#f1f3f8" }}
          />
          <ReferenceLine x={0} stroke="#4b5563" strokeDasharray="3 3" />
          <Bar dataKey="negative" name="Decrease (−20%)" fill="#f87171" radius={[4, 0, 0, 4]} />
          <Bar dataKey="positive" name="Increase (+20%)" fill="#34d399" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

/* ── Parameter Sweep Line Charts ──────────────────────── */

function SweepCharts({ data }: { data: SensitivityResult }) {
  const [selected, setSelected] = useState(data.tornado[0]?.paramKey ?? "B");
  const sweep = data.sweeps.find((s) => s.paramKey === selected);

  return (
    <Card delay={0.2}>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">
        Parameter Sweep — One-at-a-Time
      </h3>
      <p className="text-[10px] text-slate-500 mb-3">
        See how P* changes as each parameter varies from −50% to +50%.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {data.sweeps.map((s) => (
          <button
            key={s.paramKey}
            onClick={() => setSelected(s.paramKey)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              selected === s.paramKey
                ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                : "bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:text-slate-300"
            }`}
          >
            {s.paramKey}
          </button>
        ))}
      </div>

      {sweep && (
        <>
          <p className="text-xs text-slate-400 mb-2">
            {sweep.paramLabel} — baseline: <span className="text-white font-medium">{sweep.baseline}</span>
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={sweep.points} margin={{ left: 0, right: 20, top: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="pctChange"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${v}%`}
                label={{ value: "% Change", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 10 }}
              />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#0f1219", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 10, color: "#f1f3f8" }}
                formatter={(v: unknown) => [Number(v).toFixed(2), "Patients"]}
                labelFormatter={(l: unknown) => `${Number(l) >= 0 ? "+" : ""}${l}% change`}
              />
              <ReferenceLine x={0} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: "Baseline", fill: "#8b5cf6", fontSize: 9 }} />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}

/* ── Shadow Prices Table ──────────────────────────────── */

function ShadowPricesTable({ data }: { data: SensitivityResult }) {
  return (
    <Card delay={0.3}>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">
        Approximate Marginal Values (Finite-Difference Estimates)
      </h3>
      <p className="text-[10px] text-slate-500 mb-3">
        Marginal value of relaxing each constraint by a small ε. Higher values = most valuable to relax.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="pb-2 text-left font-medium">Constraint</th>
              <th className="pb-2 text-right font-medium">Binding?</th>
              <th className="pb-2 text-right font-medium">ε</th>
              <th className="pb-2 text-right font-medium">ΔP / Δε</th>
              <th className="pb-2 text-left font-medium pl-3">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {data.shadowPrices.map((s, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-2 text-slate-300">{s.constraint}</td>
                <td className="py-2 text-right">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${s.binding ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/[0.03] text-slate-500 border border-white/[0.06]"}`}>
                    {s.binding ? "Yes" : "No"}
                  </span>
                </td>
                <td className="py-2 text-right text-slate-400">{s.epsilon.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="py-2 text-right font-mono text-slate-300">{s.marginalValue.toFixed(4)}</td>
                <td className="py-2 text-left text-slate-500 pl-3 text-[10px]">{s.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── Heatmap ──────────────────────────────────────────── */

function HeatmapChart({ data }: { data: SensitivityResult }) {
  const { heatmap } = data;
  const maxP = Math.max(...heatmap.cells.map((c) => c.patients));
  const minP = Math.min(...heatmap.cells.map((c) => c.patients));

  const cellSize = 36;
  const labelW = 70;
  const labelH = 40;
  const width = labelW + heatmap.xValues.length * cellSize;
  const height = labelH + heatmap.yValues.length * cellSize;

  const colorScale = (p: number) => {
    const t = maxP > minP ? (p - minP) / (maxP - minP) : 0.5;
    const r = Math.round(30 + (59 - 30) * (1 - t));
    const g = Math.round(30 + (130 - 30) * t);
    const b = Math.round(80 + (246 - 80) * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <Card delay={0.35}>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">
        Heatmap — Budget × Space → Patients
      </h3>
      <p className="text-[10px] text-slate-500 mb-4">
        Each cell shows P* for that (Budget, Space) combination. Brighter blue = more patients.
      </p>
      <div className="overflow-x-auto">
        <svg width={width + 20} height={height + 20} className="mx-auto">
          {/* X axis labels */}
          {heatmap.xValues.map((x, xi) => (
            <text
              key={`xl-${xi}`}
              x={labelW + xi * cellSize + cellSize / 2}
              y={labelH - 6}
              fill="#64748b"
              fontSize={8}
              textAnchor="middle"
            >
              {x >= 1000000 ? `${(x / 1000000).toFixed(1)}M` : x >= 1000 ? `${(x / 1000).toFixed(0)}K` : x}
            </text>
          ))}
          {/* Y axis labels */}
          {heatmap.yValues.map((y, yi) => (
            <text
              key={`yl-${yi}`}
              x={labelW - 6}
              y={labelH + yi * cellSize + cellSize / 2 + 3}
              fill="#64748b"
              fontSize={8}
              textAnchor="end"
            >
              {y >= 1000 ? `${(y / 1000).toFixed(1)}K` : y}
            </text>
          ))}
          {/* Cells */}
          {heatmap.yValues.map((y, yi) =>
            heatmap.xValues.map((x, xi) => {
              const cell = heatmap.cells.find((c) => c.x === x && c.y === y);
              const p = cell?.patients ?? 0;
              return (
                <g key={`${xi}-${yi}`}>
                  <rect
                    x={labelW + xi * cellSize}
                    y={labelH + yi * cellSize}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill={colorScale(p)}
                    rx={4}
                  />
                  <text
                    x={labelW + xi * cellSize + cellSize / 2}
                    y={labelH + yi * cellSize + cellSize / 2 + 3}
                    fill="white"
                    fontSize={8}
                    textAnchor="middle"
                    fontWeight={500}
                  >
                    {Math.round(p)}
                  </text>
                </g>
              );
            })
          )}
          {/* Axis titles */}
          <text x={labelW + (heatmap.xValues.length * cellSize) / 2} y={12} fill="#94a3b8" fontSize={10} textAnchor="middle" fontWeight={600}>
            {heatmap.xLabel}
          </text>
          <text
            x={10}
            y={labelH + (heatmap.yValues.length * cellSize) / 2}
            fill="#94a3b8"
            fontSize={10}
            textAnchor="middle"
            fontWeight={600}
            transform={`rotate(-90, 10, ${labelH + (heatmap.yValues.length * cellSize) / 2})`}
          >
            {heatmap.yLabel}
          </text>
        </svg>
      </div>
    </Card>
  );
}

/* ── Breakpoints Table ────────────────────────────────── */

function BreakpointsTable({ data }: { data: SensitivityResult }) {
  if (data.breakpoints.length === 0) return null;
  return (
    <Card delay={0.4}>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">
        Bottleneck Shift Breakpoints
      </h3>
      <p className="text-[10px] text-slate-500 mb-3">
        Parameter values where the binding constraint (bottleneck) changes.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-500">
              <th className="pb-2 text-left font-medium">Parameter</th>
              <th className="pb-2 text-right font-medium">Threshold</th>
              <th className="pb-2 text-left font-medium pl-3">Before</th>
              <th className="pb-2 text-center font-medium">→</th>
              <th className="pb-2 text-left font-medium">After</th>
            </tr>
          </thead>
          <tbody>
            {data.breakpoints.map((b, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-2 text-slate-300">{b.paramLabel}</td>
                <td className="py-2 text-right font-mono text-amber-300">{b.value.toLocaleString()}</td>
                <td className="py-2 text-left text-slate-400 pl-3">{b.bottleneckBefore}</td>
                <td className="py-2 text-center text-slate-600">→</td>
                <td className="py-2 text-left text-slate-300">{b.bottleneckAfter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── Main Component ───────────────────────────────────── */

export default function SensitivityDisplay({ data, input }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 tracking-tight">
          Sensitivity Results
        </h2>
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => downloadSensitivityExcel(input, data)}
          className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
        >
          Export Excel
        </motion.button>
      </div>

      {/* Contextual explanation */}
      <div className="card p-3 border-l-2 border-l-blue-500/30">
        <p className="text-[11px] leading-relaxed text-slate-500">
          These results show how your optimal solution changes if one parameter shifts — helping you identify which constraints are truly limiting you. A high marginal value means relaxing that constraint yields the greatest return.
        </p>
      </div>

      {/* Baseline reminder */}
      <div className="card p-3 flex items-center gap-3">
        <div>
          <div className="text-[10px] text-slate-500">Baseline Optimal</div>
          <div className="text-lg font-bold text-white tabular-nums">
            {data.baseline.P} patients
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] text-slate-500">Bottleneck</div>
          <div className="text-sm font-semibold text-amber-300">{data.baseline.bottleneck}</div>
        </div>
      </div>

      <TornadoChart data={data} />
      <SweepCharts data={data} />
      <ShadowPricesTable data={data} />
      <HeatmapChart data={data} />
      <BreakpointsTable data={data} />

      {/* Bottom export */}
      <motion.button
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => downloadSensitivityExcel(input, data)}
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
      >
        Download Full Sensitivity Report (Excel)
      </motion.button>
    </motion.div>
  );
}
