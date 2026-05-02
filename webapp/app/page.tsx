"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import InputForm from "@/components/InputForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { SolverInput, SolverResult } from "@/lib/solver";
import Image from "next/image";
import { motion } from "framer-motion";

const defaultInput: SolverInput = {
  B: 2500000,
  Cd: 250000,
  Cn: 75000,
  Ce: 5000,
  Cb: 2500,
  dp: 0.15,
  ep: 0.25,
  bp: 1.2,
  K: 0.5,
  Ae: 6,
  Ab: 12,
  AT: 3000,
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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
              Hospital Resource Optimizer
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
          <p className="mt-3 text-[#9ba4b8] text-sm max-w-xl mx-auto leading-relaxed text-center">
            Find the optimal allocation of doctors, nurses, monitoring stations, and beds to maximize the number of patients treated within your budget and space constraints.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <InputForm values={input} onChange={setInput} onSolve={handleSolve} loading={loading} />

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
              <ResultsDisplay result={result} input={input} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card h-full p-6 flex flex-col"
              >
                <div className="space-y-3 flex-1">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="rounded-xl bg-[#1a1f33] h-[72px]" />
                    ))}
                  </div>
                  <div className="rounded-xl bg-[#1a1f33] h-14" />
                  <div className="rounded-xl bg-[#1a1f33] h-14" />
                  <div className="rounded-xl bg-[#1a1f33] h-24" />
                </div>
                <p className="text-center text-xs text-[#5e6780] pt-4">
                  Enter parameters and click Solve to see results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
