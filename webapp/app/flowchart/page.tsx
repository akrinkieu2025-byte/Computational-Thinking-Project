"use client";

import Image from "next/image";

const BLUE = "#2563eb";
const BLUE_LIGHT = "#dbeafe";
const BLUE_BORDER = "#93c5fd";
const GREEN = "#16a34a";
const GREEN_LIGHT = "#dcfce7";
const GREEN_BORDER = "#86efac";
const RED = "#dc2626";
const RED_LIGHT = "#fee2e2";
const RED_BORDER = "#fca5a5";
const AMBER_LIGHT = "#fef3c7";
const AMBER_BORDER = "#fcd34d";
const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#ede9fe";
const PURPLE_BORDER = "#c4b5fd";
const SLATE = "#334155";
const SLATE_LIGHT = "#f1f5f9";
const SLATE_BORDER = "#cbd5e1";

const BOX_W = 280;
const BOX_H = 64;
const BOX_RX = 12;
const SMALL_W = 220;
const SMALL_H = 52;
const DIAM = 90;
const CX = 400;
const RX = 720;

const Y = {
  start: 40,
  input: 130,
  validate: 240,
  precheck: 350,
  lpCheck: 460,
  solveLP: 570,
  intSearch: 680,
  feasible: 800,
  optimal: 920,
  constraints: 1030,
  sensitivity: 1140,
  end: 1250,
};

function Marker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d={`M0,0 L8,3 L0,6 Z`} fill={color} />
    </marker>
  );
}

function Arr({ x1, y1, x2, y2, c = SLATE }: { x1: number; y1: number; x2: number; y2: number; c?: string }) {
  const id = `m${x1}${y1}${x2}${y2}`;
  return <g><defs><Marker id={id} color={c} /></defs><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={2} markerEnd={`url(#${id})`} /></g>;
}

function Elbow({ x1, y1, x2, y2, c = SLATE, label }: { x1: number; y1: number; x2: number; y2: number; c?: string; label?: string }) {
  const id = `e${x1}${y1}${x2}${y2}`;
  return (
    <g>
      <defs><Marker id={id} color={c} /></defs>
      <polyline points={`${x1},${y1} ${x2},${y1} ${x2},${y2}`} fill="none" stroke={c} strokeWidth={2} markerEnd={`url(#${id})`} />
      {label && <text x={x1 + 10} y={y1 - 7} fill={c} fontSize={11} fontWeight={600} fontFamily="system-ui">{label}</text>}
    </g>
  );
}

function Box({ cx, cy, w = BOX_W, h = BOX_H, fill, stroke, t1, t2, tc = SLATE }: { cx: number; cy: number; w?: number; h?: number; fill: string; stroke: string; t1: string; t2?: string; tc?: string }) {
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={BOX_RX} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={cx} y={t2 ? cy - 8 : cy + 1} textAnchor="middle" dominantBaseline="middle" fill={tc} fontSize={13} fontWeight={600} fontFamily="system-ui">{t1}</text>
      {t2 && <text x={cx} y={cy + 11} textAnchor="middle" dominantBaseline="middle" fill={tc} fontSize={10.5} opacity={0.6} fontFamily="system-ui">{t2}</text>}
    </g>
  );
}

function Pill({ cx, cy, w, h, fill, label }: { cx: number; cy: number; w: number; h: number; fill: string; label: string }) {
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={fill} strokeWidth={1.5} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={13} fontWeight={700} fontFamily="system-ui">{label}</text>
    </g>
  );
}

function Dia({ cx, cy, fill, stroke, t1, t2 }: { cx: number; cy: number; fill: string; stroke: string; t1: string; t2?: string }) {
  const h = DIAM / 2;
  return (
    <g>
      <polygon points={`${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={cx} y={t2 ? cy - 5 : cy + 1} textAnchor="middle" dominantBaseline="middle" fill={SLATE} fontSize={11} fontWeight={600} fontFamily="system-ui">{t1}</text>
      {t2 && <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fill={SLATE} fontSize={9.5} fontFamily="system-ui">{t2}</text>}
    </g>
  );
}

function Num({ cx, cy, n }: { cx: number; cy: number; n: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill={BLUE} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={10} fontWeight={700} fontFamily="system-ui">{n}</text>
    </g>
  );
}

function YesLabel({ cx, cy }: { cx: number; cy: number }) {
  return <text x={cx + 8} y={cy + DIAM / 2 + 15} fill={GREEN} fontSize={11} fontWeight={600} fontFamily="system-ui">Yes</text>;
}

export default function FlowchartPage() {
  const NX = CX - BOX_W / 2 - 26;

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Image src="/ie-logo.jpg" alt="IE University" width={64} height={64} style={{ borderRadius: 8, objectFit: "contain" }} priority />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: SLATE, margin: 0, letterSpacing: "-0.02em" }}>IEcare — Solver Algorithm Flowchart</h1>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Hospital Resource Allocation Optimizer · Computational Thinking Group Project</p>
        </div>
      </div>

      <svg width={900} height={1370} viewBox="0 0 900 1370" style={{ maxWidth: "100%" }}>

        {/* START */}
        <Pill cx={CX} cy={Y.start} w={180} h={40} fill={BLUE} label="START" />
        <Arr x1={CX} y1={Y.start + 20} x2={CX} y2={Y.input - BOX_H / 2} />

        {/* 1 */}
        <Num cx={NX} cy={Y.input} n="1" />
        <Box cx={CX} cy={Y.input} fill={BLUE_LIGHT} stroke={BLUE_BORDER}
          t1="Collect Hospital Parameters"
          t2="Budget, costs, staff ratios, space limits, min. staffing" />
        <Arr x1={CX} y1={Y.input + BOX_H / 2} x2={CX} y2={Y.validate - DIAM / 2} />

        {/* 2 */}
        <Num cx={NX} cy={Y.validate} n="2" />
        <Dia cx={CX} cy={Y.validate} fill={AMBER_LIGHT} stroke={AMBER_BORDER} t1="All inputs" t2="valid?" />
        <Elbow x1={CX + DIAM / 2} y1={Y.validate} x2={RX} y2={Y.validate + 48 - SMALL_H / 2} c={RED} label="No" />
        <Box cx={RX} cy={Y.validate + 48} w={SMALL_W} h={SMALL_H} fill={RED_LIGHT} stroke={RED_BORDER} t1="Return Error Message" tc={RED} />
        <Arr x1={CX} y1={Y.validate + DIAM / 2} x2={CX} y2={Y.precheck - BOX_H / 2} />
        <YesLabel cx={CX} cy={Y.validate} />

        {/* 3 */}
        <Num cx={NX} cy={Y.precheck} n="3" />
        <Box cx={CX} cy={Y.precheck} fill={BLUE_LIGHT} stroke={BLUE_BORDER}
          t1="Check Basic Feasibility"
          t2="Can minimum staff be afforded? Does 1 patient fit?" />
        <Arr x1={CX} y1={Y.precheck + BOX_H / 2} x2={CX} y2={Y.lpCheck - DIAM / 2} />

        {/* 4 */}
        <Num cx={NX} cy={Y.lpCheck} n="4" />
        <Dia cx={CX} cy={Y.lpCheck} fill={AMBER_LIGHT} stroke={AMBER_BORDER} t1="Feasible?" />
        <Elbow x1={CX + DIAM / 2} y1={Y.lpCheck} x2={RX} y2={Y.lpCheck + 48 - SMALL_H / 2} c={RED} label="No" />
        <Box cx={RX} cy={Y.lpCheck + 48} w={SMALL_W} h={SMALL_H} fill={RED_LIGHT} stroke={RED_BORDER}
          t1="Return Infeasible"
          t2="with explanation for the user" tc={RED} />
        <Arr x1={CX} y1={Y.lpCheck + DIAM / 2} x2={CX} y2={Y.solveLP - BOX_H / 2} />
        <YesLabel cx={CX} cy={Y.lpCheck} />

        {/* 5 */}
        <Num cx={NX} cy={Y.solveLP} n="5" />
        <Box cx={CX} cy={Y.solveLP} fill={BLUE_LIGHT} stroke={BLUE_BORDER}
          t1="Solve Continuous Relaxation"
          t2="Use Simplex method to find theoretical max patients" />
        <Arr x1={CX} y1={Y.solveLP + BOX_H / 2} x2={CX} y2={Y.intSearch - BOX_H / 2} />

        {/* 6 */}
        <Num cx={NX} cy={Y.intSearch} n="6" />
        <Box cx={CX} cy={Y.intSearch} fill={BLUE_LIGHT} stroke={BLUE_BORDER}
          t1="Compute Integer Resources"
          t2="Round staff up, enforce minimums for p patients" />
        <Arr x1={CX} y1={Y.intSearch + BOX_H / 2} x2={CX} y2={Y.feasible - DIAM / 2} />

        {/* 7 */}
        <Num cx={NX} cy={Y.feasible} n="7" />
        <Dia cx={CX} cy={Y.feasible} fill={AMBER_LIGHT} stroke={AMBER_BORDER} t1="Within budget" t2="and space?" />
        <Elbow x1={CX + DIAM / 2} y1={Y.feasible} x2={RX} y2={Y.feasible + 48 - SMALL_H / 2} c={RED} label="No" />
        <Box cx={RX} cy={Y.feasible + 48} w={SMALL_W} h={SMALL_H} fill={SLATE_LIGHT} stroke={SLATE_BORDER}
          t1="Reduce patients by 1"
          t2="and try again" />
        {/* loop arrow */}
        <g>
          <defs><Marker id="lb" color={SLATE} /></defs>
          <polyline
            points={`${RX},${Y.feasible + 48 + SMALL_H / 2} ${RX},${Y.feasible + 130} ${CX + BOX_W / 2 + 32},${Y.feasible + 130} ${CX + BOX_W / 2 + 32},${Y.intSearch}`}
            fill="none" stroke={SLATE} strokeWidth={1.5} strokeDasharray="6 3" markerEnd="url(#lb)"
          />
          <text x={RX + 8} y={Y.feasible + 128} fill={SLATE} fontSize={9} fontFamily="system-ui" opacity={0.55}>loop back to step 6</text>
        </g>
        <Arr x1={CX} y1={Y.feasible + DIAM / 2} x2={CX} y2={Y.optimal - BOX_H / 2} />
        <YesLabel cx={CX} cy={Y.feasible} />

        {/* 8 */}
        <Num cx={NX} cy={Y.optimal} n="8" />
        <Box cx={CX} cy={Y.optimal} fill={GREEN_LIGHT} stroke={GREEN_BORDER}
          t1="Optimal Solution Found"
          t2="Best feasible number of patients and resources" tc={GREEN} />
        <Arr x1={CX} y1={Y.optimal + BOX_H / 2} x2={CX} y2={Y.constraints - BOX_H / 2} />

        {/* 9 */}
        <Num cx={NX} cy={Y.constraints} n="9" />
        <Box cx={CX} cy={Y.constraints} fill={PURPLE_LIGHT} stroke={PURPLE_BORDER}
          t1="Analyse Resource Utilisation"
          t2="How much of each resource is used? What is the bottleneck?" tc={PURPLE} />
        <Arr x1={CX} y1={Y.constraints + BOX_H / 2} x2={CX} y2={Y.sensitivity - BOX_H / 2} />

        {/* 10 */}
        <Num cx={NX} cy={Y.sensitivity} n="10" />
        <Box cx={CX} cy={Y.sensitivity} fill={PURPLE_LIGHT} stroke={PURPLE_BORDER}
          t1="Run Sensitivity Analysis"
          t2="What happens if inputs change? Which matter most?" tc={PURPLE} />
        <Arr x1={CX} y1={Y.sensitivity + BOX_H / 2} x2={CX} y2={Y.end - 20} />

        {/* END */}
        <Pill cx={CX} cy={Y.end} w={220} h={40} fill={GREEN} label="RETURN RESULTS" />

      </svg>

      <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 20, textAlign: "center" }}>
        Figure 1 — Solver algorithm flowchart · IEcare Hospital Resource Allocation Optimizer
      </p>
    </div>
  );
}
