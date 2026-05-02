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
    content: `The tool uses Linear Programming (LP), a mathematical technique for finding the best outcome in a model with linear relationships. The GLPK (GNU Linear Programming Kit) solver explores the feasible region defined by all constraints and finds the vertex (corner point) that maximizes the objective function, in our case, the number of patients. LP is guaranteed to find the global optimum if one exists, making it ideal for resource allocation problems.`,
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
    content: `This model assumes: (1) All relationships are linear; in reality, efficiency may change with scale. (2) The LP solver produces continuous values, but the tool automatically rounds resources up and patients down to give practical whole-number results. (3) Patient demand is unlimited: the model assumes you can always fill capacity. (4) Quality is captured only by the minimum nurse-to-patient ratio K; real quality depends on many factors. (5) No time dimension: the model is static, not accounting for shifts or seasonal variation. (6) Single objective: real hospitals balance many goals beyond patient count.`,
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
            <Image
              src="/ie-logo.jpg"
              alt="IE University"
              width={120}
              height={40}
              className="object-contain mix-blend-screen opacity-90 h-auto"
              priority
            />
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
  const equations = [
    { label: "Objective", eq: "Maximize  P  (number of patients)" },
    { label: "Doctor capacity", eq: "P \u2264 d / d_p" },
    { label: "Monitor capacity", eq: "P \u2264 e / e_p" },
    { label: "Bed capacity", eq: "P \u2264 b / b_p  (b_p > 1 for turnover buffer)" },
    { label: "Budget", eq: "C_d \u00b7 d + C_n \u00b7 n + C_e \u00b7 e + C_b \u00b7 b \u2264 B" },
    { label: "Min. nurse ratio", eq: "n \u2265 K \u00b7 P  (K \u2265 n_p, regulatory floor)" },
    { label: "Space", eq: "A_e \u00b7 e + A_b \u00b7 b \u2264 A_T" },
    { label: "Non-negativity", eq: "d, n, e, b, P \u2265 0" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {equations.map((eq, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border-l-2 border-l-blue-500/30 bg-white/[0.02] px-4 py-2.5">
          <span className="text-[11px] font-medium text-slate-500 w-28 shrink-0">{eq.label}</span>
          <code className="text-sm text-blue-300 font-mono">{eq.eq}</code>
        </div>
      ))}
      <div className="md:col-span-2 mt-2">
        <p className="text-xs text-slate-600">
          Where: P = patients, d = doctors, n = nurses (governed by K), e = monitoring stations, b = beds
        </p>
      </div>
    </div>
  );
}
