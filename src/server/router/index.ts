// src/server/router/index.ts
import {createRouter} from "./context";
import superjson from "superjson";

import {traceRouter} from "./trace";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("trace.", traceRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
