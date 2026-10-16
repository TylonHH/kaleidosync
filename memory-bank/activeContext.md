# Active Context

## Kaleidosync public deployment — 2026-10-16

The user authorized building and publishing zachwinter/kaleidosync, reviewing all open PRs, and deploying a public site on their CapRover server. Source fork: https://github.com/TylonHH/kaleidosync. Local working branch: `codex/caprover-personal-spotify`; deployment code is pushed to fork `master`. Upstream is unchanged.

Public site: https://kaleidosync.caprover.drrene.de. Each visitor connects their own Spotify Developer Client ID and Spotify account at `/spotify`. The exact callback is `https://kaleidosync.caprover.drrene.de/spotify/callback`. PKCE uses only two playback read scopes. Tokens stay in browser session storage and go directly to Spotify; no shared Spotify secret or server account database exists.

Current application revision: `bf14b2e2f3c7e7788f89245436a4d3b79cd4fb41`. Image: `ghcr.io/tylonhh/kaleidosync@sha256:b923dd97478fba63af67dbdb26c4ef8867c3af416726b66edc1adb27f107a8a2`. Successful workflow: https://github.com/TylonHH/kaleidosync/actions/runs/38949927549. Anonymous pull verified. CapRover app `kaleidosync` uses container port 80, one desired replica, no volumes and no configured Spotify secrets. HTTPS and Force HTTPS are enabled.

All 18 open upstream PRs were reviewed. Adapted #104, retained #85's all-artists behavior, applied #77's reduced-scope intent. The remaining dependency PRs are obsolete or superseded. Decisions: `docs/PR-REVIEW.md`.

Spotify blocks Audio Analysis for new apps; personal Client IDs do not bypass this. The UI explicitly explains that those accounts can show track metadata without beat synchronization. Development Mode requires owner Premium and limits new apps to five users. Local files and microphone input provide browser audio analysis. Real Spotify consent and Audio Analysis require a visitor's actual app/account and remain unverified here.

Production npm dependencies audit clean; full source audit still has 44 findings in upstream build/wallet dependencies (2 low, 31 moderate, 11 high). Runtime image excludes the Sage dependency tree. Browser checks verified rendered visualization, source navigation, sample-file loading and failed callback recovery. Node checks cover PKCE/state/expiry/refresh/rotation/disconnect and Audius adaptation. Only the Kaleidosync service spec changed.

Deployment details and verification: `docs/DEPLOYMENT.md`. Native CapRover MCP `update_app(image_name=...)` reports success but does not deploy an image; use the authenticated Python CaproverAPI `deploy_app` method or the actual deployment endpoint. Existing MCP credentials are protected by Windows DPAPI under the CapRover MCP tool directory. Never print credentials. The native SSL helper has a Context.progress error; verify actual SSL state before retrying.
