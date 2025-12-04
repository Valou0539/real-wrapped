import type { EnhanceHistoryJob } from "../services/enhance-history/types";

declare global {
  var __enhanceHistoryJobs: Map<string, EnhanceHistoryJob>;
}

export {};
