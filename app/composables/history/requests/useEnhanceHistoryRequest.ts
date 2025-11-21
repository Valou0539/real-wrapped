import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useEnhanceHistoryRequest = () => {
  const execute = (
    body: MusicHistoryTrack[],
    fetchConfig?: NitroFetchOptions<NitroFetchRequest>,
  ) => {
    return $fetch<{ jobId: string }>("/api/enhance-history", {
      method: "POST",
      body,
      ...fetchConfig,
    });
  };

  return { execute };
};
