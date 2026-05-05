"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SolverInput } from "@/lib/solver";
import { DollarSign, Users, Monitor, Ruler, ShieldCheck } from "lucide-react";

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

const sections: { title: string; icon: typeof DollarSign; description: string; fields: FieldDef[] }[] = [
  {
    title: "Budget & Costs",
    icon: DollarSign,
    description: "All monetary values are annual (€/year). Staff costs should be fully loaded (salary + benefits + overhead). Equipment and bed costs should be annualized (purchase price ÷ useful life + annual maintenance).",
    fields: [
      { key: "B", label: "Total Annual Budget", hint: "€/year", tooltip: "The total annual operating budget available for this ward or unit. This covers all staff salaries, equipment lease/depreciation, and bed costs for one full year of continuous operation." },
      { key: "Cd", label: "Cost per Doctor", hint: "€/year per FTE", tooltip: "Fully loaded annual cost for one full-time equivalent (FTE) doctor. Include: base salary, benefits, insurance, training, and administrative overhead." },
      { key: "Cn", label: "Cost per Nurse", hint: "€/year per FTE", tooltip: "Fully loaded annual cost for one full-time equivalent (FTE) nurse. Include: base salary, benefits, insurance, training, and administrative overhead." },
      { key: "Ce", label: "Cost per Monitor", hint: "€/year per station", tooltip: "Annualized cost of one monitoring station. Calculate as: (Purchase price ÷ Expected useful life in years) + Annual maintenance cost." },
      { key: "Cb", label: "Cost per Bed", hint: "€/year per bed", tooltip: "Annualized cost of one hospital bed. Calculate as: (Purchase price ÷ Expected useful life in years) + Annual maintenance/linen cost." },
    ],
  },
  {
    title: "Staffing Ratios",
    icon: Users,
    description: "Define how many patients each resource can handle simultaneously. The model automatically accounts for 24/7 coverage (3 shifts × 8 hours) when calculating total staff needed.",
    fields: [
      { key: "pd", label: "Patients per Doctor", hint: "per shift", tooltip: "How many patients one on-duty doctor can safely manage at the same time during a single shift. The model multiplies by 3 to cover 24/7 shifts." },
      { key: "np", label: "Patients per Nurse", hint: "per shift", tooltip: "How many patients one on-duty nurse can safely manage at the same time during a single shift. The model multiplies by 3 to cover 24/7 shifts." },
      { key: "ep", label: "Monitors per Patient", hint: "ratio (e.g. 0.5)", tooltip: "Number of monitoring stations needed per concurrent patient. Use 1.0 for ICU, 0.5 for general ward." },
      { key: "bp", label: "Beds per Patient Slot", hint: "≥ 1.0 (turnover buffer)", tooltip: "Physical beds needed per patient-slot. Values above 1 provide a buffer for admission/discharge overlap." },
    ],
  },
  {
    title: "Space & Operations",
    icon: Ruler,
    description: "Enter the usable clinical floor space (m²) available exclusively for beds and equipment. Do not include corridors, nursing stations, or storage — only space where beds and monitors will physically be placed.",
    fields: [
      { key: "Ae", label: "Space per Monitor", hint: "m²", tooltip: "Floor area required per monitoring station including access clearance." },
      { key: "Ab", label: "Space per Bed", hint: "m²", tooltip: "Floor area required per hospital bed including bedside space." },
      { key: "AT", label: "Total Available Space", hint: "m²", tooltip: "Total usable floor space available for placing beds and monitoring equipment." },
      { key: "avgLOS", label: "Avg Length of Stay", hint: "days", tooltip: "Average number of days a patient occupies a bed. Used to convert concurrent capacity into annual throughput." },
    ],
  },
  {
    title: "Minimum Staffing",
    icon: ShieldCheck,
    description: "Regulatory or safety minimums — the ward must employ at least this many staff regardless of patient volume (e.g. for emergency readiness).",
    fields: [
      { key: "dMin", label: "Min Doctors", hint: "FTEs", tooltip: "Minimum number of doctor FTEs required by regulation or hospital policy." },
      { key: "nMin", label: "Min Nurses", hint: "FTEs", tooltip: "Minimum number of nurse FTEs required by regulation or hospital policy." },
    ],
  },
];

function formatDisplay(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) >= 1000) {
    return n.toLocaleString("en-US");
  }
  return String(n);
}

function parseRaw(raw: string): number {
  const stripped = raw.replace(/,/g, "").trim();
  if (stripped === "" || stripped === "-") return 0;
  const n = Number(stripped);
  return isNaN(n) ? 0 : n;
}

function sanitize(raw: string): string {
  return raw.replace(/[^0-9.,-]/g, "");
}

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="ml-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/[0.06] hover:bg-blue-500/20 hover:text-blue-300 text-slate-600 text-[8px] font-bold leading-none transition-colors focus:outline-none"
        aria-label="More info"
      >
        ?
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -3, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -3, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-md bg-[#1a1f2e] border border-white/[0.08] shadow-xl shadow-black/40 p-2.5 text-[10px] text-slate-300 leading-relaxed"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-[#1a1f2e] border-r border-b border-white/[0.08]" />
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InputForm({ values, onChange, onSolve, loading }: InputFormProps) {
  const [editing, setEditing] = useState<keyof SolverInput | null>(null);
  const [rawText, setRawText] = useState("");

  const handleFocus = useCallback((key: keyof SolverInput) => {
    setEditing(key);
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
    <div className="space-y-3">
      {/* Model context explainer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-blue-500/15 bg-blue-500/[0.04] p-3.5"
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded bg-blue-500/15 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
          <div className="text-[10px] text-blue-200/70 leading-relaxed">
            <p className="font-semibold text-blue-200/90 mb-1">How this model works</p>
            <p className="mb-1">
              This optimizer finds the <strong>maximum number of patients that can be served simultaneously and continuously</strong> throughout an entire year (365 days, 24/7), given your budget, space, and staffing constraints.
            </p>
            <p className="mb-1">
              <strong>Time frame:</strong> All inputs represent <em>one full year</em> of continuous operation. The budget must cover 12 months of salaries and equipment costs. Staffing accounts for 3 daily shifts (24h coverage) automatically.
            </p>
            <p>
              <strong>Output:</strong> The result is a <em>steady-state concurrent capacity</em> — how many patients can occupy beds at any given moment, every day of the year. Annual throughput is then derived using the average length of stay.
            </p>
          </div>
        </div>
      </motion.div>

      {sections.map((section, si) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05, duration: 0.3 }}
            className="card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className="text-slate-500" strokeWidth={1.5} />
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            <p className="mb-3 text-[10px] text-slate-600 leading-relaxed">
              {section.description}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {section.fields.map((f) => {
                const isEditing = editing === f.key;
                const displayValue = isEditing
                  ? rawText
                  : formatDisplay(values[f.key]);

                return (
                  <div key={f.key} className={section.fields.length === 1 ? "col-span-2" : ""}>
                    <label className="flex items-center mb-1 text-[10px] font-medium text-slate-500">
                      {f.label}
                      <InfoTooltip text={f.tooltip} />
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
                    <span className="block mt-0.5 text-[9px] text-slate-600">
                      {f.hint}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      <motion.button
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSolve}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Solving...
          </span>
        ) : (
          "Run Optimization"
        )}
      </motion.button>
    </div>
  );
}
