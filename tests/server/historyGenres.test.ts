// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createGenreLookup } from "../../server/services/enhance-history/genres.service";

const track = (artistName: string, trackName: string) => ({
  endTime: "2024-01-01 10:00",
  artistName,
  trackName,
  msPlayed: 1000,
});

const catalog = JSON.stringify({
  Artist: {
    genres: ["indie", "indie", " pop "],
    tracks: { Song: ["dream pop"], Silent: [] },
  },
  Quiet: { genres: [] },
  Empty: {},
});

describe("createGenreLookup", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses artist genres and deduplicates", () => {
    const lookup = createGenreLookup(catalog);
    expect(lookup(track("Artist", "Other"))).toEqual(["indie", "pop"]);
  });

  it("prefers track genres over artist genres", () => {
    expect(createGenreLookup(catalog)(track("Artist", "Song"))).toEqual([
      "dream pop",
    ]);
  });

  it("honors an explicit empty track override", () => {
    expect(createGenreLookup(catalog)(track("Artist", "Silent"))).toEqual([]);
  });

  it("honors an explicit empty artist opt-out", () => {
    const lookup = createGenreLookup(catalog);
    expect(lookup(track("Quiet", "Song"))).toEqual([]);
    expect(lookup(track("Quiet", "Other"))).toEqual([]);
  });

  it("returns undefined for unknown artists and tracks", () => {
    const lookup = createGenreLookup(catalog);
    expect(lookup(track("Unknown", "Song"))).toBeUndefined();
    expect(lookup(track("constructor", "Song"))).toBeUndefined();
  });

  it("does not treat inherited keys as track overrides", () => {
    expect(createGenreLookup(catalog)(track("Artist", "toString"))).toEqual([
      "indie",
      "pop",
    ]);
  });

  it("returns undefined when the artist entry has no genres at all", () => {
    const lookup = createGenreLookup(catalog);
    expect(lookup(track("Empty", "Song"))).toBeUndefined();
  });

  it("returns undefined without configuration", () => {
    expect(createGenreLookup("  ")(track("Artist", "Song"))).toBeUndefined();
    expect(createGenreLookup("")(track("Artist", "Song"))).toBeUndefined();
  });

  it("warns and returns undefined for invalid configuration", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      createGenreLookup("{nope")(track("Artist", "Song")),
    ).toBeUndefined();
    expect(
      createGenreLookup('{"Artist":{"genres":[""]}}')(track("Artist", "Song")),
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
