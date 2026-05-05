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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Sensitivity Analysis
              </h1>
              <Link
                href="/explanation#sensitivity"
                title="What is Sensitivity Analysis?"
                className="flex items-center justify-center w-5 h-5 rounded bg-blue-500/15 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 transition-colors text-[10px] font-bold"
              >
                ?
              </Link>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 max-w-lg">
              Explore how changes in each parameter affect the optimal solution. Identify which constraints are most critical.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden bg-white/5 border border-white/[0.06] p-1">
            <Image
              src="/ie-logo.jpg"
              alt="IE University"
              width={80}
              height={28}
              className="object-contain rounded brightness-[1.1] contrast-[0.9]"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
        </motion.header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <div>
            <InputForm
              values={input}
              onChange={setInput}
              onSolve={handleRun}
              loading={loading}
            />
            {loading && (
              <div className="mt-3 card p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-amber-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-xs text-slate-500">Running ~1,500 solver iterations…</span>
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300 mb-4"
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
                className="card h-full p-8 flex flex-col items-center justify-center"
              >
                <div className="w-full max-w-sm space-y-3 opacity-40">
                  <div className="rounded-md bg-[#161b26] h-12" />
                  <div className="rounded-md bg-[#161b26] h-32" />
                  <div className="rounded-md bg-[#161b26] h-24" />
                  <div className="rounded-md bg-[#161b26] h-24" />
                </div>
                <div className="pt-6 text-center">
                  <p className="text-[11px] text-slate-600">
                    Set your baseline parameters and click Run Optimization to run the sensitivity analysis.
                  </p>
                  <p className="text-[10px] text-slate-700 mt-1">
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
