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
  /**
   * Spotify track id resolved at import for collab-hint tracks (used to build
   * playlists without re-searching). Absent on unresolved or plain tracks.
   */
  spotifyTrackId?: string;
  /** Legacy archive field, not emitted by new imports. */
  cover?: string;
}
