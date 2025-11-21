export default defineEventHandler(async (event) => {
  const body = await readBody<MusicHistoryTrack[]>(event);

  // Initialisation de la Map si nécessaire
  if (!globalThis.__enhanceHistoryJobs) {
    globalThis.__enhanceHistoryJobs = new Map();
  }

  // Génération d'un UUID unique
  const jobId = crypto.randomUUID();

  // Stockage du job en mémoire
  globalThis.__enhanceHistoryJobs.set(jobId, {
    tracks: body,
    progress: 0,
    result: null,
  });

  setTimeout(() => {
    const job = globalThis.__enhanceHistoryJobs.get(jobId);
    if (job && job.progress === 0 && job.result === null) {
      globalThis.__enhanceHistoryJobs.delete(jobId);
    }
  }, 30_000);

  return { jobId };
});
