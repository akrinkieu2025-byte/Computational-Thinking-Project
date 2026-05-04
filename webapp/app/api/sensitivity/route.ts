import { NextRequest, NextResponse } from "next/server";
import { SolverInput } from "@/lib/solver";
import { runSensitivity } from "@/lib/sensitivity";

export async function POST(req: NextRequest) {
  try {
    const body: SolverInput = await req.json();

    const fields: (keyof SolverInput)[] = [
      "B", "Cd", "Cn", "Ce", "Cb", "pd", "ep", "bp", "np", "Ae", "Ab", "AT", "avgLOS", "dMin", "nMin",
    ];
    for (const f of fields) {
      if (typeof body[f] !== "number" || body[f] < 0) {
        return NextResponse.json({ error: `Invalid value for ${f}` }, { status: 400 });
      }
    }

    const result = await runSensitivity(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sensitivity analysis error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
