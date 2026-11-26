export type JobStatus = "pending" | "processing" | "completed" | "error";

export interface EnhanceHistoryJob {
  tracks: MusicHistoryTrack[];
  progress: number;
  status: JobStatus;
  result: EnhancedMusicHistoryTrack[] | null;
  error?: string;
  createdAt: number;
  ownerKey: string;
  cancelled?: boolean;
}

export interface JobState {
  jobId: string;
  status: JobStatus;
  progress: number;
  result: EnhancedMusicHistoryTrack[] | null;
  error?: string;
  queuePosition?: number;
}
