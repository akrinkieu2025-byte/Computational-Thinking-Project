"use client";

import { motion } from "framer-motion";
import { SolverResult } from "@/lib/solver";
import { SolverInput } from "@/lib/solver";
import { downloadExcel } from "@/lib/excelExport";
import { Users, Bed, Monitor, Stethoscope, AlertTriangle, Download, TrendingUp } from "lucide-react";

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
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      {!result.optimal && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle size={12} /> No optimal solution found
          </div>
          {result.infeasibleReason && (
            <div className="text-[11px] text-red-400/80 leading-relaxed">{result.infeasibleReason}</div>
          )}
        </div>
      )}

      {/* ── KPI Hero Row ── */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="card p-5 col-span-1"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={12} className="text-blue-400" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Concurrent Capacity</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums tracking-tight">
            {result.intP.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-600 mt-1">patients at any given moment</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-5 col-span-1"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-emerald-400" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Annual Throughput</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums tracking-tight">
            ~{result.annualThroughput.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-600 mt-1">{result.intP} × 365 ÷ {avgLOS}-day LOS</div>
        </motion.div>
      </div>

      {/* ── Resource Allocation ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-4"
      >
        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">
          Optimal Resource Allocation
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: result.intD, label: "Doctors", icon: Stethoscope, cost: result.intD * input.Cd, color: "text-violet-400" },
            { value: result.intN, label: "Nurses", icon: Users, cost: result.intN * input.Cn, color: "text-emerald-400" },
            { value: result.intE, label: "Monitors", icon: Monitor, cost: result.intE * input.Ce, color: "text-amber-400" },
            { value: result.intB, label: "Beds", icon: Bed, cost: result.intB * input.Cb, color: "text-rose-400" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.04 }}
                className="rounded-lg bg-[#161b26] border border-white/[0.04] p-3 text-center"
              >
                <Icon size={14} className={`mx-auto mb-1.5 ${item.color} opacity-70`} />
                <div className={`text-xl font-bold tabular-nums ${item.color}`}>
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{item.label}</div>
                <div className="text-[9px] text-slate-600 mt-0.5">€{item.cost.toLocaleString()}/yr</div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 text-[9px] text-slate-600 leading-relaxed">
          Staff = total FTEs for 24/7 coverage (3×8h shifts). Equipment costs are annualized (purchase ÷ life + maintenance). All values are exact integers from the MIP solver.
        </div>
      </motion.div>

      {/* ── Budget & Space ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card p-4"
      >
        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">
          Resource Utilization
        </div>
        <div className="space-y-3">
          {/* Budget */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Budget</span>
              <span className="text-slate-500 tabular-nums">
                €{result.intBudgetUsed.toLocaleString()} / €{input.B.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#161b26] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(result.intBudgetPercent, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${result.intBudgetPercent > 100 ? "bg-red-500" : "bg-blue-500"}`}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[9px] text-slate-600">
              <span>{result.intBudgetPercent}%</span>
              {result.intBudgetPercent > 100 ? (
                <span className="text-red-400">Over by €{(result.intBudgetUsed - input.B).toLocaleString()}</span>
              ) : (
                <span>€{(input.B - result.intBudgetUsed).toLocaleString()} slack</span>
              )}
            </div>
          </div>
          {/* Space */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Floor Space</span>
              <span className="text-slate-500 tabular-nums">
                {result.intSpaceUsed.toLocaleString()} m² / {input.AT.toLocaleString()} m²
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#161b26] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(result.intSpacePercent, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${result.intSpacePercent > 100 ? "bg-red-500" : "bg-emerald-500"}`}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[9px] text-slate-600">
              <span>{result.intSpacePercent}%</span>
              {result.intSpacePercent > 100 ? (
                <span className="text-red-400">Over by {(result.intSpaceUsed - input.AT).toLocaleString()} m²</span>
              ) : (
                <span>{(input.AT - result.intSpaceUsed).toLocaleString()} m² slack</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Bottleneck ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-4 border-amber-500/10"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/15">
            <AlertTriangle size={13} className="text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Binding Constraint</div>
            <div className="text-sm font-semibold text-white mt-0.5">{result.bottleneck}</div>
            <div className="text-[9px] text-slate-600 mt-0.5">This is the constraint preventing you from treating more patients.</div>
          </div>
        </div>
      </motion.div>

      {/* ── Constraint Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card p-4"
      >
        <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">
          Constraint Utilization
        </div>
        <div className="space-y-2.5">
          {result.constraints.map((c, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-300 font-medium">{c.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-600 tabular-nums">
                    {c.usageLabel} / {c.limitLabel}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                      c.binding
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-white/[0.03] text-slate-500 border border-white/[0.06]"
                    }`}
                  >
                    {c.binding ? "BINDING" : `${c.percent}%`}
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-[#161b26] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(c.percent, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                  className={`h-full rounded-full ${
                    c.binding
                      ? "bg-red-500"
                      : c.percent > 80
                      ? "bg-amber-500"
                      : "bg-slate-600"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[9px] text-slate-600 leading-relaxed">
          Each bar shows how much of each resource is consumed at the optimal solution.
          &quot;Binding&quot; = this constraint is at capacity and limiting further growth.
        </div>
      </motion.div>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => downloadExcel(input, result)}
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-300 flex items-center justify-center gap-2"
      >
        <Download size={13} />
        Export to Excel
      </motion.button>
    </motion.div>
  );
}
