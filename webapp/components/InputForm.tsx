"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SolverInput } from "@/lib/solver";

interface InputFormProps {
  values: SolverInput;
  onChange: (values: SolverInput) => void;
  onSolve: () => void;
  loading: boolean;
}

interface FieldDef {
  key: keyof SolverInput;
  label: string;
  hint: string;
  tooltip: string;
}

const sections: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Budget & Costs",
    fields: [
      { key: "B", label: "Total Budget (B)", hint: "total available to spend", tooltip: "Total budget available for hiring staff and purchasing equipment" },
      { key: "Cd", label: "Cost per Doctor (Cd)", hint: "cost to employ one doctor", tooltip: "All-in cost for one doctor" },
      { key: "Cn", label: "Cost per Nurse (Cn)", hint: "cost to employ one nurse", tooltip: "All-in cost for one nurse" },
      { key: "Ce", label: "Cost per Monitor (Ce)", hint: "cost for one station", tooltip: "Cost of one monitoring station" },
      { key: "Cb", label: "Cost per Bed (Cb)", hint: "cost for one bed", tooltip: "Cost of one hospital bed" },
    ],
  },
  {
    title: "Capacity Ratios",
    fields: [
      { key: "dp", label: "Doctors per Patient (dp)", hint: "e.g. 0.15 = 1 per ~7 patients", tooltip: "Physician FTEs needed per patient" },
      { key: "ep", label: "Monitors per Patient (ep)", hint: "e.g. 0.25 = 1 per 4 patients", tooltip: "Monitoring stations per patient" },
      { key: "bp", label: "Beds per Patient (bp)", hint: "> 1.0 includes turnover buffer", tooltip: "Beds per patient including turnover buffer" },
    ],
  },
  {
    title: "Space & Quality",
    fields: [
      { key: "Ae", label: "Space per Monitor (Ae)", hint: "m\u00B2 per station", tooltip: "Floor space per monitoring station" },
      { key: "Ab", label: "Space per Bed (Ab)", hint: "m\u00B2 incl. corridor access", tooltip: "Floor space per bed" },
      { key: "AT", label: "Total Space (AT)", hint: "m\u00B2 clinical floor", tooltip: "Total available clinical floor space" },
      { key: "K", label: "Min. Nurse Ratio (K)", hint: "nurses per patient floor", tooltip: "Minimum nurses per patient for safe care" },
    ],
  },
];

/** Format a number for display: 2,500,000 for integers, keep decimals as-is */
function formatDisplay(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) >= 1000) {
    return n.toLocaleString("en-US");
  }
  return String(n);
}

/** Strip formatting characters and parse */
function parseRaw(raw: string): number {
  const stripped = raw.replace(/,/g, "").trim();
  if (stripped === "" || stripped === "-") return 0;
  const n = Number(stripped);
  return isNaN(n) ? 0 : n;
}

/** Only allow digits, decimal point, minus, and commas */
function sanitize(raw: string): string {
  return raw.replace(/[^0-9.,-]/g, "");
}

export default function InputForm({ values, onChange, onSolve, loading }: InputFormProps) {
  // Track which field is being edited (so we show raw text, not formatted)
  const [editing, setEditing] = useState<keyof SolverInput | null>(null);
  const [rawText, setRawText] = useState("");

  const handleFocus = useCallback((key: keyof SolverInput) => {
    setEditing(key);
    // Show the raw number (no commas) so the user can edit naturally
    setRawText(values[key] === 0 ? "0" : String(values[key]));
  }, [values]);

  const handleBlur = useCallback((key: keyof SolverInput) => {
    const parsed = parseRaw(rawText);
    onChange({ ...values, [key]: parsed });
    setEditing(null);
    setRawText("");
  }, [rawText, values, onChange]);

  const handleChange = useCallback((key: keyof SolverInput, val: string) => {
    const clean = sanitize(val);
    setRawText(clean);
    // Update live so solver always has the latest value
    const parsed = parseRaw(clean);
    onChange({ ...values, [key]: parsed });
  }, [values, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
      onSolve();
    }
  }, [onSolve]);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-200 tracking-tight">
        Input Parameters
      </h2>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08 }}
          className="card p-5"
        >
          <h3 className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {section.fields.map((f) => {
              const isEditing = editing === f.key;
              const displayValue = isEditing
                ? rawText
                : formatDisplay(values[f.key]);

              return (
                <div key={f.key}>
                  <label className="block mb-1 text-xs font-medium text-slate-400">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={displayValue}
                    onFocus={() => handleFocus(f.key)}
                    onBlur={() => handleBlur(f.key)}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                  <span className="block mt-1 text-[10px] text-[#5e6780]">
                    {f.hint}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSolve}
        disabled={loading}
        className="w-full rounded-xl bg-[#4f7df5] py-3 text-sm font-semibold text-white transition-all hover:bg-[#6090ff] hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Solving...
          </span>
        ) : (
          "Solve Optimization"
        )}
      </motion.button>
    </div>
  );
}
