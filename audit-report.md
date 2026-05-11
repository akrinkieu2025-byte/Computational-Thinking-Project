# 🔍 Full Audit Report: PDF Mathematical Model vs. Webapp Solver

## Overview

The PDF (written by Krishiv) presents a **simplified closed-form** model, while the webapp (`solver.ts`) implements a **full Linear Programming (LP)** model with integer rounding and additional features. They share the same conceptual foundation but differ in several important ways.

---

## ✅ Agreements (What Matches)

| Aspect | PDF | Solver | Match? |
|--------|-----|--------|--------|
| Decision variables | d, n, e, b, P | d, n, e, b, P | ✅ |
| Objective | max(P) | `optimize: "patients", opType: "max"` | ✅ |
| Budget constraint | Cd·d + Cn·n + Ce·e + Cb·b ≤ B | `budget: { max: B }` with costs on d,n,e,b | ✅ |
| Area constraint | Ae·e + Ab·b ≤ AT | `space: { max: AT }` with Ae on e, Ab on b | ✅ |
| Non-negativity | (d, n, e, b, p) ≥ 0 | Implicit in LP solver (all variables ≥ 0) | ✅ |
| Base capacity linkage | d = dp·P, e = ep·P, b = bp·P | LP constraints: `doctor_cap`, `equip_cap`, `bed_cap` enforce these | ✅ |

---

## ❌ Differences & Discrepancies

### 1. Nurse/Quality Constraint — Structural Mismatch

**PDF says:**
> n ≥ P·K where K = minimum required nurses per patient

This means K is the nurse-to-patient ratio itself (np = K). The PDF then substitutes n = np·P into this and concludes the feasibility condition is simply np ≥ K.

**Solver does:**
```typescript
nurseRatio = 3 / np;  // np = patients per nurse on shift
// Constraint: nurseRatio * P <= n  (i.e., n >= (3/np) * P)
```

The solver uses `np` as **patients per nurse** (e.g., 4 means 1 nurse handles 4 patients), and applies a **3-shift coverage multiplier** (for 24/7 operations). So the effective nurse requirement per patient is 3/np.

**Verdict:** The PDF treats the nurse constraint as a simple ratio n ≥ K·P with no shift multiplier. The solver applies 24/7 shift coverage (×3) to both doctors and nurses. **The PDF is missing the shift-coverage factor.**

---

### 2. Doctor Constraint — Shift Coverage Missing in PDF

**PDF says:**
> d = dp·P where dp = doctors per patient

**Solver does:**
```typescript
doctorRatio = 3 / pd;  // pd = patients per doctor on shift
```

The solver divides by `pd` (patients one doctor handles) and multiplies by 3 (shifts). So if pd = 5, one patient needs 3/5 = 0.6 doctor FTEs.

**Verdict:** The PDF's dp would need to equal 3/pd to match the solver. The PDF doesn't mention or account for **24/7 shift coverage**. This is a significant omission.

---

### 3. Minimum Staff Floors — Missing from PDF

**Solver has:**
```typescript
dMin: number; // Minimum doctors (regulatory/safety floor)
nMin: number; // Minimum nurses (regulatory/safety floor)
```
The integer search enforces: d ≥ dMin, n ≥ nMin.

**PDF:** No mention of minimum staffing requirements.

**Verdict:** ❌ Missing from the report.

---

### 4. Integer Constraints — Missing from PDF

The solver explicitly searches for the best **integer** solution (you can't hire 2.7 doctors). The PDF works entirely in continuous space and presents a closed-form ratio solution.

**Verdict:** The PDF model gives a theoretical upper bound but doesn't address that real solutions must be integers.

---

### 5. Average Length of Stay (avgLOS) / Annual Throughput — Missing from PDF

The solver computes:

```
Annual Throughput = floor(P × 365 / avgLOS)
```

The PDF only solves for concurrent patients P and never mentions throughput or LOS.

**Verdict:** ❌ Not in the report (though this is more of an output metric than a model constraint).

---

### 6. PDF's "Quality Constraint" vs. Solver's Nurse Constraint

The PDF frames nurses as a **quality constraint** (n ≥ P·K) that is separate from the base capacity constraint. But in the solver, nurses are treated identically to doctors — as a **capacity constraint** (n ≥ nurseRatio × P). There is no separate "quality" constraint in the solver; it's just another resource ratio.

**Verdict:** Conceptually equivalent, but the framing differs. The PDF's separation into "base constraint" + "quality constraint" doesn't reflect the solver's unified treatment of all four resources symmetrically.

---

### 7. PDF's Closed-Form Solution vs. Solver's LP Approach

The PDF derives:

```
P ≤ min( B / (Cd·dp + Cn·np + Ce·ep + Cb·bp),  AT / (Ae·ep + Ab·bp) )
```

This is mathematically **correct for the LP relaxation** — it's what you'd get by substituting the binding resource constraints into budget and space. However, it **assumes all resources scale linearly with P at their exact ratios**, which is exactly what the LP does. So the closed-form is a valid algebraic simplification of the LP.

**Verdict:** ✅ Mathematically equivalent to the LP relaxation (ignoring shift multiplier and min-staff differences).

---

## 📋 Summary Table

| Feature | PDF Report | Webapp Solver | Status |
|---------|-----------|---------------|--------|
| Objective: max P | ✅ | ✅ | ✅ Match |
| Budget constraint | ✅ | ✅ | ✅ Match |
| Space/Area constraint | ✅ | ✅ | ✅ Match |
| Non-negativity | ✅ | ✅ | ✅ Match |
| Resource-patient ratios | dp, np, ep, bp | 3/pd, 3/np, ep, bp | ⚠️ Shift factor missing in PDF |
| 24/7 shift coverage (×3) | ❌ Not mentioned | ✅ Applied to doctors & nurses | ❌ Missing |
| Minimum staff floors (dMin, nMin) | ❌ | ✅ | ❌ Missing |
| Integer rounding | ❌ | ✅ | ❌ Missing |
| Annual throughput / LOS | ❌ | ✅ | ❌ Missing |
| Separate quality constraint | ✅ (n ≥ K·P) | Merged into nurse capacity | ⚠️ Different framing |

---

## 🎯 Recommendations

1. **Add shift coverage to the PDF**: Explain that for 24/7 operations, dp = 3/pd where pd is patients per doctor per shift.
2. **Add minimum staffing**: Mention d ≥ dMin, n ≥ nMin as regulatory constraints.
3. **Mention integrality**: Note that the final solution rounds to integers.
4. **Clarify notation**: The PDF uses np as "nurses per patient" while the solver uses `np` as "patients per nurse" — these are reciprocals. This should be made consistent to avoid confusion.
