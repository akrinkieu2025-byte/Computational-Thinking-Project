import * as XLSX from "xlsx";
import { SolverInput } from "./solver";
import { SensitivityResult } from "./sensitivity";

export function downloadSensitivityExcel(input: SolverInput, data: SensitivityResult) {
  const wb = XLSX.utils.book_new();

  /* ── 1. Summary sheet ─────────────────────────────────── */
  const summaryRows: (string | number)[][] = [
    ["SENSITIVITY ANALYSIS REPORT", ""],
    ["Generated", new Date().toISOString()],
    [""],
    ["Baseline Optimal Patients (P*)", data.baseline.P],
    ["Baseline Bottleneck", data.baseline.bottleneck],
    [""],
    ["--- Input Parameters ---", ""],
    ["Budget (B)", input.B],
    ["Cost/Doctor (Cd)", input.Cd],
    ["Cost/Nurse (Cn)", input.Cn],
    ["Cost/Monitor (Ce)", input.Ce],
    ["Cost/Bed (Cb)", input.Cb],
    ["Doctors/Patient (dp)", input.dp],
    ["Monitors/Patient (ep)", input.ep],
    ["Beds/Patient (bp)", input.bp],
    ["Min Nurse Ratio (K)", input.K],
    ["Space/Monitor (Ae)", input.Ae],
    ["Space/Bed (Ab)", input.Ab],
    ["Total Space (AT)", input.AT],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 35 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  /* ── 2. Tornado sheet ─────────────────────────────────── */
  const tornadoRows: (string | number)[][] = [
    ["Parameter", "−20% Patients", "Baseline", "+20% Patients", "Range (Sensitivity)"],
    ...data.tornado.map((t) => [
      t.paramLabel,
      t.lowPatients,
      t.baselinePatients,
      t.highPatients,
      t.range,
    ]),
  ];
  const wsTornado = XLSX.utils.aoa_to_sheet(tornadoRows);
  wsTornado["!cols"] = [{ wch: 25 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsTornado, "Tornado");

  /* ── 3. Shadow Prices sheet ───────────────────────────── */
  const shadowRows: (string | number)[][] = [
    ["Constraint", "Binding?", "ε (bump)", "Marginal Value (ΔP/Δε)", "Interpretation"],
    ...data.shadowPrices.map((s) => [
      s.constraint,
      s.binding ? "YES" : "No",
      s.epsilon,
      s.marginalValue,
      s.interpretation,
    ]),
  ];
  const wsShadow = XLSX.utils.aoa_to_sheet(shadowRows);
  wsShadow["!cols"] = [{ wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 22 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsShadow, "Shadow Prices");

  /* ── 4. Breakpoints sheet ─────────────────────────────── */
  const bpRows: (string | number)[][] = [
    ["Parameter", "Threshold Value", "Bottleneck Before", "Bottleneck After"],
    ...data.breakpoints.map((b) => [
      b.paramLabel,
      b.value,
      b.bottleneckBefore,
      b.bottleneckAfter,
    ]),
  ];
  const wsBP = XLSX.utils.aoa_to_sheet(bpRows);
  wsBP["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 28 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsBP, "Breakpoints");

  /* ── 5. Parameter sweeps (one sheet each) ─────────────── */
  for (const sweep of data.sweeps) {
    const rows: (string | number)[][] = [
      ["% Change", `${sweep.paramLabel} Value`, "Patients (P*)", "Bottleneck"],
      ...sweep.points.map((p) => [
        `${p.pctChange >= 0 ? "+" : ""}${p.pctChange}%`,
        p.paramValue,
        p.patients,
        p.bottleneck,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 28 }];
    // Sheet names limited to 31 chars
    const name = `Sweep ${sweep.paramKey}`.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  /* ── 6. Heatmap data sheet ────────────────────────────── */
  // Matrix format: rows = AT values, cols = B values
  const hdr: (string | number)[] = [`${data.heatmap.yLabel} \\ ${data.heatmap.xLabel}`, ...data.heatmap.xValues];
  const heatRows: (string | number)[][] = [hdr];
  for (const y of data.heatmap.yValues) {
    const row: (string | number)[] = [y];
    for (const x of data.heatmap.xValues) {
      const cell = data.heatmap.cells.find((c) => c.x === x && c.y === y);
      row.push(cell?.patients ?? 0);
    }
    heatRows.push(row);
  }
  const wsHeat = XLSX.utils.aoa_to_sheet(heatRows);
  XLSX.utils.book_append_sheet(wb, wsHeat, "Heatmap Data");

  /* ── Download ─────────────────────────────────────────── */
  XLSX.writeFile(wb, "sensitivity_analysis.xlsx");
}
