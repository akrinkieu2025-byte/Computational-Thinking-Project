declare module "glpk.js" {
  interface GLPKModule {
    GLP_MAX: number;
    GLP_MIN: number;
    GLP_OPT: number;
    GLP_UP: number;
    GLP_LO: number;
    GLP_FX: number;
    GLP_DB: number;
    GLP_FR: number;
    GLP_MSG_OFF: number;
    GLP_MSG_ERR: number;
    GLP_MSG_ON: number;
    GLP_MSG_ALL: number;
    solve(
      lp: {
        name: string;
        objective: {
          direction: number;
          name: string;
          vars: { name: string; coef: number }[];
        };
        subjectTo: {
          name: string;
          vars: { name: string; coef: number }[];
          bnds: { type: number; lb: number; ub: number };
        }[];
        bounds?: {
          name: string;
          type: number;
          lb: number;
          ub: number;
        }[];
      },
      options?: { msglev?: number }
    ): Promise<{
      result: {
        status: number;
        z: number;
        vars: Record<string, number>;
      };
    }>;
  }

  export default function GLPK(): Promise<GLPKModule>;
}
