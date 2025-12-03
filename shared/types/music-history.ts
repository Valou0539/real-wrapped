export interface MusicHistoryTrack {
  endTime: string;
  artistName: string;
  trackName: string;
  msPlayed: number;
}

export interface EnhancedMusicHistoryTrack {
  endTime: string;
  trackName: string;
  artistsName: string[];
  msPlayed: number;
  genres: string[];
  cover: string;
}
