import type { EnhancedMusicHistoryTrack } from "../../shared/types/music-history";
import type { TopArtist, TopGenre, TopTrack } from "./wrapped";

export type RankedTrack = TopTrack & { rank: number };
export type RankedArtist = TopArtist & { rank: number };
export type RankedGenre = TopGenre & { rank: number };
export type WrappedDetailTrack = RankedTrack & { overallRank: number };

export interface WrappedSearchSelection {
  type: "track" | "artist" | "genre";
  key: string;
}

export interface WrappedSearchEntry extends WrappedSearchSelection {
  name: string;
  subtitle?: string;
  artists?: string[];
  spotifyTrackId?: string;
  rank: number;
  msPlayed: number;
  playCount: number;
  firstPlayDate?: string;
}

export interface WrappedSearchIndex {
  history: EnhancedMusicHistoryTrack[];
  tracks: RankedTrack[];
  artists: RankedArtist[];
  genres: RankedGenre[];
  entries: WrappedSearchEntry[];
}
