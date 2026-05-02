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

const statCards = (r: SolverResult) => [
  { label: "Max Patients", lp: r.P, int: r.intP, color: "text-blue-400" },
  { label: "Doctors", lp: r.d, int: r.intD, color: "text-purple-400" },
  { label: "Nurses", lp: r.n, int: r.intN, color: "text-emerald-400" },
  { label: "Monitors", lp: r.e, int: r.intE, color: "text-amber-400" },
  { label: "Beds", lp: r.b, int: r.intB, color: "text-rose-400" },
];

export default function ResultsDisplay({ result, input }: ResultsDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-lg font-semibold text-slate-200 tracking-tight">
        Optimization Results
      </h2>

      {!result.optimal && (
        <div className="rounded-[10px] border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          No optimal solution found. Try adjusting your parameters.
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards(result).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-4 text-center hover:border-white/[0.12]"
          >
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>
              {s.int.toLocaleString()}
            </div>
            {s.lp !== s.int && (
              <div className="text-[10px] text-slate-600 mt-0.5">
                LP: {s.lp.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            )}
            <div className="text-[11px] text-slate-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Usage bars — show integer (practical) values */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card delay={0.2}>
          <div className="text-xs text-[#9ba4b8] mb-2">Budget Usage (Integer)</div>
          <div className="h-3 rounded-full bg-[#1a1f33] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(result.intBudgetPercent, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${result.intBudgetPercent > 100 ? "from-red-500 to-orange-500" : "from-blue-500 to-purple-500"}`}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-slate-500">
            <span>${result.intBudgetUsed.toLocaleString()}</span>
            <span>{result.intBudgetPercent}%</span>
          </div>
          {result.intBudgetPercent > 100 && (
            <div className="mt-1 text-[10px] text-red-400">Rounding up exceeds budget by ${(result.intBudgetUsed - result.budgetUsed).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          )}
          <div className="mt-1 text-[10px] text-slate-600">LP: ${result.budgetUsed.toLocaleString()} ({result.budgetPercent}%)</div>
        </Card>

        <Card delay={0.25}>
          <div className="text-xs text-[#9ba4b8] mb-2">Space Usage (Integer)</div>
          <div className="h-3 rounded-full bg-[#1a1f33] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(result.intSpacePercent, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${result.intSpacePercent > 100 ? "from-red-500 to-orange-500" : "from-green-500 to-cyan-500"}`}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-slate-500">
            <span>{result.intSpaceUsed.toLocaleString()} m²</span>
            <span>{result.intSpacePercent}%</span>
          </div>
          {result.intSpacePercent > 100 && (
            <div className="mt-1 text-[10px] text-red-400">Rounding up exceeds space by {(result.intSpaceUsed - result.spaceUsed).toLocaleString(undefined, { maximumFractionDigits: 0 })} m²</div>
          )}
          <div className="mt-1 text-[10px] text-slate-600">LP: {result.spaceUsed.toLocaleString()} m² ({result.spacePercent}%)</div>
        </Card>
      </div>

      {/* Bottleneck */}
      <Card delay={0.3}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div>
            <div className="text-xs text-slate-500">Binding Constraint (Bottleneck)</div>
            <div className="text-base font-semibold text-slate-200">{result.bottleneck}</div>
          </div>
        </div>
      </Card>

      {/* Constraints table */}
      <Card delay={0.35}>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Constraint Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-500">
                <th className="pb-2 text-left font-medium">Constraint</th>
                <th className="pb-2 text-right font-medium">Capacity</th>
                <th className="pb-2 text-right font-medium">Slack</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.constraints.map((c, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2 text-slate-300">{c.name}</td>
                  <td className="py-2 text-right text-slate-400">{c.capacity.toLocaleString()}</td>
                  <td className="py-2 text-right text-slate-400">{c.slack.toLocaleString()}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.binding
                          ? "bg-red-500/20 text-red-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {c.binding ? "Binding" : "Slack"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export button */}
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
