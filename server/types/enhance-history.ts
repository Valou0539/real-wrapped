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
