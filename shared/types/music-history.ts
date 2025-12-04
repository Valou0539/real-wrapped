export interface MusicHistoryTrack {
  endTime: string;
  artistName: string;
  trackName: string;
  msPlayed: number;
}

export interface EnhancedMusicHistoryTrack extends MusicHistoryTrack {
  genres: string[];
  cover: string;
}
