import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";

/**
 * Zod resolver for history upload validation
 * Accepted formats: JSON
 */
export const uploadHistoryResolver = zodResolver(
  z.object({
    files: z
      .any()
      .refine(
        (files) => {
          if (!files) return false;
          // Vérifier si c'est un objet FileList-like
          if (typeof files === "object" && "length" in files) {
            return files.length > 0;
          }
          return true;
        },
        {
          message: "music-history.upload.errors.required",
        },
      )
      .refine(
        (files) => {
          if (!files) return true;
          // Convertir en tableau (FileList-like ou File unique)
          const array =
            typeof files === "object" && "length" in files
              ? Array.from(files)
              : [files];
          return array.every((file) => file.type === "application/json");
        },
        {
          message: "music-history.upload.errors.unsupported",
        },
      )
      .refine(
        async (files) => {
          if (!files) return true;

          // Convertir en tableau (FileList-like ou File unique)
          const array =
            typeof files === "object" && "length" in files
              ? Array.from(files)
              : [files];

          for (const file of array) {
            try {
              const text = await file.text();
              const parsed = JSON.parse(text);

              if (!validateMusicHistoryContent(parsed)) {
                return false;
              }
            } catch {
              return false;
            }
          }

          return true;
        },
        {
          message: "music-history.upload.errors.invalid-content",
        },
      ),
  }),
);

const isMusicHistoryTrack = (obj: unknown): boolean => {
  if (!obj || typeof obj !== "object") return false;

  const track = obj as Record<string, unknown>;

  return (
    typeof track.endTime === "string" &&
    typeof track.artistName === "string" &&
    typeof track.trackName === "string" &&
    typeof track.msPlayed === "number"
  );
};

const validateMusicHistoryContent = (content: unknown): boolean => {
  if (!Array.isArray(content)) return false;
  if (content.length === 0) return false;

  return content.every((item) => isMusicHistoryTrack(item));
};
