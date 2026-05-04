"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import InputForm from "@/components/InputForm";
import SensitivityDisplay from "@/components/SensitivityDisplay";
import { SolverInput } from "@/lib/solver";
import { SensitivityResult } from "@/lib/sensitivity";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const defaultInput: SolverInput = {
  B: 5000000,
  Cd: 200000,
  Cn: 60000,
  Ce: 3000,
  Cb: 2000,
  pd: 3,
  ep: 0.5,
  bp: 1.15,
  np: 4,
  Ae: 4,
  Ab: 10,
  AT: 2000,
  avgLOS: 5,
  dMin: 2,
  nMin: 4,
};

export default function SensitivityPage() {
  const [input, setInput] = useState<SolverInput>(defaultInput);
  const [result, setResult] = useState<SensitivityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sensitivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sensitivity analysis failed");
      }
      const data: SensitivityResult = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
              Sensitivity Analysis
            </h1>
            <Link
              href="/explanation#sensitivity"
              title="What is Sensitivity Analysis?"
              className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-colors text-sm font-bold"
            >
              ?
            </Link>
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
          <p className="mt-3 text-[#9ba4b8] text-sm max-w-xl mx-auto leading-relaxed text-center">
            Explore how changes in each parameter affect the optimal solution.
            Identify which constraints are most critical and where bottleneck shifts occur.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <InputForm
              values={input}
              onChange={setInput}
              onSolve={handleRun}
              loading={loading}
            />
            {/* Override button text */}
            {loading && (
              <div className="mt-4 glass rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-3">
                  <svg className="h-5 w-5 animate-spin text-amber-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-slate-400">Running ~1,500 solver iterations…</span>
                </div>
              </div>
            )}
          </div>

          <div>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-[10px] border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300 mb-4"
              >
                {error}
              </motion.div>
            )}
            {result ? (
              <SensitivityDisplay data={result} input={input} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card h-full p-6 flex flex-col"
              >
                <div className="space-y-3 flex-1">
                  <div className="rounded-xl bg-[#1a1f33] h-14" />
                  <div className="rounded-xl bg-[#1a1f33] h-36" />
                  <div className="rounded-xl bg-[#1a1f33] h-28" />
                  <div className="rounded-xl bg-[#1a1f33] h-28" />
                </div>
                <div className="pt-4 text-center">
                  <p className="text-xs text-[#5e6780]">
                    Set your baseline parameters and click Solve to run the sensitivity analysis.
                  </p>
                  <p className="text-[10px] text-[#3d4560] mt-1">
                    Sweeps each parameter ±50%, computes shadow prices, generates a heatmap, and detects bottleneck breakpoints.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
