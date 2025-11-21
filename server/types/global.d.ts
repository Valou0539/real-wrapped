interface EnhanceHistoryJob {
  tracks: MusicHistoryTrack[];
  progress: number;
  result: EnhancedMusicHistoryTrack[] | null;
}

declare global {
  var __enhanceHistoryJobs: Map<string, EnhanceHistoryJob>;
}

export {};
