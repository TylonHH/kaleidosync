# Progress

## 2026-10-16 — Public Kaleidosync deployment

- Cloned current upstream master `28e3d3d2`, created the public TylonHH fork, and reviewed all 18 open upstream PR head changes and their dependency applicability.
- Added per-visitor Spotify PKCE authorization with Client ID onboarding, strict OAuth state/expiry validation, token refresh/rotation, disconnect and rate-limit handling. All artists are displayed; only two read scopes are requested. Spotify Audio Analysis restrictions are explicit in the UI.
- Replaced the missing external Spotify backend with direct browser OAuth/API calls and a standalone static server. Added a fixed-host public Audius adapter, restored missing file metadata and radio helpers, corrected share URLs, excluded the upstream `.env`, and updated relevant vulnerable frontend/server dependencies.
- Added Docker/captain definitions and a GitHub Actions image workflow. Both automated checks and production build pass. Docker health and browser visualization checks pass. Production npm audit reports zero; source audit retains 44 upstream build/wallet findings.
- Published anonymous-pullable `ghcr.io/tylonhh/kaleidosync:latest` and immutable revision tags. Final code `bf14b2e2` fixes callback routing discovered during the public rejected-login check. Final successful workflow: 38949927549.
- Deployed digest `sha256:b923dd97478fba63af67dbdb26c4ef8867c3af416726b66edc1adb27f107a8a2` to CapRover `kaleidosync`. Public HTTPS endpoints return 200, HTTP redirects to HTTPS, and `.env` returns 404. Audius returns 20 trending tracks and playlists. Service comparison shows only Kaleidosync changed.
- Remaining limitation: real Spotify login and privileged Audio Analysis need the visitor's real Spotify app and account. New Spotify apps do not receive Audio Analysis access.
