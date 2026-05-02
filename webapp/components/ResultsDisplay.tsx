"use client";

import { motion } from "framer-motion";
import Card from "./Card";
import { SolverResult } from "@/lib/solver";
import { SolverInput } from "@/lib/solver";
import { downloadExcel } from "@/lib/excelExport";

interface ResultsDisplayProps {
  result: SolverResult;
  input: SolverInput;
}

export default function ResultsDisplay({ result, input }: ResultsDisplayProps) {
  const avgLOS = input.avgLOS || 5;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <h2 className="text-lg font-semibold text-slate-200 tracking-tight">
        Optimization Results
      </h2>

      {!result.optimal && (
        <div className="rounded-[10px] border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          No optimal solution found. Try adjusting your parameters.
        </div>
      )}

      {/* ── Hero: Patient Capacity ── */}
      <Card delay={0.05}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Patient Capacity
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 tabular-nums">
              {result.intP.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">patients at any time</div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              (beds occupied simultaneously)
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 tabular-nums">
              ~{result.annualThroughput.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">patients treated per year</div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              ({result.intP} beds × 365 ÷ {avgLOS}-day stay)
            </div>
          </div>
        </div>
      </Card>

      {/* ── Staff & Equipment to Hire/Buy ── */}
      <Card delay={0.12}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          What You Need to Hire &amp; Purchase (Annual)
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              value: result.intD,
              label: "Doctors",
              sub: "full-time equivalent",
              cost: `€${(result.intD * input.Cd).toLocaleString()}/yr`,
              color: "text-purple-400",
            },
            {
              value: result.intN,
              label: "Nurses",
              sub: "full-time equivalent",
              cost: `€${(result.intN * input.Cn).toLocaleString()}/yr`,
              color: "text-emerald-400",
            },
            {
              value: result.intE,
              label: "Monitors",
              sub: "monitoring stations",
              cost: `€${(result.intE * input.Ce).toLocaleString()}/yr`,
              color: "text-amber-400",
            },
            {
              value: result.intB,
              label: "Beds",
              sub: "hospital beds",
              cost: `€${(result.intB * input.Cb).toLocaleString()}/yr`,
              color: "text-rose-400",
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="rounded-xl bg-[#1a1f33] p-3 text-center"
            >
              <div className={`text-2xl font-bold tabular-nums ${item.color}`}>
                {item.value.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">{item.label}</div>
              <div className="text-[10px] text-slate-600">{item.sub}</div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">{item.cost}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-slate-600 leading-relaxed">
          Staff counts include 24/7 shift coverage (3 shifts). 
          Equipment costs are annualized (purchase price ÷ useful life + maintenance).
        </div>
      </Card>

      {/* ── Budget & Space Usage ── */}
      <Card delay={0.2}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Resource Usage
        </div>
        <div className="space-y-4">
          {/* Budget bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Annual Budget</span>
              <span>
                €{result.intBudgetUsed.toLocaleString()} of €{input.B.toLocaleString()}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#1a1f33] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(result.intBudgetPercent, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${result.intBudgetPercent > 100 ? "from-red-500 to-orange-500" : "from-blue-500 to-purple-500"}`}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-600">
              <span>{result.intBudgetPercent}% used</span>
              {result.intBudgetPercent > 100 ? (
                <span className="text-red-400">
                  ⚠ Rounding staff up exceeds budget by €{(result.intBudgetUsed - input.B).toLocaleString()}
                </span>
              ) : (
                <span>€{(input.B - result.intBudgetUsed).toLocaleString()} remaining</span>
              )}
            </div>
          </div>
          {/* Space bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Ward Floor Space</span>
              <span>
                {result.intSpaceUsed.toLocaleString()} m² of {input.AT.toLocaleString()} m²
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#1a1f33] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(result.intSpacePercent, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${result.intSpacePercent > 100 ? "from-red-500 to-orange-500" : "from-green-500 to-cyan-500"}`}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-600">
              <span>{result.intSpacePercent}% used</span>
              {result.intSpacePercent > 100 ? (
                <span className="text-red-400">
                  ⚠ Exceeds available space by {(result.intSpaceUsed - input.AT).toLocaleString()} m²
                </span>
              ) : (
                <span>{(input.AT - result.intSpaceUsed).toLocaleString()} m² remaining</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Bottleneck ── */}
      <Card delay={0.28}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div>
            <div className="text-xs text-slate-500">What&apos;s Limiting Capacity?</div>
            <div className="text-base font-semibold text-slate-200">{result.bottleneck}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              This is the constraint preventing you from treating more patients.
            </div>
          </div>
        </div>
      </Card>

      {/* ── Constraints table ── */}
      <Card delay={0.33}>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Constraint Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-500">
                <th className="pb-2 text-left font-medium">Constraint</th>
                <th className="pb-2 text-right font-medium">Max Patients Allowed</th>
                <th className="pb-2 text-right font-medium">Unused Capacity</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.constraints.map((c, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2 text-slate-300">{c.name}</td>
                  <td className="py-2 text-right text-slate-400 tabular-nums">
                    {c.capacity === Infinity ? "∞" : c.capacity.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-slate-400 tabular-nums">
                    {c.slack === Infinity ? "∞" : c.slack.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.binding
                          ? "bg-red-500/20 text-red-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {c.binding ? "Limiting" : "OK"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-[10px] text-slate-600 leading-relaxed">
          &quot;Max Patients Allowed&quot; shows how many concurrent patients each constraint could support on its own.
          The actual capacity is the lowest value. &quot;Limiting&quot; = this constraint is the bottleneck.
        </div>
      </Card>

      {/* ── Export ── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => downloadExcel(input, result)}
        className="w-full rounded-[10px] border border-white/[0.06] bg-white/[0.03] py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
      >
        Download Excel Report
      </motion.button>
    </motion.div>
  );
}
