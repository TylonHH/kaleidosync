import test from "node:test";
import assert from "node:assert/strict";
import { audiusData } from "../audius.js";
test("Audius adapter confines requests to the public API and unwraps responses", async () => {
  const paths = [];
  globalThis.fetch = async url => {
    assert.equal(new URL(url).origin, "https://api.audius.co");
    paths.push(new URL(url));
    return Response.json({ data: [{ id: "track" }] });
  };
  assert.equal(await audiusData("unknown", ""), null);
  assert.deepEqual(await audiusData("search", "../../?token=secret"), [{ id: "track" }]);
  assert.equal(paths[0].searchParams.get("query"), "../../?token=secret");
  assert.equal(paths[0].searchParams.get("token"), null);
  const trending = await audiusData("trending");
  assert.equal(trending.tracks.week[0].id, "track");
  assert.equal(trending.playlists.week[0].id, "track");
  const playlist = await audiusData("playlists", "playlist-id");
  assert.equal(playlist.tracks[0].id, "track");
  const stream = await audiusData("stream", "track-id");
  assert.equal(stream.url, "https://api.audius.co/v1/tracks/track-id/stream?app_name=Kaleidosync");
});
