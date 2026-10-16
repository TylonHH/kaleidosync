# CapRover deployment

- Public URL: https://kaleidosync.caprover.drrene.de
- Spotify setup: https://kaleidosync.caprover.drrene.de/spotify
- Exact Spotify Redirect URI: `https://kaleidosync.caprover.drrene.de/spotify/callback`
- Image: `ghcr.io/tylonhh/kaleidosync:latest`; each build also publishes `sha-<full Git commit>`.
- CapRover app: `kaleidosync`, HTTP container port `80`, one instance, no persistent volumes and no Spotify server secrets.
- Health endpoint: `/healthz`.
- Docker image builds for Linux amd64 by default. The workflow runs tests before publishing.

## Verified release — 2026-10-16

- Application revision: `269d1bcfd8cf1995ea2ea82cf5580bb67f1735e2`.
- Deployed image: `ghcr.io/tylonhh/kaleidosync@sha256:cca7f868a573a90eb713f6bb89c14584b90b44f86b6d21d128da13c846957610`.
- Successful image workflow: https://github.com/TylonHH/kaleidosync/actions/runs/38950496837.
- Anonymous GHCR pull is verified. CapRover uses the immutable digest. HTTPS and Force HTTPS are enabled.
- Public homepage, visualizer, Spotify form, rejected OAuth callback and health endpoint are verified. `.env` returns 404. The Audius adapter returns 20 tracks and 20 playlists.
- Production server npm audit: zero findings. Full source audit: 44 findings (2 low, 31 moderate, 11 high, 0 critical), primarily in upstream wallet/build dependencies. See the limits below.
- The setup page has its own scroll container because the visualizer shell disables document scrolling. Browser checks confirmed the final instructions remain reachable at a 720px viewport height.
- Service-spec comparison identifies only `srv-captain--kaleidosync` as changed.
- Initial release `a922a111` / `sha256:d24a867f7177b1d6acfa7618510ca8d8062b6d67dddd4c434a646b4c1ccd155c` is retained as an image, but has a callback routing bug; prefer the verified release above.

## Listener setup

Open `/spotify`, create a Spotify Developer app with Web API access, add the exact Redirect URI above, paste that app's Client ID, and choose Connect Spotify. Spotify handles account login and consent. Never enter a client secret into this site.

Each browser supplies its own Client ID. Client IDs are remembered locally; access/refresh tokens remain in that tab's session storage and are sent directly to Spotify. Disconnect clears the session. The server has no shared Spotify account, user database or credential store. This is Spotify OAuth login, not a separate website account system.

Spotify Development Mode requires the app owner to have Premium and currently limits new apps to five authorized users. New apps cannot access Audio Analysis. With those apps, the site can display the current track while the visuals animate without beat synchronization. Existing apps with authorized Audio Analysis access can use the beat/segment data. Microphone and local file sources analyze audio in the browser. A personal Client ID does not bypass Spotify's endpoint restrictions.

References: [Spotify PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow), [2026 limits](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide), [Audio Analysis restrictions](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api).

## Rebuild and deploy

Run `npm ci --ignore-scripts`, `npm test`, then `npm run build`. Push to master or `codex/caprover-personal-spotify` to publish through GitHub Actions. Alternatively run `docker build -t kaleidosync .` locally. CapRover can build the repository using `captain-definition` or deploy the published image. Set the container HTTP port to 80 and enable HTTPS/Force HTTPS for the default domain.

Deploy an immutable image digest when possible. To roll back, deploy a previously verified digest. There is no database migration or persisted application state.

## Verification limits

Automated tests cover OAuth state, PKCE challenge, expiry, token refresh/rotation, disconnect and Audius response adaptation. Browser checks cover the rendered visualizer, Spotify form, source navigation and sample-file loading. A real Spotify login and Audio Analysis response require a listener's own Spotify app and account; these cannot be verified with placeholder credentials.

OAuth callback redirects use Sage's router so its reactive route state remains synchronized with the address bar. A cancelled or invalid callback must show the setup error, never a 404 page.

Sage still brings unused wallet and development dependencies with outstanding npm advisories into the build stage. They are absent from the production server dependency tree. The production bundle is tree-shaken; this does not establish that every upstream frontend advisory is unreachable. Review future upstream updates before upgrading the Sage package. Do not describe the full source dependency audit as clean.
