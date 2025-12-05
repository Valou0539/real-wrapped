import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

export const useCancelJobRequest = () => {
  const execute = (
    jobId: string,
    fetchConfig?: NitroFetchOptions<NitroFetchRequest>,
  ) => {
    return $fetch<{ success: boolean }>(`/api/enhance-history?jobId=${jobId}`, {
      method: "DELETE",
      ...fetchConfig,
    });
  };

  return { execute };
};
