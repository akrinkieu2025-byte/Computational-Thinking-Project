// eslint-disable-next-line @typescript-eslint/no-require-imports
const solver = require("javascript-lp-solver");

export interface SolverInput {
  B: number;   // Total budget
  Cd: number;  // Cost per doctor
  Cn: number;  // Cost per nurse
  Ce: number;  // Cost per monitoring station
  Cb: number;  // Cost per bed
  dp: number;  // Doctors needed per patient
  ep: number;  // Monitoring stations needed per patient
  bp: number;  // Beds needed per patient (includes turnover buffer)
  K: number;   // Minimum nurse-to-patient ratio for quality care
  Ae: number;  // Space per monitoring station
  Ab: number;  // Space per bed
  AT: number;  // Total available space
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
  const { B, Cd, Cn, Ce, Cb, dp, ep, bp, K, Ae, Ab, AT } = input;

  /*
   * javascript-lp-solver uses a tableau model.
   * Variables: P, d, n, e, b
   * Objective: maximize P
   *
   * Constraints (rewritten as ≤ form for the solver):
   *   doctor_cap:  dp*P - d ≤ 0       →  P ≤ d/dp
   *   equip_cap:   ep*P - e ≤ 0       →  P ≤ e/ep  (monitoring stations)
   *   bed_cap:     bp*P - b ≤ 0       →  P ≤ b/bp  (includes turnover buffer)
   *   budget:      Cd*d + Cn*n + Ce*e + Cb*b ≤ B
   *   nurse_qual:  K*P - n ≤ 0        →  n ≥ K*P  (min nurse-to-patient ratio)
   *   space:       Ae*e + Ab*b ≤ AT
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
        nurse_qual: K,
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
      name: "Min. Nurse-to-Patient Ratio",
      capacity: round(K > 0 ? n / K : Infinity),
      slack: round((K > 0 ? n / K : Infinity) - P),
      binding: K > 0 && Math.abs(n - K * P) < 0.01,
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
