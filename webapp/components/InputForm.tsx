"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const sections: { title: string; description: string; fields: FieldDef[] }[] = [
  {
    title: "Annual Budget & Costs",
    description: "All monetary values are annual (€/year). Staff costs should be fully loaded (salary + benefits + overhead). Equipment and bed costs should be annualized (purchase price ÷ useful life in years + annual maintenance).",
    fields: [
      { key: "B", label: "Total Annual Budget", hint: "€/year", tooltip: "The total annual operating budget available for this ward or unit. This covers all staff salaries, equipment lease/depreciation, and bed costs for one full year of continuous operation." },
      { key: "Cd", label: "Cost per Doctor (annual)", hint: "€/year per FTE", tooltip: "Fully loaded annual cost for one full-time equivalent (FTE) doctor. Include: base salary, benefits, insurance, training, and administrative overhead. Example: €200,000/year is typical for a senior physician in Western Europe." },
      { key: "Cn", label: "Cost per Nurse (annual)", hint: "€/year per FTE", tooltip: "Fully loaded annual cost for one full-time equivalent (FTE) nurse. Include: base salary, benefits, insurance, training, and administrative overhead. Example: €60,000/year is typical for a registered nurse in Western Europe." },
      { key: "Ce", label: "Cost per Monitor (annual)", hint: "€/year per station", tooltip: "Annualized cost of one monitoring station. Calculate as: (Purchase price ÷ Expected useful life in years) + Annual maintenance cost. Example: A €15,000 monitor lasting 5 years with €500/year maintenance = €3,500/year." },
      { key: "Cb", label: "Cost per Bed (annual)", hint: "€/year per bed", tooltip: "Annualized cost of one hospital bed. Calculate as: (Purchase price ÷ Expected useful life in years) + Annual maintenance/linen cost. Example: A €8,000 bed lasting 4 years with €200/year maintenance = €2,200/year." },
    ],
  },
  {
    title: "Staffing & Equipment Ratios",
    description: "Define how many patients each resource can handle simultaneously. The model automatically accounts for 24/7 coverage (3 shifts × 8 hours) when calculating total staff needed.",
    fields: [
      { key: "pd", label: "Patients per Doctor (on shift)", hint: "patients handled simultaneously by 1 doctor", tooltip: "How many patients one on-duty doctor can safely manage at the same time during a single shift. The model multiplies by 3 to cover 24/7 shifts (so if you enter 3, you need 1 doctor FTE per patient-slot to provide round-the-clock coverage). Lower values = higher quality care but more doctors needed." },
      { key: "np", label: "Patients per Nurse (on shift)", hint: "patients handled simultaneously by 1 nurse", tooltip: "How many patients one on-duty nurse can safely manage at the same time during a single shift. The model multiplies by 3 to cover 24/7 shifts. ICU typically uses 1–2, general ward 4–6, step-down 3–4." },
      { key: "ep", label: "Monitors per Patient", hint: "e.g. 0.5 = 1 monitor shared between 2 patients", tooltip: "Number of monitoring stations needed per concurrent patient. Use 1.0 if every patient needs their own dedicated monitor (e.g. ICU). Use 0.5 if monitors can be shared between 2 patients (e.g. general ward where not everyone is continuously monitored)." },
      { key: "bp", label: "Beds per Patient Slot", hint: "≥ 1.0 (accounts for turnover buffer)", tooltip: "Physical beds needed per patient-slot. Should be ≥ 1.0. Values above 1 provide a buffer for admission/discharge overlap — e.g. 1.15 means 15% extra beds to handle turnover without blocking new admissions. A value of 1.0 means perfect utilization (unrealistic in practice)." },
    ],
  },
  {
    title: "Physical Space",
    description: "Enter the usable clinical floor space (in m²) that is available exclusively for beds and equipment stations. Do not include corridors, nursing stations, storage rooms, or common areas — only the space where beds and monitors will physically be placed.",
    fields: [
      { key: "Ae", label: "Space per Monitor Station", hint: "m² per station (including access clearance)", tooltip: "Floor area required per monitoring station in square meters. Include the equipment footprint plus required clearance for staff access and maintenance. Typical range: 3–6 m² depending on equipment type." },
      { key: "Ab", label: "Space per Bed", hint: "m² per bed (patient bay area)", tooltip: "Floor area required per hospital bed in square meters. Include the bed footprint, bedside space for staff, visitor chair, and bedside equipment. Typical single room: 12–15 m², shared bay: 8–10 m² per bed." },
      { key: "AT", label: "Total Available Space", hint: "m² of usable clinical floor", tooltip: "Total usable floor space (in m²) available for placing beds and monitoring equipment. This should only be the deployable area — exclude hallways, nursing stations, break rooms, storage, and utility rooms. These typically consume 40–60% of gross floor area." },
      { key: "avgLOS", label: "Average Length of Stay", hint: "days per patient admission", tooltip: "Average number of days a patient occupies a bed before discharge. Used to convert concurrent capacity into annual patient throughput: Annual Patients ≈ Concurrent Capacity × 365 ÷ Avg LOS. Example: 20 concurrent patients with 5-day LOS ≈ 1,460 patients/year." },
    ],
  },
  {
    title: "Minimum Staffing Requirements",
    description: "Regulatory or safety minimums — the ward must employ at least this many staff regardless of patient volume (e.g. for emergency readiness).",
    fields: [
      { key: "dMin", label: "Minimum Doctors", hint: "FTEs (regulatory floor)", tooltip: "The minimum number of doctor FTEs required by regulation or hospital policy, regardless of how many patients are present. This ensures the ward always has baseline medical coverage even during low-census periods." },
      { key: "nMin", label: "Minimum Nurses", hint: "FTEs (regulatory floor)", tooltip: "The minimum number of nurse FTEs required by regulation or hospital policy, regardless of how many patients are present. This ensures the ward always has baseline nursing coverage." },
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

/** Info tooltip button component */
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
        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700/60 hover:bg-blue-500/30 hover:text-blue-300 text-slate-500 text-[9px] font-bold leading-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        aria-label="More info"
      >
        i
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-slate-800 border border-slate-600/50 shadow-xl shadow-black/30 p-3 text-xs text-slate-300 leading-relaxed"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800 border-r border-b border-slate-600/50" />
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InputForm({ values, onChange, onSolve, loading }: InputFormProps) {
  // Track which field is being edited (so we show raw text, not formatted)
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
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-200 tracking-tight">
        Input Parameters
      </h2>

      {/* Model context explainer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
          <div className="text-xs text-blue-200/80 leading-relaxed">
            <p className="font-semibold text-blue-200 mb-1">How this model works</p>
            <p className="mb-1.5">
              This optimizer finds the <strong>maximum number of patients that can be served simultaneously and continuously</strong> throughout an entire year (365 days, 24/7), given your budget, space, and staffing constraints.
            </p>
            <p className="mb-1.5">
              <strong>Time frame:</strong> All inputs represent <em>one full year</em> of continuous operation. The budget must cover 12 months of salaries and equipment costs. Staffing accounts for 3 daily shifts (24h coverage) automatically.
            </p>
            <p>
              <strong>Output:</strong> The result is a <em>steady-state concurrent capacity</em> — how many patients can occupy beds at any given moment, every day of the year. Annual throughput is then derived using the average length of stay.
            </p>
          </div>
        </div>
      </motion.div>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08 }}
          className="card p-5"
        >
          <h3 className="mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {section.title}
          </h3>
          <p className="mb-4 text-[11px] text-slate-500 leading-relaxed">
            {section.description}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {section.fields.map((f) => {
              const isEditing = editing === f.key;
              const displayValue = isEditing
                ? rawText
                : formatDisplay(values[f.key]);

              return (
                <div key={f.key}>
                  <label className="flex items-center mb-1 text-xs font-medium text-slate-400">
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
