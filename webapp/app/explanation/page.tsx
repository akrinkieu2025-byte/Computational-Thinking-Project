"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { motion } from "framer-motion";

const sections = [
  {
    title: "What Does This Tool Do?",
    content: `This tool helps hospital administrators decide how to allocate limited resources (doctors, nurses, monitoring stations, and beds) to treat the maximum number of patients. You enter your budget, costs, and capacity constraints, and the optimizer finds the best possible allocation using mathematical optimization.`,
  },
  {
    title: "The Bottleneck Concept",
    content: `In any system with multiple resources, the resource in shortest supply limits overall output. This is called the "bottleneck." For example, even if you have plenty of beds, if you don't have enough nurses, the number of patients you can treat is limited by nursing capacity. The optimizer identifies which constraint is binding (the true bottleneck) so you know where to invest next.`,
  },
  {
    title: "The Mathematical Model",
    equations: true,
  },
  {
    title: "How the Solver Works",
    content: `The tool uses Linear Programming (LP) to solve a continuous relaxation of the problem, then searches downward from the LP optimum to find the best feasible integer solution. This guarantees the true integer-optimal result for our model structure. The LP solver explores the feasible region defined by all constraints and finds the point that maximizes patient capacity. Since all decision variables must be whole numbers (you can't hire half a doctor), the tool then computes exact integer resource requirements for each candidate patient count until it finds one that satisfies both the budget and space limits.`,
  },
  {
    title: "Understanding the Output",
    content: `The results show: (1) Optimal values: the exact number of doctors, nurses, equipment, and beds to allocate. (2) Maximum patients: the highest number of patients treatable. (3) Budget and space usage: how much of each is consumed. (4) Constraint analysis: which constraints are "binding" (fully used) vs. having "slack" (unused capacity). (5) The bottleneck: the single most limiting factor.`,
  },
  {
    id: "sensitivity",
    title: "Sensitivity Analysis",
    content: `After finding the optimal solution, you might wonder: how robust is this result? What happens if costs change or capacity shifts? That is exactly what sensitivity analysis answers.

Sensitivity analysis systematically varies each input parameter to see how the optimal number of patients (P*) responds. The tool provides five key views:

(1) Tornado Chart: Shows which parameters have the biggest impact on the result. Each bar represents the change in P* when a single parameter moves +/-20% from its baseline. Longer bars mean higher sensitivity, telling you where accurate estimates matter most.

(2) Parameter Sweep: Lets you pick any parameter and see a line chart of P* as that parameter varies from -50% to +50%. This reveals whether the relationship is smooth or if there are sharp jumps where a new constraint becomes binding.

(3) Shadow Prices: For each constraint, the shadow price (dual value) tells you how much P* would improve if you relaxed that constraint by one unit. A high shadow price means that constraint is a valuable target for investment. A zero shadow price means the constraint already has slack.

(4) Heatmap: Varies two parameters simultaneously (Budget and Space) and shows P* for every combination in a color grid. This helps you understand trade-offs and see whether increasing budget alone is enough or if you also need more space.

(5) Breakpoints: Identifies the exact parameter values where the bottleneck shifts from one constraint to another. For example, the budget constraint might be binding until the budget reaches a certain threshold, at which point space becomes the new bottleneck.

Together, these tools help decision-makers prioritize investments, assess risk, and build confidence in the optimization results.`,
  },
  {
    title: "Limitations",
    content: `This model assumes: (1) All relationships are linear; in reality, efficiency may change with scale. (2) The solver finds exact integer solutions — all resources are whole numbers. (3) Patient demand is unlimited: the model assumes you can always fill capacity. (4) Staffing uses a fixed 3-shift (8h each) model for 24/7 coverage; real schedules may differ. (5) No time dimension: the model is static, not accounting for seasonal variation. (6) Single objective: real hospitals balance many goals beyond patient count (quality, wait times, staff wellbeing).`,
  },
];

export default function ExplanationPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
              How It Works
            </h1>
            <div className="rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 p-1.5">
              <Image
                src="/ie-logo.jpg"
                alt="IE University"
                width={100}
                height={34}
                className="object-contain h-auto rounded-md brightness-[1.15] contrast-[0.9]"
                priority
              />
            </div>
          </div>
          <p className="mt-3 text-[#9ba4b8] text-sm max-w-lg mx-auto leading-relaxed text-center">
            A complete guide to the optimization model behind OptiCare
          </p>
        </motion.div>

        <div className="space-y-5">
          {sections.map((s, i) => (
            <Card key={i} delay={i * 0.06}>
              <div id={(s as Record<string, unknown>).id as string | undefined} className="min-w-0 scroll-mt-24">
                <h2 className="text-base font-semibold text-slate-200 mb-3">{s.title}</h2>
                {s.equations ? <MathBlock /> : (
                  <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-line">{s.content}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

function MathBlock() {
  return (
    <div className="space-y-6">
      {/* Objective */}
      <div className="space-y-2">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Objective</div>
          <div className="text-lg text-blue-300 font-mono tracking-wide">
            Maximize P
          </div>
        </div>
        <p className="text-xs text-slate-500 pl-2">P = maximum number of patients the ward can treat simultaneously</p>
      </div>

      {/* Constraints */}
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject to:</div>

      {/* Doctor constraint */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            (3 / pd) × P &nbsp;≤&nbsp; d
          </div>
        </div>
        <div className="text-xs text-slate-500 pl-2 space-y-0.5">
          <p><span className="text-slate-400 font-medium">pd</span> = patients one doctor can handle per shift (e.g. 3)</p>
          <p><span className="text-slate-400 font-medium">3</span> = number of 8-hour shifts for 24/7 coverage</p>
          <p><span className="text-slate-400 font-medium">d</span> = total doctor FTEs hired</p>
        </div>
      </div>

      {/* Nurse constraint */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            (3 / np) × P &nbsp;≤&nbsp; n
          </div>
        </div>
        <div className="text-xs text-slate-500 pl-2 space-y-0.5">
          <p><span className="text-slate-400 font-medium">np</span> = patients one nurse can handle per shift (e.g. 4)</p>
          <p><span className="text-slate-400 font-medium">n</span> = total nurse FTEs hired</p>
        </div>
      </div>

      {/* Monitor constraint */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            ep × P &nbsp;≤&nbsp; e
          </div>
        </div>
        <div className="text-xs text-slate-500 pl-2 space-y-0.5">
          <p><span className="text-slate-400 font-medium">ep</span> = monitoring stations needed per patient (e.g. 0.5 = 1 per 2 patients)</p>
          <p><span className="text-slate-400 font-medium">e</span> = total monitoring stations purchased</p>
        </div>
      </div>

      {/* Bed constraint */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            bp × P &nbsp;≤&nbsp; b
          </div>
        </div>
        <div className="text-xs text-slate-500 pl-2 space-y-0.5">
          <p><span className="text-slate-400 font-medium">bp</span> = beds per patient (e.g. 1.15 for 15% turnover buffer)</p>
          <p><span className="text-slate-400 font-medium">b</span> = total physical beds</p>
        </div>
      </div>

      {/* Budget constraint */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            Cd × d &nbsp;+&nbsp; Cn × n &nbsp;+&nbsp; Ce × e &nbsp;+&nbsp; Cb × b &nbsp;≤&nbsp; B
          </div>
        </div>
        <div className="text-xs text-slate-500 pl-2 space-y-0.5">
          <p><span className="text-slate-400 font-medium">Cd</span> = annual cost per doctor FTE (salary + benefits)</p>
          <p><span className="text-slate-400 font-medium">Cn</span> = annual cost per nurse FTE</p>
          <p><span className="text-slate-400 font-medium">Ce</span> = annualized cost per monitor (purchase ÷ life + maintenance)</p>
          <p><span className="text-slate-400 font-medium">Cb</span> = annualized cost per bed</p>
          <p><span className="text-slate-400 font-medium">B</span> = total annual budget</p>
        </div>
      </div>

      {/* Space constraint */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            Ae × e &nbsp;+&nbsp; Ab × b &nbsp;≤&nbsp; AT
          </div>
        </div>
        <div className="text-xs text-slate-500 pl-2 space-y-0.5">
          <p><span className="text-slate-400 font-medium">Ae</span> = floor space per monitoring station (m²)</p>
          <p><span className="text-slate-400 font-medium">Ab</span> = floor space per bed (m²)</p>
          <p><span className="text-slate-400 font-medium">AT</span> = total available ward floor space (m²)</p>
        </div>
      </div>

      {/* Min staffing */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            d &nbsp;≥&nbsp; dMin &nbsp;&nbsp;&nbsp;&nbsp; n &nbsp;≥&nbsp; nMin
          </div>
        </div>
        <div className="text-xs text-slate-500 pl-2 space-y-0.5">
          <p><span className="text-slate-400 font-medium">dMin</span> = minimum doctors required (regulatory/safety floor)</p>
          <p><span className="text-slate-400 font-medium">nMin</span> = minimum nurses required (regulatory/safety floor)</p>
        </div>
      </div>

      {/* Integer & non-negativity */}
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-5 py-3">
          <div className="text-base text-blue-300 font-mono">
            P, d, n, e, b &nbsp;∈&nbsp; ℤ⁺ &nbsp;&nbsp;(positive integers)
          </div>
        </div>
        <p className="text-xs text-slate-500 pl-2">All decision variables must be whole numbers — you cannot hire half a doctor or buy 0.3 beds.</p>
      </div>

      {/* Annual throughput note */}
      <div className="mt-4 rounded-lg bg-blue-500/5 border border-blue-500/10 px-5 py-3">
        <div className="text-xs font-semibold text-blue-400/80 mb-1">Annual Throughput Estimate</div>
        <div className="text-sm text-blue-300 font-mono mb-2">
          Annual patients ≈ P × 365 / avgLOS
        </div>
        <p className="text-xs text-slate-500"><span className="text-slate-400 font-medium">avgLOS</span> = average length of stay in days. This is a display metric, not a constraint in the optimization.</p>
      </div>
    </div>
  );
}
