# Upstream pull request review — 2026-10-16

Reviewed all 18 open PRs in zachwinter/kaleidosync against current master `28e3d3d2`. Inspected the head commit changes locally, checked the current dependency tree, and validated the resulting production build. No upstream PR was merged or closed.

| PR | Proposal | Decision for this fork |
| --- | --- | --- |
| [104](https://github.com/zachwinter/kaleidosync/pull/104) | Pre-bundle CJS dependencies | Applied the change: remove `phone`, include `socket.io-client` and `music-metadata`. |
| [92](https://github.com/zachwinter/kaleidosync/pull/92) | minimist 1.2.8 | Already satisfied by the new lockfile. Do not merge the obsolete lockfile. |
| [90](https://github.com/zachwinter/kaleidosync/pull/90) | cacheable-request/nodemon | Obsolete server/development stack; neither is installed. |
| [89](https://github.com/zachwinter/kaleidosync/pull/89) | http-cache-semantics 4.1.1 | Dependency no longer installed. |
| [88](https://github.com/zachwinter/kaleidosync/pull/88) | mongoose 5.13.15 | MongoDB/Mongoose are no longer part of this application. |
| [87](https://github.com/zachwinter/kaleidosync/pull/87) | json5 / Vue CLI | Current app uses Vite; json5 is already 2.2.3. Do not restore Vue CLI. |
| [86](https://github.com/zachwinter/kaleidosync/pull/86) | Express 4.17.3 | Superseded by Express 5.1.0 in the standalone server. |
| [85](https://github.com/zachwinter/kaleidosync/pull/85) | Display every Spotify artist | Already present in the current Sage adapter; retained in the personal Spotify store. |
| [84](https://github.com/zachwinter/kaleidosync/pull/84) | qs 6.5.3 | Superseded by qs 6.16.1 in the new lockfile. |
| [83](https://github.com/zachwinter/kaleidosync/pull/83) | decode-uri-component 0.2.2 | Already satisfied by the new lockfile. |
| [81](https://github.com/zachwinter/kaleidosync/pull/81) | terser 4.8.1 | Old Webpack dependency; not installed. |
| [79](https://github.com/zachwinter/kaleidosync/pull/79) | shell-quote 1.7.3 | Old development dependency; not installed. |
| [78](https://github.com/zachwinter/kaleidosync/pull/78) | eventsource 1.1.1 | Old development dependency; not installed. |
| [77](https://github.com/zachwinter/kaleidosync/pull/77) | Remove profile/email scopes | Applied the intent more narrowly: request only currently-playing and playback-state read scopes. |
| [76](https://github.com/zachwinter/kaleidosync/pull/76) | async 2.6.4 | Old dependency; not installed. |
| [71](https://github.com/zachwinter/kaleidosync/pull/71) | url-parse 1.5.10 | Old dependency; not installed. |
| [69](https://github.com/zachwinter/kaleidosync/pull/69) | follow-redirects 1.14.8 | Superseded by 1.16.1. |
| [57](https://github.com/zachwinter/kaleidosync/pull/57) | axios 0.21.2 | Superseded by axios 1.20.0. |

The old PR branches diverged before the Vue 3/Vite rewrite; wholesale merging would reintroduce obsolete files or downgrade dependencies. Changes were adapted where useful.

Additional deployment fixes: standalone Spotify PKCE login; per-tab tokens; refresh rotation and rate-limit handling; standalone static server; public Audius read adapter; missing file metadata helper; removed dead radio collaboration calls; share current deployment URL; exclude the upstream `.env`; update Vue, Vite, compression, Markdown and WebSocket dependencies. The runtime image contains only the static build and Express/compression/Helmet, excluding Sage's unused wallet/development dependency tree.
