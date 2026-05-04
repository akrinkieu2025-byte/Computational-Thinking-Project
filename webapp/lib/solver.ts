// eslint-disable-next-line @typescript-eslint/no-require-imports
const lpSolver = require("javascript-lp-solver");

export interface SolverInput {
  B: number;   // Annual operating budget (€/year)
  Cd: number;  // Annual cost per doctor FTE (€/year, fully loaded)
  Cn: number;  // Annual cost per nurse FTE (€/year, fully loaded)
  Ce: number;  // Annualized cost per monitoring station (€/year)
  Cb: number;  // Annualized cost per bed (€/year)
  pd: number;  // Patients per doctor on shift (e.g. 3 = one doctor handles 3 patients)
  ep: number;  // Monitoring stations per patient-slot
  bp: number;  // Beds per patient-slot (>1 = turnover buffer)
  np: number;  // Patients per nurse on shift (e.g. 4 = one nurse handles 4 patients)
  Ae: number;  // Floor space per monitoring station (m²)
  Ab: number;  // Floor space per bed (m²)
  AT: number;  // Total available ward floor space (m²)
  avgLOS: number; // Average length of stay in days
  dMin: number; // Minimum doctors (regulatory/safety floor)
  nMin: number; // Minimum nurses (regulatory/safety floor)
}

export interface ConstraintInfo {
  name: string;
  usage: number;
  limit: number;
  usageLabel: string;
  limitLabel: string;
  percent: number;
  binding: boolean;
}

export interface SolverResult {
  optimal: boolean;
  infeasibleReason: string | null;
  P: number;
  d: number;
  n: number;
  e: number;
  b: number;
  intP: number;
  intD: number;
  intN: number;
  intE: number;
  intB: number;
  annualThroughput: number;
  intBudgetUsed: number;
  intBudgetPercent: number;
  intSpaceUsed: number;
  intSpacePercent: number;
  budgetUsed: number;
  budgetPercent: number;
  spaceUsed: number;
  spacePercent: number;
  constraints: ConstraintInfo[];
  bottleneck: string;
}

export async function solve(input: SolverInput): Promise<SolverResult> {
  const { B, Cd, Cn, Ce, Cb, pd, ep, bp, np, Ae, Ab, AT, dMin, nMin } = input;

  // Shift coverage: 3 shifts for 24/7 coverage
  const doctorRatio = 3 / pd; // FTEs needed per patient
  const nurseRatio = 3 / np;  // FTEs needed per patient

  // Pre-check: can we even afford minimum staff?
  const minCost = Cd * dMin + Cn * nMin;
  if (minCost > B) {
    return makeInfeasibleResult(
      `Minimum staffing alone costs €${minCost.toLocaleString()} (${dMin} doctors × €${Cd.toLocaleString()} + ${nMin} nurses × €${Cn.toLocaleString()}) ` +
      `but budget is only €${B.toLocaleString()}. Reduce minimum staff requirements or increase budget.`
    );
  }

  // Check if space allows at least 1 patient
  const spaceFor1Patient = Ae * ep + Ab * bp;
  if (spaceFor1Patient > AT) {
    return makeInfeasibleResult(
      `Even 1 patient requires ${round(spaceFor1Patient)} m² but only ${AT} m² is available. ` +
      `Increase total space or reduce space requirements.`
    );
  }

  /*
   * APPROACH: Solve LP relaxation first, then find the best integer solution.
   *
   * The LP relaxation uses javascript-lp-solver (continuous).
   * Then we search integers near the LP optimum for the best feasible integer point.
   * This works perfectly for our model structure because given integer P,
   * the minimum resources are deterministic: d=ceil(doctorRatio*P), etc.
   */

  // Step 1: Solve LP relaxation to get upper bound
  const model = {
    optimize: "patients",
    opType: "max",
    constraints: {
      doctor_cap: { max: 0 },
      nurse_cap: { max: 0 },
      equip_cap: { max: 0 },
      bed_cap: { max: 0 },
      budget: { max: B },
      space: { max: AT },
    },
    variables: {
      P: {
        patients: 1,
        doctor_cap: doctorRatio,
        nurse_cap: nurseRatio,
        equip_cap: ep,
        bed_cap: bp,
      },
      d: { doctor_cap: -1, budget: Cd },
      n: { nurse_cap: -1, budget: Cn },
      e: { equip_cap: -1, budget: Ce, space: Ae },
      b: { bed_cap: -1, budget: Cb, space: Ab },
    },
  };

  const lpResult = lpSolver.Solve(model);

  if (!lpResult.feasible) {
    return makeInfeasibleResult(
      "The linear relaxation is infeasible. This means no combination of resources can satisfy all constraints simultaneously. " +
      "Check that your budget is sufficient for the cost ratios, and that your space can fit the required equipment and beds."
    );
  }

  const lpP = lpResult.P ?? 0;

  // Step 2: Find best integer solution by searching downward from LP optimum
  // For a given integer P, the minimum resources needed are deterministic:
  //   d = max(dMin, ceil(doctorRatio * P))
  //   n = max(nMin, ceil(nurseRatio * P))
  //   e = ceil(ep * P)
  //   b = ceil(bp * P)
  // Then check budget and space feasibility.

  let bestP = 0;
  let bestD = dMin, bestN = nMin, bestE = 0, bestB_beds = 0;

  const maxP = Math.floor(lpP); // LP gives upper bound

  for (let p = maxP; p >= 0; p--) {
    const dNeeded = Math.max(dMin, Math.ceil(doctorRatio * p));
    const nNeeded = Math.max(nMin, Math.ceil(nurseRatio * p));
    const eNeeded = Math.ceil(ep * p);
    const bNeeded = Math.ceil(bp * p);

    const cost = Cd * dNeeded + Cn * nNeeded + Ce * eNeeded + Cb * bNeeded;
    const space = Ae * eNeeded + Ab * bNeeded;

    if (cost <= B && space <= AT) {
      bestP = p;
      bestD = dNeeded;
      bestN = nNeeded;
      bestE = eNeeded;
      bestB_beds = bNeeded;
      break;
    }
  }

  if (bestP === 0 && maxP > 0) {
    // Even 0 patients should be feasible (just min staff), but let's check
    const minStaffCost = Cd * dMin + Cn * nMin;
    if (minStaffCost <= B) {
      bestP = 0;
      bestD = dMin;
      bestN = nMin;
      bestE = 0;
      bestB_beds = 0;
    } else {
      return makeInfeasibleResult(
        `Cannot find a feasible integer solution. Minimum staffing costs €${minStaffCost.toLocaleString()} which exceeds budget.`
      );
    }
  }

  const intP = bestP;
  const intD = bestD;
  const intN = bestN;
  const intE = bestE;
  const intB = bestB_beds;

  const budgetUsed = Cd * intD + Cn * intN + Ce * intE + Cb * intB;
  const spaceUsed = Ae * intE + Ab * intB;
  const annualThroughput = Math.floor(intP * 365 / input.avgLOS);

  // Constraint utilization analysis
  const constraints: ConstraintInfo[] = [
    {
      name: "Doctor Staffing (3-shift)",
      usage: round(doctorRatio * intP),
      limit: intD,
      usageLabel: `${round(doctorRatio * intP)} FTEs needed`,
      limitLabel: `${intD} FTEs hired`,
      percent: intD > 0 ? round((doctorRatio * intP / intD) * 100) : 0,
      binding: intD > 0 && (intD - doctorRatio * intP) < 1,
    },
    {
      name: "Nurse Staffing (3-shift)",
      usage: round(nurseRatio * intP),
      limit: intN,
      usageLabel: `${round(nurseRatio * intP)} FTEs needed`,
      limitLabel: `${intN} FTEs hired`,
      percent: intN > 0 ? round((nurseRatio * intP / intN) * 100) : 0,
      binding: intN > 0 && (intN - nurseRatio * intP) < 1,
    },
    {
      name: "Monitoring Stations",
      usage: round(ep * intP),
      limit: intE,
      usageLabel: `${round(ep * intP)} stations needed`,
      limitLabel: `${intE} available`,
      percent: intE > 0 ? round((ep * intP / intE) * 100) : 0,
      binding: intE > 0 && (intE - ep * intP) < 1,
    },
    {
      name: "Bed Capacity",
      usage: round(bp * intP),
      limit: intB,
      usageLabel: `${round(bp * intP)} beds needed`,
      limitLabel: `${intB} available`,
      percent: intB > 0 ? round((bp * intP / intB) * 100) : 0,
      binding: intB > 0 && (intB - bp * intP) < 1,
    },
    {
      name: "Annual Budget",
      usage: round(budgetUsed),
      limit: round(B),
      usageLabel: `€${round(budgetUsed).toLocaleString()}`,
      limitLabel: `€${round(B).toLocaleString()}`,
      percent: round((budgetUsed / B) * 100),
      binding: (B - budgetUsed) < (Cd * 0.5), // binding if can't afford half a doctor more
    },
    {
      name: "Floor Space",
      usage: round(spaceUsed),
      limit: round(AT),
      usageLabel: `${round(spaceUsed)} m²`,
      limitLabel: `${round(AT)} m²`,
      percent: round((spaceUsed / AT) * 100),
      binding: (AT - spaceUsed) < (Ae + Ab),
    },
  ];

  const bottleneck =
    constraints.find((c) => c.binding)?.name ?? "None identified";

  return {
    optimal: true,
    infeasibleReason: null,
    P: round(lpP),
    d: round(lpResult.d ?? 0),
    n: round(lpResult.n ?? 0),
    e: round(lpResult.e ?? 0),
    b: round(lpResult.b ?? 0),
    intP,
    intD,
    intN,
    intE,
    intB,
    annualThroughput,
    intBudgetUsed: round(budgetUsed),
    intBudgetPercent: round((budgetUsed / B) * 100),
    intSpaceUsed: round(spaceUsed),
    intSpacePercent: round((spaceUsed / AT) * 100),
    budgetUsed: round(budgetUsed),
    budgetPercent: round((budgetUsed / B) * 100),
    spaceUsed: round(spaceUsed),
    spacePercent: round((spaceUsed / AT) * 100),
    constraints,
    bottleneck,
  };
}

function makeInfeasibleResult(reason: string): SolverResult {
  return {
    optimal: false,
    infeasibleReason: reason,
    P: 0, d: 0, n: 0, e: 0, b: 0,
    intP: 0, intD: 0, intN: 0, intE: 0, intB: 0,
    annualThroughput: 0,
    intBudgetUsed: 0, intBudgetPercent: 0,
    intSpaceUsed: 0, intSpacePercent: 0,
    budgetUsed: 0, budgetPercent: 0,
    spaceUsed: 0, spacePercent: 0,
    constraints: [],
    bottleneck: "Infeasible",
  };
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
