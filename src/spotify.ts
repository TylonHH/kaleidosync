import { computed, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";
import { useEchoNest } from "@wearesage/vue/composables/audio/useEchoNest";
import { useQueue } from "@wearesage/vue/stores/queue";
import { AudioSource } from "@wearesage/shared";
import { readSession, spotifyRequest } from "./spotify-auth.mjs";

export const useSpotify = defineStore("spotify", () => {
  const analysisData = shallowRef<any>(null);
  const echo = useEchoNest(analysisData);
  const queue = useQueue();
  const accessToken = ref(readSession()?.accessToken || null);
  const status = ref("");
  const analysisUnavailable = ref(false);
  let timer: ReturnType<typeof setTimeout>;
  let generation = 0;
  let analysisId = "";
  let audioAnalysis: any = null;

  watch(echo.track, track => {
    if (!track) return;
    queue.setQueue([{ id: `spotify:${track.id}`, source: AudioSource.SPOTIFY, sourceId: track.id,
      title: track.name, artist: track.artists?.map((a: any) => a.name).join(", ") || "Unknown artist",
      album: track.album?.name, duration: track.duration_ms,
      artwork: { large: track.album?.images?.[0]?.url }, rawData: track }], 0);
    queue.queue.isPlaying = echo.playing.value;
  });

  async function poll(current: number) {
    let delay = 5000;
    try {
      const response = await spotifyRequest("/me/player/currently-playing");
      if (current !== generation) return;
      if (response.status === 429) {
        delay = Math.max(5000, Number(response.headers.get("Retry-After") || 30) * 1000);
        status.value = "Spotify rate limit reached. Retrying shortly.";
        return;
      }
      if (response.status === 204) {
        analysisData.value = null;
        status.value = "Start a track in your Spotify app.";
        return;
      }
      if (!response.ok) throw new Error(response.status === 403
        ? "Spotify denied access. Check Premium and your app's authorized users."
        : "Spotify is unavailable. Reconnect if this continues.");
      const state = await response.json();
      if (!state.item || state.currently_playing_type !== "track") {
        analysisData.value = null;
        status.value = "Play a music track in Spotify.";
        return;
      }
      if (analysisId !== state.item.id) {
        audioAnalysis = null;
        analysisId = state.item.id;
        if (!analysisUnavailable.value) {
          const analysis = await spotifyRequest(`/audio-analysis/${encodeURIComponent(state.item.id)}`);
          if (analysis.ok) audioAnalysis = await analysis.json();
          else if (analysis.status === 403 || analysis.status === 404) analysisUnavailable.value = true;
        }
      }
      if (current !== generation) return;
      analysisData.value = { isPlaying: state.is_playing,
        track: { item: state.item, timestamp: Date.now() - state.progress_ms },
        audioAnalysis: audioAnalysis || { beats: [], segments: [] } };
      status.value = analysisUnavailable.value
        ? "Spotify connected. This app cannot access Audio Analysis; visuals animate without beat synchronization. Use microphone or files for audio-reactive visuals."
        : state.is_playing ? "" : "Spotify is paused.";
    } catch (error) {
      if (current === generation) status.value = (error as Error).message;
    } finally {
      if (current === generation) timer = setTimeout(() => poll(current), delay);
    }
  }

  function reset() {
    generation++;
    clearTimeout(timer);
    analysisData.value = null;
  }
  function initialize() {
    reset();
    accessToken.value = readSession()?.accessToken || null;
    if (accessToken.value) void poll(generation);
  }
  function getSpotifyTokens() { location.assign("/spotify"); }
  return { ...echo, analysisData, accessToken, status, analysisUnavailable, initialize, reset, getSpotifyTokens };
});
