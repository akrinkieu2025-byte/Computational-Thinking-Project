"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import InputForm from "@/components/InputForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { SolverInput, SolverResult } from "@/lib/solver";
import Image from "next/image";
import { motion } from "framer-motion";

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

export default function Home() {
  const [input, setInput] = useState<SolverInput>(defaultInput);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Solver failed");
      }
      const data: SolverResult = await res.json();
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
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Resource Allocation Optimizer
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 max-w-lg">
              Maximize concurrent patient capacity within budget, staffing, and space constraints.
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

        {/* Main layout: inputs left, results right (results larger) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <InputForm values={input} onChange={setInput} onSolve={handleSolve} loading={loading} />

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
              <ResultsDisplay result={result} input={input} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card h-full p-8 flex flex-col items-center justify-center"
              >
                <div className="w-full max-w-sm space-y-3 opacity-40">
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="rounded-md bg-[#161b26] h-16" />
                    ))}
                  </div>
                  <div className="rounded-md bg-[#161b26] h-10" />
                  <div className="rounded-md bg-[#161b26] h-10" />
                </div>
                <p className="text-center text-[11px] text-slate-600 mt-6">
                  Configure parameters and run the solver to see optimization results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
