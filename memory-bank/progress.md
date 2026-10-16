# Progress

## 2026-10-16 — Public Kaleidosync deployment

- Cloned current upstream master `28e3d3d2`, created the public TylonHH fork, and reviewed all 18 open upstream PR head changes and their dependency applicability.
- Added per-visitor Spotify PKCE authorization with Client ID onboarding, strict OAuth state/expiry validation, token refresh/rotation, disconnect and rate-limit handling. All artists are displayed; only two read scopes are requested. Spotify Audio Analysis restrictions are explicit in the UI.
- Replaced the missing external Spotify backend with direct browser OAuth/API calls and a standalone static server. Added a fixed-host public Audius adapter, restored missing file metadata and radio helpers, corrected share URLs, excluded the upstream `.env`, and updated relevant vulnerable frontend/server dependencies.
- Added Docker/captain definitions and a GitHub Actions image workflow. Both automated checks and production build pass. Docker health and browser visualization checks pass. Production npm audit reports zero; source audit retains 44 upstream build/wallet findings.
- Published anonymous-pullable `ghcr.io/tylonhh/kaleidosync:latest` and immutable revision tags. Final code `269d1bcf` fixes callback routing discovered during the public rejected-login check. Final successful workflow: 38950496837.
- Deployed digest `sha256:cca7f868a573a90eb713f6bb89c14584b90b44f86b6d21d128da13c846957610` to CapRover `kaleidosync`. Public HTTPS endpoints return 200, HTTP redirects to HTTPS, and `.env` returns 404. Audius returns 20 trending tracks and playlists. Service comparison shows only Kaleidosync changed.
- Remaining limitation: real Spotify login and privileged Audio Analysis need the visitor's real Spotify app and account. New Spotify apps do not receive Audio Analysis access.
- Final layout verification found the visualizer shell disables document scrolling. Added a readable setup panel with native scrolling; verified the final instructions are reachable at a 720px viewport height. Temporary local test container was removed.
