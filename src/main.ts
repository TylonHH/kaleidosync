import { createApp } from "@wearesage/vue";
import * as generatedRoutes from "./routes.generated";
import App from "./App.vue";
import { finishLogin } from "./spotify-auth.mjs";

async function initializeApp() {
  if (location.pathname === "/spotify/callback") {
    try {
      await finishLogin();
      history.replaceState({}, "", "/visualizer");
    } catch (error) {
      sessionStorage.setItem("kaleidosync.spotify.error", (error as Error).message);
      history.replaceState({}, "", "/spotify");
    }
  }
  const { app, router, pinia } = await createApp(App, { routes: generatedRoutes });

  return { app, router, pinia };
}

initializeApp().catch(console.error);
