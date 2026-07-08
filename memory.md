# Memory - Landing Dome Gallery Integration

Last updated: 2026-07-08 01:31 Asia/Manila

## What was built

- Added `client/src/features/home/components/DomeGallery.tsx` from the React Bits TypeScript/Tailwind source and cleaned it for the repo lint rules.
- Recreated `client/src/features/home/pages/HomePage.tsx` as a media-first landing page using the DomeGallery.
- The landing page fetches public media through `usePublicMediaGallery`, filters the dome input to image media only, and ignores videos/video thumbnails.
- The gallery is rendered with tuned props: `fit={0.78}`, `fitBasis="max"`, `minRadius={300}`, `maxRadius={800}`, `padFactor={0}`, `maxPad={0}`, `verticalStageOffset="-8%"`, `maxVerticalRotationDeg={4}`, `segments={24}`, `dragDampening={1.4}`, and `grayscale={false}`.
- DomeGallery now normalizes the incoming image list by URL, removes duplicates, renders each unique image exactly once, grows its column count when needed so all unique images have a coordinate slot, and uses eager tile loading plus a controlled image preloader.
- Added continuous image recovery in DomeGallery: failed active DOM tile images remount/retry forever with capped backoff and no terminal timeout.
- Optimized large-gallery loading for around 280 images by switching from eager-loading every tile at once to progressive activation: all dome slots render immediately as lightweight placeholders, the first 40 image URLs activate first, and 8 additional image URLs activate every 180ms until all images are requested.
- Made DomeGallery density dynamic: it now computes rows per column from image count, computes the minimum required column count, uses that column count as the effective segment count, and centers generated column offsets so every unique image receives a slot without requiring a hardcoded landing-page `segments` prop.
- Tuned dynamic density to prioritize per-column capacity by adding two rows to each image-count tier: rows per column now scale 6, 7, 8, 9 instead of 4, 5, 6, 7. For image counts above 60, effective segments now reduce to the required `ceil(imageCount / rowsPerColumn)` instead of being held at the default preferred segment count.
- Removed the large hero text/CTA block from the landing page so the gallery remains the main experience.
- Moved the header into normal document flow above the gallery so it no longer covers the dome; the dome now lives in a `flex-1 basis-0` stage below the header.
- Made the section use `h-dvh min-h-screen` so the gallery stage has a definite height for DomeGallery measurement.
- Added responsive DomeGallery sizing controls: `maxPad`, `verticalStageOffset`, mobile-aware radius fitting, capped viewer padding support, and a mobile stage offset.
- Made the header brighter by using a near-solid `bg-[#101212]/95` surface and stronger button backgrounds.
- Changed DomeGallery opened/closing media images to `object-fit: contain` and resized the opened overlay to the image's natural aspect ratio.
- Removed opened-view padding by using `padFactor={0}`, `maxPad={0}`, and a full-size viewer frame instead of a square padded frame.
- Updated `ui-registry.md` with the current `Public Landing Dome Gallery` pattern, including the no-padding, full-aspect opened-media rule.

## Decisions made

- Public media loading reuses the existing `/api/v1/media` read endpoint and `getPublicMedia` service export instead of adding a new API.
- DomeGallery remains image-source based, and public landing input is image-only; video records should not appear in the dome as videos or thumbnails.
- Unique image URLs should render once in the public dome. Do not repeat media to fill the sphere.
- Do not use browser-native lazy loading for dome thumbnails; transformed 3D placement can leave images deferred. Prefer progressive source activation plus capped retry, so the browser is not asked to fetch/decode hundreds of Dropbox images at once.
- Thumbnail tiles should stay `object-fit: cover` for consistent card-like tiles.
- Opened media should use an aspect-fitted overlay that matches the image's natural ratio, with `object-fit: contain`, so users see the full image without a square backing area around it.
- The header should be a normal top bar above the gallery, not a full-page overlay, so it does not block or visually cover gallery interaction.
- The gallery section needs a definite viewport height (`h-dvh`) because DomeGallery relies on container measurement and its internal content is mostly absolutely positioned.
- Responsive sizing should be solved in DomeGallery's measurement logic, not with page-only breakpoint hacks.
- Gallery tile and opened-image radius were set to `8px` to align better with the app's existing squared visual system than the React Bits default `30px`.
- Dome tuning currently favors a large, steady medium-screen view: increased fit, fewer segments, and low vertical rotation.
- Dome columns and effective segments should be derived inside `DomeGallery` from unique image count. The landing page should not hardcode `segments` for the public dome unless a future feature deliberately needs a fixed density.
- The current preferred density rule is column-capacity first: increasing rows per column is expected to subtract/reduce the resulting segment count while still maintaining enough slots for every unique image.

## Problems solved

- `HomePage.tsx` and `ui-registry.md` were deleted in the worktree; both were restored/recreated as part of the integration.
- PowerShell blocked `npm.ps1`, so checks were run with `npm.cmd`.
- React Bits pasted source had lint issues (`any`, `console.warn`, `performance.now`/`Date.now` purity in the gesture callback, and custom CSS property typing); these were cleaned up.
- The landing overlay previously made DomeGallery feel like a non-interactive background; pointer-event layering and then header layout were adjusted so the dome can be dragged/clicked.
- After moving the header into normal flow, the gallery disappeared because the flex child did not have a definite measured height; fixed by using `h-dvh min-h-screen` on the section and `flex-1 basis-0` on the gallery stage.
- On smaller screens, the dome became too small with excessive top/bottom empty space; fixed with `fitBasis="max"`, responsive radius logic, and a small upward mobile stage offset.
- Clicked images were first cropped, then showed full aspect ratio inside a square padded box; fixed by making the overlay itself aspect-fit to the image and removing opened-view padding.
- Some dome images did not load reliably because native lazy loading is not dependable inside the transformed sphere; fixed by progressively activating tile image URLs and adding continuous DOM retry behavior.
- Loading 280 images was slow when every tile used an eager `src`; fixed by rendering placeholders first and activating real image URLs in timed batches.
- The dome previously relied on a fixed `segments` prop from `HomePage`; fixed by moving density calculation into `DomeGallery` so added images adjust columns/segments automatically.
- Dynamic layout originally kept large galleries at the preferred minimum segment count; adjusted the formula so adding +2 row capacity actually reduces segments for libraries above 60 images.

## Current state

- `npm.cmd run build` passes in `client`; Vite may still emit the existing large chunk warning.
- `npm.cmd run lint` passes with two pre-existing warnings in analytics chart components and no errors from the landing gallery work.
- Live API count check on `http://127.0.0.1:3000/api/v1/media`: 169 total media records, 131 image records, 131 image URLs, 131 unique image URLs, 0 duplicate image URLs, 0 image records missing URLs. With the current dynamic layout, DomeGallery uses 7 rows per column, 19 effective columns/segments, and 133 slots, so all 131 unique image URLs have render slots.
- A dev server was previously active and responding at `http://127.0.0.1:5173/`.
- `@use-gesture/react` is present in `client/package.json` and `client/package-lock.json`.

## Next session starts with

- Visually inspect `/` with real uploaded media records and confirm that opened images now show as large full-aspect images with no square padding around them.
- If opened images still feel too small, tune the viewer frame bounds or stage/header height, not `object-fit`.
- If mobile gallery framing feels low/high, tune only `verticalStageOffset` and `maxRadius` first.
- Optionally address the two existing analytics hook dependency warnings.

## Open questions

- Whether to add server-side pagination or an image-only media endpoint if the public library grows large enough that client-side filtering is no longer sufficient.
