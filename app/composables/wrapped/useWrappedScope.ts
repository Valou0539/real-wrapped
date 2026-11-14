const parseMonth = (value: unknown): number | "all" => {
  const month = Number(value);

  return Number.isInteger(month) && month >= 1 && month <= 12
    ? month - 1
    : "all";
};

export const useWrappedMonth = () => {
  const route = useRoute();

  return computed<number | "all">(() => parseMonth(route.query.month));
};

export const useWrappedEntityLinks = () => {
  const route = useRoute();
  const localePath = useLocalePath();

  const artistLink = (name: string) =>
    localePath({
      name: "artists-name",
      params: { name: wrappedEntitySlug(name) },
      query: { month: route.query.month },
    });

  const genreLink = (name: string) =>
    localePath({
      name: "genres-name",
      params: { name: wrappedEntitySlug(name) },
      query: { month: route.query.month },
    });

  const trackLink = (artistName: string, trackName: string) =>
    localePath({
      name: "tracks-artist-name",
      params: {
        artist: wrappedEntitySlug(artistName),
        name: wrappedEntitySlug(trackName),
      },
      query: { month: route.query.month },
    });

  return { artistLink, genreLink, trackLink };
};
