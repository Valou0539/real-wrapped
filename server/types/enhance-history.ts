export interface LastfmTrack {
  track?: {
    album: {
      image: {
        size: string;
        "#text": string;
      }[];
    };
    toptags: {
      tag: {
        name: string;
      }[];
    };
  };
}

export interface MusicBrainzResponse {
  recordings: {
    id: string;
    tags?: {
      name: string;
    }[];
  }[];
}
