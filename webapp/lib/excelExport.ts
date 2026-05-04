import * as XLSX from "xlsx";
import { SolverInput, SolverResult } from "./solver";

export function generateExcel(input: SolverInput, result: SolverResult): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Inputs sheet
  const inputRows = [
    ["Parameter", "Symbol", "Value"],
    ["Annual Budget", "B", input.B],
    ["Annual Cost per Doctor", "Cd", input.Cd],
    ["Annual Cost per Nurse", "Cn", input.Cn],
    ["Annual Cost per Monitor (deprec.+maint.)", "Ce", input.Ce],
    ["Annual Cost per Bed (deprec.+maint.)", "Cb", input.Cb],
    ["Patients per Doctor (on shift)", "pd", input.pd],
    ["Monitors per Patient", "ep", input.ep],
    ["Beds per Patient (incl. buffer)", "bp", input.bp],
    ["Patients per Nurse (on shift)", "np", input.np],
    ["Space per Monitoring Station", "Ae", input.Ae],
    ["Space per Bed", "Ab", input.Ab],
    ["Total Space", "AT", input.AT],
    ["Avg. Length of Stay (days)", "avgLOS", input.avgLOS],
    ["Min. Doctors", "dMin", input.dMin],
    ["Min. Nurses", "nMin", input.nMin],
  ];
  const wsInput = XLSX.utils.aoa_to_sheet(inputRows);
  wsInput["!cols"] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsInput, "Inputs");

  // Results sheet
  const resultRows = [
    ["Metric", "Value"],
    ["Optimal Solution Found", result.optimal ? "Yes" : "No"],
    ["Max Patients (P*)", result.P],
    ["Optimal Doctors (d*)", result.d],
    ["Optimal Nurses (n*)", result.n],
    ["Optimal Monitors (e*)", result.e],
    ["Optimal Beds (b*)", result.b],
    ["Budget Used (LP)", result.budgetUsed],
    ["Budget Usage % (LP)", result.budgetPercent],
    ["", ""],
    ["--- Integer (Rounded) ---", ""],
    ["Practical Patients (⌊P⌋)", result.intP],
    ["Practical Doctors (⌈d⌉)", result.intD],
    ["Practical Nurses (⌈n⌉)", result.intN],
    ["Practical Monitors (⌈e⌉)", result.intE],
    ["Practical Beds (⌈b⌉)", result.intB],
    ["Budget Used (Integer)", result.intBudgetUsed],
    ["Budget Usage % (Integer)", result.intBudgetPercent],
    ["Space Used (LP)", result.spaceUsed],
    ["Space Usage % (LP)", result.spacePercent],
    ["Space Used (Integer)", result.intSpaceUsed],
    ["Space Usage % (Integer)", result.intSpacePercent],
    ["Bottleneck", result.bottleneck],
  ];
  const wsResult = XLSX.utils.aoa_to_sheet(resultRows);
  wsResult["!cols"] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResult, "Results");

  // Constraints sheet
  const constraintRows = [
    ["Constraint", "Usage", "Limit", "Utilization %", "Binding?"],
    ...result.constraints.map((c) => [c.name, c.usageLabel, c.limitLabel, c.percent, c.binding ? "YES" : "No"]),
  ];
  const wsConstraints = XLSX.utils.aoa_to_sheet(constraintRows);
  wsConstraints["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsConstraints, "Constraints");

  return wb;
}

export function downloadExcel(input: SolverInput, result: SolverResult) {
  const wb = generateExcel(input, result);
  XLSX.writeFile(wb, "hospital_optimization_results.xlsx");
}
