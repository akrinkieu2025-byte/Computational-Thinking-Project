// eslint-disable-next-line @typescript-eslint/no-require-imports
const solver = require("javascript-lp-solver");

export interface SolverInput {
  B: number;   // Annual operating budget (€/year)
  Cd: number;  // Annual cost per doctor FTE (€/year, fully loaded)
  Cn: number;  // Annual cost per nurse FTE (€/year, fully loaded)
  Ce: number;  // Annualized cost per monitoring station (€/year)
  Cb: number;  // Annualized cost per bed (€/year)
  dp: number;  // Doctor FTEs hired per patient-slot (incl. shift coverage)
  ep: number;  // Monitoring stations per patient-slot
  bp: number;  // Beds per patient-slot (>1 = turnover buffer)
  np: number;  // Patients per nurse on shift (e.g. 4 = one nurse handles 4 patients)
  Ae: number;  // Floor space per monitoring station (m²)
  Ab: number;  // Floor space per bed (m²)
  AT: number;  // Total available ward floor space (m²)
  avgLOS: number; // Average length of stay in days (display only, not a constraint)
}

export interface SolverResult {
  optimal: boolean;
  P: number;
  d: number;
  n: number;
  e: number;
  b: number;
  // Integer (ceil-rounded) practical values
  intP: number;
  intD: number;
  intN: number;
  intE: number;
  intB: number;
  annualThroughput: number; // Estimated annual patients treated (intP × 365 / avgLOS)
  intBudgetUsed: number;
  intBudgetPercent: number;
  intSpaceUsed: number;
  intSpacePercent: number;
  budgetUsed: number;
  budgetPercent: number;
  spaceUsed: number;
  spacePercent: number;
  constraints: {
    name: string;
    capacity: number;
    slack: number;
    binding: boolean;
  }[];
  bottleneck: string;
}

export async function solve(input: SolverInput): Promise<SolverResult> {
  const { B, Cd, Cn, Ce, Cb, dp, ep, bp, np, Ae, Ab, AT } = input;

  // Convert user-friendly "patients per nurse on shift" to FTEs needed per patient
  // 3 shifts needed for 24/7 coverage → nurseRatio = 3 / np
  const nurseRatio = 3 / np;

  /*
   * LINEAR PROGRAMMING MODEL — Annual Hospital Ward Planning
   *
   * Decision Variables:
   *   P = concurrent patient capacity (avg daily census)
   *   d = doctor FTEs hired (annual)
   *   n = nurse FTEs hired (annual)
   *   e = monitoring stations
   *   b = physical beds
   *
   * Objective: maximize P (concurrent patient-slots)
   *
   * Constraints (all in ≤ form):
   *   doctor_cap:  dp·P − d ≤ 0       → need dp doctors per patient (incl. shift cover)
   *   equip_cap:   ep·P − e ≤ 0       → need ep monitors per patient
   *   bed_cap:     bp·P − b ≤ 0       → need bp beds per patient (>1 = turnover buffer)
   *   budget:      Cd·d + Cn·n + Ce·e + Cb·b ≤ B  (annual €)
   *   nurse_qual:  (3/np)·P − n ≤ 0   → need 3 shifts ÷ patients-per-nurse nurses per patient
   *   space:       Ae·e + Ab·b ≤ AT   (m²)
   *
   * Annual throughput ≈ P × 365 / avg_length_of_stay (displayed, not a constraint)
   */

  const model = {
    optimize: "patients",
    opType: "max",
    constraints: {
      doctor_cap:  { max: 0 },
      equip_cap:   { max: 0 },
      bed_cap:     { max: 0 },
      budget:      { max: B },
      nurse_qual:  { max: 0 },
      space:       { max: AT },
    },
    variables: {
      P: {
        patients: 1,
        doctor_cap: dp,
        equip_cap: ep,
        bed_cap: bp,
        nurse_qual: nurseRatio,
      },
      d: {
        doctor_cap: -1,
        budget: Cd,
      },
      n: {
        budget: Cn,
        nurse_qual: -1,
      },
      e: {
        equip_cap: -1,
        budget: Ce,
        space: Ae,
      },
      b: {
        bed_cap: -1,
        budget: Cb,
        space: Ab,
      },
    },
  };

  const result = solver.Solve(model);

  const P = result.P ?? 0;
  const d = result.d ?? 0;
  const n = result.n ?? 0;
  const e = result.e ?? 0;
  const b = result.b ?? 0;
  const optimal = result.feasible === true;

  const budgetUsed = Cd * d + Cn * n + Ce * e + Cb * b;
  const spaceUsed = Ae * e + Ab * b;

  const constraints = [
    {
      name: "Doctor Capacity",
      capacity: round(dp > 0 ? d / dp : Infinity),
      slack: round((dp > 0 ? d / dp : Infinity) - P),
      binding: dp > 0 && Math.abs(d / dp - P) < 0.01,
    },
    {
      name: "Monitoring Station Capacity",
      capacity: round(ep > 0 ? e / ep : Infinity),
      slack: round((ep > 0 ? e / ep : Infinity) - P),
      binding: ep > 0 && Math.abs(e / ep - P) < 0.01,
    },
    {
      name: "Bed Capacity",
      capacity: round(bp > 0 ? b / bp : Infinity),
      slack: round((bp > 0 ? b / bp : Infinity) - P),
      binding: bp > 0 && Math.abs(b / bp - P) < 0.01,
    },
    {
      name: "Budget",
      capacity: round(B),
      slack: round(B - budgetUsed),
      binding: Math.abs(B - budgetUsed) < 0.01,
    },
    {
      name: "Nurse Staffing (3-shift coverage)",
      capacity: round(nurseRatio > 0 ? n / nurseRatio : Infinity),
      slack: round((nurseRatio > 0 ? n / nurseRatio : Infinity) - P),
      binding: nurseRatio > 0 && Math.abs(n - nurseRatio * P) < 0.01,
    },
    {
      name: "Space",
      capacity: round(AT),
      slack: round(AT - spaceUsed),
      binding: Math.abs(AT - spaceUsed) < 0.01,
    },
  ];

  const bottleneck =
    constraints.find((c) => c.binding)?.name ?? "None identified";

  // Integer (ceil) rounding — you can't hire 4.3 doctors, you need 5
  const intD = Math.ceil(d);
  const intN = Math.ceil(n);
  const intE = Math.ceil(e);
  const intB = Math.ceil(b);
  // Patients rounds DOWN — you can't treat a fraction of a patient
  const intP = Math.floor(P);
  const intBudgetUsed = Cd * intD + Cn * intN + Ce * intE + Cb * intB;
  const intSpaceUsed = Ae * intE + Ab * intB;
  // Annual throughput estimate
  const annualThroughput = Math.floor(intP * 365 / input.avgLOS);

  return {
    optimal,
    P: round(P),
    d: round(d),
    n: round(n),
    e: round(e),
    b: round(b),
    intP,
    intD,
    intN,
    intE,
    intB,
    annualThroughput,
    intBudgetUsed: round(intBudgetUsed),
    intBudgetPercent: round((intBudgetUsed / B) * 100),
    intSpaceUsed: round(intSpaceUsed),
    intSpacePercent: round((intSpaceUsed / AT) * 100),
    budgetUsed: round(budgetUsed),
    budgetPercent: round((budgetUsed / B) * 100),
    spaceUsed: round(spaceUsed),
    spacePercent: round((spaceUsed / AT) * 100),
    constraints,
    bottleneck,
  };
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
