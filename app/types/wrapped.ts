export interface TopDate {
  day: string;
  msPlayed: number;
}

export interface TopTrack {
  trackName: string;
  artistName: string;
  msPlayed: number;
  playCount: number;
  firstPlayDate: string;
  cover: string;
}

export interface TopArtist {
  artistName: string;
  msPlayed: number;
  playCount: number;
  mostPlayedTrack: string;
  firstPlayDate: string;
}

export interface TopGenre {
  genreName: string;
  mostPlayedArtist: string;
  msPlayed: number;
  playCount: number;
}

export interface Slide {
  slug: string;
  duration: number;
}
