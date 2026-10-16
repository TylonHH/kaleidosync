const SESSION = "kaleidosync.spotify";
const PENDING = "kaleidosync.spotify.pkce";
export const callbackUrl = () => `${location.origin}/spotify/callback`;
export const readSession = () => JSON.parse(sessionStorage.getItem(SESSION) || "null");
export const disconnect = () => {
  sessionStorage.removeItem(SESSION);
  sessionStorage.removeItem(PENDING);
};

export async function beginLogin(clientId) {
  clientId = clientId.trim();
  if (!/^[a-f0-9]{32}$/i.test(clientId)) throw new Error("Enter a valid 32-character Spotify Client ID.");
  const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join("");
  const verifier = random();
  const state = random();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  sessionStorage.setItem(PENDING, JSON.stringify({ clientId, verifier, state, created: Date.now() }));
  localStorage.setItem("kaleidosync.spotify.clientId", clientId);
  const params = new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: callbackUrl(),
    scope: "user-read-currently-playing user-read-playback-state", state, code_challenge_method: "S256", code_challenge: challenge });
  location.assign(`https://accounts.spotify.com/authorize?${params}`);
}

async function exchange(params) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params)
  });
  const data = await response.json();
  if (!response.ok || !data.access_token || !Number.isFinite(data.expires_in)) {
    throw new Error("Spotify could not authorize this app. Check your Client ID, redirect URI, Premium subscription and app access.");
  }
  return data;
}

export async function finishLogin(search = location.search) {
  const params = new URLSearchParams(search);
  const pending = JSON.parse(sessionStorage.getItem(PENDING) || "null");
  sessionStorage.removeItem(PENDING);
  if (!pending || params.get("state") !== pending.state || Date.now() - pending.created > 600000) {
    throw new Error("Spotify login expired or failed its security check. Please connect again.");
  }
  if (params.has("error")) throw new Error("Spotify login was cancelled. You can connect again or use another audio source.");
  if (!params.get("code")) throw new Error("Spotify did not return an authorization code.");
  const data = await exchange({ grant_type: "authorization_code", code: params.get("code"),
    client_id: pending.clientId, redirect_uri: callbackUrl(), code_verifier: pending.verifier });
  if (!data.refresh_token) throw new Error("Spotify did not return a refresh token. Please connect again.");
  sessionStorage.setItem(SESSION, JSON.stringify({ clientId: pending.clientId, accessToken: data.access_token,
    refreshToken: data.refresh_token, expires: Date.now() + data.expires_in * 1000 }));
}

let refreshing;
export async function getAccessToken(force = false) {
  const session = readSession();
  if (!session) throw new Error("Connect your Spotify app first.");
  if (!force && session.expires > Date.now() + 60000) return session.accessToken;
  if (!refreshing) refreshing = (async () => {
    try {
      const data = await exchange({ grant_type: "refresh_token", refresh_token: session.refreshToken, client_id: session.clientId });
      const next = { ...session, accessToken: data.access_token, refreshToken: data.refresh_token || session.refreshToken,
        expires: Date.now() + data.expires_in * 1000 };
      // Do not restore a session disconnected while a refresh was in flight.
      if (readSession()?.refreshToken !== session.refreshToken) throw new Error("Spotify session was disconnected.");
      sessionStorage.setItem(SESSION, JSON.stringify(next));
      return next.accessToken;
    } catch (error) {
      disconnect();
      throw error;
    } finally { refreshing = undefined; }
  })();
  return refreshing;
}

export async function spotifyRequest(path) {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid Spotify API path.");
  const request = async token => fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000)
  });
  let response = await request(await getAccessToken());
  if (response.status === 401) response = await request(await getAccessToken(true));
  return response;
}
