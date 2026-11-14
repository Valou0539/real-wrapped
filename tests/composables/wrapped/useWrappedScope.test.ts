import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const mockLocalePath = vi.hoisted(() => vi.fn((route: unknown) => route));
const mockRoute = vi.hoisted(() => ({ query: {} as Record<string, unknown> }));

mockNuxtImport("useLocalePath", () => () => mockLocalePath);
mockNuxtImport("useRoute", () => () => mockRoute);

describe("useWrappedEntityLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = { month: "3" };
  });

  it("builds a track route with slugged artist and title params", () => {
    const { trackLink } = useWrappedEntityLinks();

    trackLink("Élodie", "Même titre");

    expect(mockLocalePath).toHaveBeenLastCalledWith({
      name: "tracks-artist-name",
      params: { artist: "elodie", name: "meme-titre" },
      query: { month: "3" },
    });
  });

  it("keeps homonymous tracks by different artists on distinct routes", () => {
    const { trackLink } = useWrappedEntityLinks();

    const first = trackLink("Élodie", "Même titre");
    const second = trackLink("OtherArtist", "Même titre");

    expect(first).not.toEqual(second);
    expect(second).toEqual({
      name: "tracks-artist-name",
      params: { artist: "otherartist", name: "meme-titre" },
      query: { month: "3" },
    });
  });

  it("strips slashes and spaces from artist and title params", () => {
    const { trackLink } = useWrappedEntityLinks();

    trackLink("AC/DC", "Back/In Black");

    expect(mockLocalePath).toHaveBeenLastCalledWith({
      name: "tracks-artist-name",
      params: { artist: "ac-dc", name: "back-in-black" },
      query: { month: "3" },
    });
  });

  it("forwards the current month to artist, genre and track routes", () => {
    const { artistLink, genreLink, trackLink } = useWrappedEntityLinks();

    artistLink("Élodie");
    expect(mockLocalePath).toHaveBeenLastCalledWith({
      name: "artists-name",
      params: { name: "elodie" },
      query: { month: "3" },
    });

    genreLink("Pop");
    expect(mockLocalePath).toHaveBeenLastCalledWith({
      name: "genres-name",
      params: { name: "pop" },
      query: { month: "3" },
    });

    trackLink("Élodie", "Même titre");
    expect(mockLocalePath).toHaveBeenLastCalledWith({
      name: "tracks-artist-name",
      params: { artist: "elodie", name: "meme-titre" },
      query: { month: "3" },
    });
  });

  it("omits the month when the route has none", () => {
    mockRoute.query = {};
    const { trackLink } = useWrappedEntityLinks();

    trackLink("Élodie", "Même titre");

    expect(mockLocalePath).toHaveBeenLastCalledWith({
      name: "tracks-artist-name",
      params: { artist: "elodie", name: "meme-titre" },
      query: {},
    });
  });
});
