import { defineConfig } from "vite";
import { createSageConfig } from "@wearesage/vue/vite";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config();

// Pure magic - one function call!
export default defineConfig(async () => {
  const baseConfig = await createSageConfig({
    router: true
  });

  // Fix dayjs ES module issue from AppKit - merge configs properly
  return {
    ...baseConfig,
    plugins: [
      ...(baseConfig.plugins || []),
      {
        name: "personal-spotify",
        enforce: "pre",
        resolveId(source, importer) {
          if (importer?.replaceAll("\\", "/").includes("/@wearesage/vue/src/") &&
              (source === "./spotify" || source === "../stores/spotify")) {
            return fileURLToPath(new URL("./src/spotify.ts", import.meta.url));
          }
        },
        transform(code, id) {
          if (id.replaceAll("\\", "/").endsWith("/@wearesage/vue/src/stores/audio.ts")) {
            return code.replace('const trackId = audioUrl.replace("audius-stream:", "");', `const trackId = audioUrl.replace("audius-stream:", "");
              setSource("https://api.audius.co/v1/tracks/" + encodeURIComponent(trackId) + "/stream?app_name=Kaleidosync");
              await updateMediaSessionMetadata(track);`);
          }
          // The published source store still calls helpers removed from Sage.
          if (id.replaceAll("\\", "/").endsWith("/@wearesage/vue/src/stores/sources.ts")) {
            return code
              .replace("await joinRadioParadiseSpace(radioParadiseStation.value);", "")
              .replace("await leaveRadioParadiseSpace();", "")
              .replace("const metadata = await extractFileMetadata(file);", `const metadata = await import("music-metadata").then(async ({ parseBlob }) => {
                try {
                  const { common, format } = await parseBlob(file);
                  return { title: common.title, artist: common.artist, album: common.album, duration: (format.duration || 0) * 1000 };
                } catch { return {}; }
              });`);
          }
        }
      }
    ],
    define: { "import.meta.env.VITE_API": JSON.stringify("") },
    build: { ...baseConfig.build, sourcemap: false },
    optimizeDeps: {
      ...baseConfig.optimizeDeps,
      include: [...(baseConfig.optimizeDeps?.include || []).filter(dep => dep !== "phone"),
        "dayjs", "dayjs/locale/en", "dayjs/esm/locale/en", "socket.io-client", "music-metadata"]
    }
  };
});
