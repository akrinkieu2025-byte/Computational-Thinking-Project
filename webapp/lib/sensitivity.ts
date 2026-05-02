import { solve, SolverInput, SolverResult } from "./solver";

/* ── Types ─────────────────────────────────────────────── */

export interface ParameterSweepPoint {
  pctChange: number;   // e.g. -50, -20, -10, 0, 10, 20, 50
  paramValue: number;
  patients: number;
  bottleneck: string;
}

export interface ParameterSweep {
  paramKey: keyof SolverInput;
  paramLabel: string;
  baseline: number;
  points: ParameterSweepPoint[];
}

export interface TornadoBar {
  paramKey: keyof SolverInput;
  paramLabel: string;
  lowPct: number;
  highPct: number;
  lowPatients: number;
  highPatients: number;
  baselinePatients: number;
  range: number; // highPatients - lowPatients
}

export interface ShadowPrice {
  constraint: string;
  binding: boolean;
  epsilon: number;
  marginalValue: number; // ΔP / Δ(RHS)
  interpretation: string;
}

export interface HeatmapCell {
  x: number;
  y: number;
  patients: number;
}

export interface HeatmapData {
  xParam: string;
  yParam: string;
  xLabel: string;
  yLabel: string;
  xValues: number[];
  yValues: number[];
  cells: HeatmapCell[];
  baselinePatients: number;
}

export interface BreakpointEntry {
  paramKey: keyof SolverInput;
  paramLabel: string;
  value: number;
  bottleneckBefore: string;
  bottleneckAfter: string;
}

export interface SensitivityResult {
  baseline: SolverResult;
  sweeps: ParameterSweep[];
  tornado: TornadoBar[];
  shadowPrices: ShadowPrice[];
  heatmap: HeatmapData;
  breakpoints: BreakpointEntry[];
}

/* ── Labels ────────────────────────────────────────────── */

const PARAM_LABELS: Record<keyof SolverInput, string> = {
  B: "Budget (B)",
  Cd: "Cost / Doctor (Cd)",
  Cn: "Cost / Nurse (Cn)",
  Ce: "Cost / Monitor (Ce)",
  Cb: "Cost / Bed (Cb)",
  dp: "Doctors / Patient (dp)",
  ep: "Monitors / Patient (ep)",
  bp: "Beds / Patient (bp)",
  np: "Patients / Nurse on shift (np)",
  Ae: "Space / Monitor (Ae)",
  Ab: "Space / Bed (Ab)",
  AT: "Total Space (AT)",
  avgLOS: "Avg. Length of Stay",
};

const SWEEP_PCTS = [-50, -40, -30, -20, -10, -5, 0, 5, 10, 20, 30, 40, 50];

/* ── Core ──────────────────────────────────────────────── */

async function solveQuiet(input: SolverInput): Promise<SolverResult> {
  return solve(input);
}

export async function runSensitivity(input: SolverInput): Promise<SensitivityResult> {
  const baseline = await solveQuiet(input);
  const paramKeys = Object.keys(PARAM_LABELS) as (keyof SolverInput)[];

  // 1 — Parameter sweeps
  const sweeps: ParameterSweep[] = [];
  for (const key of paramKeys) {
    const base = input[key];
    if (base === 0) continue;
    const points: ParameterSweepPoint[] = [];
    for (const pct of SWEEP_PCTS) {
      const modified = { ...input, [key]: base * (1 + pct / 100) };
      // Ensure no negative values
      if (modified[key] < 0) continue;
      const res = await solveQuiet(modified);
      points.push({
        pctChange: pct,
        paramValue: Math.round(modified[key] * 1000) / 1000,
        patients: res.P,
        bottleneck: res.bottleneck,
      });
    }
    sweeps.push({
      paramKey: key,
      paramLabel: PARAM_LABELS[key],
      baseline: base,
      points,
    });
  }

  // 2 — Tornado chart (±20%)
  const tornado: TornadoBar[] = [];
  for (const key of paramKeys) {
    const base = input[key];
    if (base === 0) continue;
    const lowInput = { ...input, [key]: base * 0.8 };
    const highInput = { ...input, [key]: base * 1.2 };
    const lowRes = await solveQuiet(lowInput);
    const highRes = await solveQuiet(highInput);
    tornado.push({
      paramKey: key,
      paramLabel: PARAM_LABELS[key],
      lowPct: -20,
      highPct: 20,
      lowPatients: lowRes.P,
      highPatients: highRes.P,
      baselinePatients: baseline.P,
      range: Math.abs(highRes.P - lowRes.P),
    });
  }
  tornado.sort((a, b) => b.range - a.range);

  // 3 — Shadow prices (approximate duals)
  const EPS_FRAC = 0.01; // 1% bump
  const shadowPrices: ShadowPrice[] = [];

  // Budget shadow price
  {
    const eps = input.B * EPS_FRAC;
    const bumped = { ...input, B: input.B + eps };
    const res = await solveQuiet(bumped);
    const mv = (res.P - baseline.P) / eps;
    shadowPrices.push({
      constraint: "Budget",
      binding: baseline.constraints.find(c => c.name === "Budget")?.binding ?? false,
      epsilon: eps,
      marginalValue: Math.round(mv * 10000) / 10000,
      interpretation: mv > 0.0001
        ? `+$1 budget → +${(mv).toFixed(4)} patients`
        : "Not a binding constraint",
    });
  }

  // Space shadow price
  {
    const eps = input.AT * EPS_FRAC;
    const bumped = { ...input, AT: input.AT + eps };
    const res = await solveQuiet(bumped);
    const mv = (res.P - baseline.P) / eps;
    shadowPrices.push({
      constraint: "Space",
      binding: baseline.constraints.find(c => c.name === "Space")?.binding ?? false,
      epsilon: eps,
      marginalValue: Math.round(mv * 10000) / 10000,
      interpretation: mv > 0.0001
        ? `+1 m² space → +${(mv).toFixed(4)} patients`
        : "Not a binding constraint",
    });
  }

  // Doctor capacity shadow price (via dp reduction)
  {
    const eps = input.dp * EPS_FRAC;
    const bumped = { ...input, dp: input.dp - eps }; // less dp = more capacity
    const res = await solveQuiet(bumped);
    const mv = (res.P - baseline.P) / eps;
    shadowPrices.push({
      constraint: "Doctor Capacity",
      binding: baseline.constraints.find(c => c.name === "Doctor Capacity")?.binding ?? false,
      epsilon: eps,
      marginalValue: Math.round(mv * 10000) / 10000,
      interpretation: mv > 0.0001
        ? `−0.01 dp → +${(mv * 0.01).toFixed(4)} patients`
        : "Not a binding constraint",
    });
  }

  // Nurse staffing shadow price (increasing np = fewer nurses needed = more patients)
  {
    const eps = input.np * EPS_FRAC;
    const bumped = { ...input, np: input.np + eps };
    const res = await solveQuiet(bumped);
    const mv = (res.P - baseline.P) / eps;
    shadowPrices.push({
      constraint: "Nurse Staffing (3-shift coverage)",
      binding: baseline.constraints.find(c => c.name === "Nurse Staffing (3-shift coverage)")?.binding ?? false,
      epsilon: eps,
      marginalValue: Math.round(mv * 10000) / 10000,
      interpretation: mv > 0.0001
        ? `+0.1 np → +${(mv * 0.1).toFixed(4)} patients`
        : "Not a binding constraint",
    });
  }

  // 4 — Heatmap (Budget × Space)
  const HEAT_STEPS = 12;
  const xValues: number[] = [];
  const yValues: number[] = [];
  for (let i = 0; i <= HEAT_STEPS; i++) {
    xValues.push(Math.round(input.B * (0.5 + i / HEAT_STEPS)));
    yValues.push(Math.round(input.AT * (0.5 + i / HEAT_STEPS)));
  }
  const cells: HeatmapCell[] = [];
  for (const x of xValues) {
    for (const y of yValues) {
      const res = await solveQuiet({ ...input, B: x, AT: y });
      cells.push({ x, y, patients: res.P });
    }
  }

  const heatmap: HeatmapData = {
    xParam: "B",
    yParam: "AT",
    xLabel: "Budget ($)",
    yLabel: "Space (m²)",
    xValues,
    yValues,
    cells,
    baselinePatients: baseline.P,
  };

  // 5 — Breakpoints (find where bottleneck shifts)
  const breakpoints: BreakpointEntry[] = [];
  for (const key of paramKeys) {
    const base = input[key];
    if (base === 0) continue;
    let prevBottleneck = baseline.bottleneck;
    // Sweep upward in fine steps
    for (let pct = 2; pct <= 100; pct += 2) {
      const mod = { ...input, [key]: base * (1 + pct / 100) };
      const res = await solveQuiet(mod);
      if (res.bottleneck !== prevBottleneck && res.bottleneck !== "None identified") {
        breakpoints.push({
          paramKey: key,
          paramLabel: PARAM_LABELS[key],
          value: Math.round(mod[key] * 100) / 100,
          bottleneckBefore: prevBottleneck,
          bottleneckAfter: res.bottleneck,
        });
        prevBottleneck = res.bottleneck;
      }
    }
    // Sweep downward
    prevBottleneck = baseline.bottleneck;
    for (let pct = -2; pct >= -48; pct -= 2) {
      const mod = { ...input, [key]: base * (1 + pct / 100) };
      if (mod[key] < 0) continue;
      const res = await solveQuiet(mod);
      if (res.bottleneck !== prevBottleneck && res.bottleneck !== "None identified") {
        breakpoints.push({
          paramKey: key,
          paramLabel: PARAM_LABELS[key],
          value: Math.round(mod[key] * 100) / 100,
          bottleneckBefore: prevBottleneck,
          bottleneckAfter: res.bottleneck,
        });
        prevBottleneck = res.bottleneck;
      }
    }
  }

  return { baseline, sweeps, tornado, shadowPrices, heatmap, breakpoints };
}
