export interface LastfmTrack {
  track?: {
    duration: string;
    listeners: string;
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
