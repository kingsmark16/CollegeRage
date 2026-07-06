# Memory - Dropbox Storage Overview Dashboard

Last updated: 2026-07-06 18:40 Asia/Manila

## What was built

- Added `recharts` to the client dependencies for shadcn-style dashboard charts.
- Added a backend dashboard overview API at `GET /api/v1/dashboard/overview`, protected by `requireAuth`.
- Added server dashboard files under `server/src/modules/dashboard/` for controller, service, repository, and response types.
- Extended `server/src/services/dropbox.service.ts` with `getDropboxSpaceUsage()` using Dropbox `usersGetSpaceUsage()`.
- Dashboard overview returns Dropbox account quota/usage plus app-tracked media storage metrics from the database.
- Media storage metrics include images, generated video variants plus thumbnails, and music tracks.
- Added `client/src/components/ui/chart.tsx` as a local shadcn-style wrapper around Recharts.
- Added frontend dashboard service/types/hook under `client/src/services/dashboard.service.ts` and `client/src/features/dashboard/`.
- Updated `client/src/features/admin/pages/OverviewPage.tsx` to render live Dropbox storage usage, media totals, and a media-by-type radar chart inside the Dropbox storage container.
- The three media breakdown metric tiles under the radar chart are currently restored.
- Updated `ui-registry.md` with the radar-only Admin Overview Metrics pattern.
- Fixed Dropbox quota failure caused by missing `account_info.read` scope: new Dropbox OAuth connections now request the scope, and old tokens return a reconnect-needed overview state instead of a 502.

## Decisions made

- Dropbox "memory storage" is treated as Dropbox account storage usage/quota.
- App media analytics are calculated from database-backed Dropbox assets rather than scanning Dropbox folders.
- Video storage analytics count generated video variants and thumbnails, because those are the files actually stored in Dropbox for uploaded videos.
- Missing Dropbox quota permission should not crash the overview page; the UI should continue showing database media metrics and prompt reconnect.
- The overview should use one shadcn-style radar chart with dots for media type distribution, embedded inside the Dropbox storage panel.

## Problems solved

- The overview page previously had placeholder cards only; it now has a real metrics surface.
- The backend provides one focused dashboard endpoint instead of making the frontend combine media/music/Dropbox requests.
- Recharts strict TypeScript issues were fixed in the local chart wrapper.
- Existing Dropbox tokens created before `account_info.read` no longer cause repeated retry logs and a dashboard 502.
- The overview no longer has a separate media storage panel competing with the Dropbox storage section.

## Current state

- `npm run build` passes in both `server` and `client`; the most recent client build passed after restoring the breakdown tiles.
- `client/package.json` and `client/package-lock.json` include `recharts`.
- The overview dashboard depends on a valid stored Dropbox credential for quota data.
- If Dropbox is connected with an older token missing `account_info.read`, the overview marks Dropbox as requiring reconnect.
- Vite still warns about large client chunks after adding Recharts; this is a build warning, not a failure.

## Next session starts with

- Reconnect Dropbox through the app so the stored credential includes `account_info.read`.
- Run the app and visually inspect `/admin` or `/admin/overview` with real media/music records and a connected Dropbox account.

## Open questions

- Whether to add a deeper analytics page for per-file Dropbox/media trends over time.
- Whether Dropbox storage should show total account quota only or also an app-folder-only estimate from stored app assets.
