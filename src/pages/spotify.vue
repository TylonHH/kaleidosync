<template>
  <main class="spotify-setup">
    <a href="/visualizer">← Visualizer</a>
    <h1>Your Spotify. Your app.</h1>
    <p>Connect your own Spotify account using your own Spotify Developer app.</p>
    <ol>
      <li>Open the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer">Spotify Developer Dashboard</a> and create an app with Web API access.</li>
      <li>Add this exact Redirect URI, then save: <code>{{ redirectUri }}</code> <button type="button" @click="copyRedirect">{{ copied ? 'Copied' : 'Copy' }}</button></li>
      <li>Paste the app's Client ID below. You never need to enter your client secret here.</li>
    </ol>
    <form @submit.prevent="connect">
      <label for="spotify-client-id">Spotify Client ID</label>
      <input id="spotify-client-id" v-model="clientId" required pattern="[a-fA-F0-9]{32}" maxlength="32" autocomplete="off" spellcheck="false" placeholder="32-character Client ID" />
      <button :disabled="busy">{{ busy ? 'Connecting…' : 'Connect Spotify' }}</button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="connected">Spotify session connected in this tab. <a href="/visualizer">Open visualizer</a></p>
    <button v-if="connected" type="button" @click="logout">Disconnect Spotify</button>
    <aside>
      <h2>Spotify access requirements</h2>
      <p>Development Mode requires the app owner to have Spotify Premium. Other listeners must be allowed in that app's dashboard.</p>
      <p>Spotify blocks Audio Analysis for new apps. Login and track information can work, but beat synchronization requires an app with existing Audio Analysis access. Microphone and local audio files provide real-time audio visualization without Spotify API access.</p>
      <p>Only your Client ID is remembered on this device. Login tokens stay in this tab's session storage and go directly to Spotify. Disconnect clears them. This site does not store your Spotify credentials on its server.</p>
      <a href="https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api" target="_blank" rel="noopener noreferrer">Spotify's Audio Analysis restrictions</a>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { beginLogin, callbackUrl, disconnect, readSession } from "../spotify-auth.mjs";
const redirectUri = callbackUrl();
const clientId = ref(localStorage.getItem("kaleidosync.spotify.clientId") || "");
const connected = ref(!!readSession());
const error = ref(sessionStorage.getItem("kaleidosync.spotify.error") || "");
sessionStorage.removeItem("kaleidosync.spotify.error");
const busy = ref(false);
const copied = ref(false);
async function connect() {
  busy.value = true;
  error.value = "";
  try { await beginLogin(clientId.value); }
  catch (e) { error.value = (e as Error).message; busy.value = false; }
}
async function copyRedirect() {
  try { await navigator.clipboard.writeText(redirectUri); copied.value = true; }
  catch { error.value = "Select and copy the Redirect URI above."; }
}
function logout() { disconnect(); location.assign("/spotify"); }
</script>

<style scoped>
.spotify-setup { position: fixed; inset: 1rem; z-index: 20; width: calc(100% - 2rem); max-width: 52rem; margin: 0 auto; padding: 2rem; box-sizing: border-box; overflow: auto; background: #111; color: #fff; border-radius: 1.5rem; font-family: system-ui, sans-serif; line-height: 1.6; overflow-wrap: anywhere; }
h1 { font: 650 clamp(1.8rem, 5vw, 3rem)/1.2 system-ui, sans-serif; text-transform: none; letter-spacing: normal; margin: 1rem 0; }
h2 { font: 600 1.2rem/1.3 system-ui, sans-serif; text-transform: none; letter-spacing: normal; }
p, ol, aside { margin: 1rem 0; }
ol { padding-left: 1.5rem; }
a { display: inline; color: #82efb2; text-decoration: underline; }
li { display: list-item; margin: .5rem 0; }
code { user-select: all; font-size: .9rem; }
form { display: grid; gap: .75rem; }
input { width: 100%; box-sizing: border-box; background: #222; color: #fff; border: 1px solid #888; border-radius: .5rem; padding: .9rem; font: inherit; }
button { background: #a5f5c5; color: #102116; border: 0; border-radius: 1.5rem; padding: .7rem 1.2rem; cursor: pointer; font: inherit; }
button:disabled { opacity: .6; }
:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
@media (max-width: 600px) { .spotify-setup { inset: .5rem; width: calc(100% - 1rem); padding: 1.25rem; } }
</style>
