export interface MusicHistoryTrack {
  endTime: string;
  artistName: string;
  trackName: string;
  msPlayed: number;
}

export interface EnhancedMusicHistoryTrack extends MusicHistoryTrack {
  genres: string[];
  /**
   * Full credited artist list resolved from Spotify at import, present only
   * when resolution succeeded. Absent means legacy/unknown: consumers fall
   * back to `[artistName]`.
   */
  artists?: string[];
  /** Legacy archive field, not emitted by new imports. */
  cover?: string;
}
