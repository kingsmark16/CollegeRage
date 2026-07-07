# Memory - Landing Dome Gallery Integration

Last updated: 2026-07-07 22:59 Asia/Manila

## What was built

- Added `client/src/features/home/components/DomeGallery.tsx` from the React Bits TypeScript/Tailwind source and cleaned it for the repo lint rules.
- Recreated `client/src/features/home/pages/HomePage.tsx` as a media-first landing page using the DomeGallery.
- The landing page fetches public media through `usePublicMediaGallery`, maps images to direct URLs, and maps videos to thumbnails or best available generated variant preview.
- The gallery is rendered with tuned props: `fit={0.78}`, `fitBasis="max"`, `minRadius={300}`, `maxRadius={800}`, `padFactor={0.1}`, `maxPad={56}`, `verticalStageOffset="-8%"`, `maxVerticalRotationDeg={3}`, `segments={24}`, `dragDampening={1.4}`, and `grayscale={false}`.
- Removed the large hero text/CTA block from the landing page so the gallery remains the main experience.
- Moved the header into normal document flow above the gallery so it no longer covers the dome; the dome now lives in a `flex-1 basis-0` stage below the header.
- Made the section use `h-dvh min-h-screen` so the gallery stage has a definite height for DomeGallery measurement.
- Added responsive DomeGallery sizing controls: `maxPad`, `verticalStageOffset`, mobile-aware radius fitting, capped viewer padding, and a mobile stage offset.
- Made the header brighter by using a near-solid `bg-[#101212]/95` surface and stronger button backgrounds.
- Changed DomeGallery opened/closing media images to `object-fit: contain` on a `#050606` background so clicked images show their full aspect ratio instead of cropping.
- Updated `ui-registry.md` with the current `Public Landing Dome Gallery` pattern, including the full-aspect opened-media rule.

## Decisions made

- Public media loading reuses the existing `/api/v1/media` read endpoint and `getPublicMedia` service export instead of adding a new API.
- DomeGallery remains image-source based; video records appear in the dome via thumbnails or generated video variant URLs.
- Thumbnail tiles should stay `object-fit: cover` for consistent card-like tiles, while opened media should use `object-fit: contain` to preserve the full source aspect ratio.
- The header should be a normal top bar above the gallery, not a full-page overlay, so it does not block or visually cover gallery interaction.
- The gallery section needs a definite viewport height (`h-dvh`) because DomeGallery relies on container measurement and its internal content is mostly absolutely positioned.
- Responsive sizing should be solved in DomeGallery's measurement logic, not with page-only breakpoint hacks.
- Gallery tile and opened-image radius were set to `8px` to align better with the app's existing squared visual system than the React Bits default `30px`.
- Dome tuning currently favors a large, steady medium-screen view: increased fit, fewer segments, and very low vertical rotation.

## Problems solved

- `HomePage.tsx` and `ui-registry.md` were deleted in the worktree; both were restored/recreated as part of the integration.
- PowerShell blocked `npm.ps1`, so checks were run with `npm.cmd`.
- React Bits pasted source had lint issues (`any`, `console.warn`, `performance.now`/`Date.now` purity in the gesture callback, and custom CSS property typing); these were cleaned up.
- The landing overlay previously made DomeGallery feel like a non-interactive background; pointer-event layering and then header layout were adjusted so the dome can be dragged/clicked.
- After moving the header into normal flow, the gallery disappeared because the flex child did not have a definite measured height; fixed by using `h-dvh min-h-screen` on the section and `flex-1 basis-0` on the gallery stage.
- On smaller screens, the dome became too small with excessive top/bottom empty space; fixed with `fitBasis="max"`, capped viewer padding, a more forgiving mobile height guard, and a small upward mobile stage offset.
- Clicked images were cropped in the opened view; fixed by switching the enlarged overlay image from `object-fit: cover` to `object-fit: contain`.

## Current state

- `npm.cmd run build` passes in `client`; Vite still emits the existing large chunk warning.
- `npm.cmd run lint` passes with two pre-existing warnings in analytics chart components and no errors from the landing gallery work.
- A dev server was previously active and responding at `http://127.0.0.1:5173/`.
- `@use-gesture/react` is present in `client/package.json` and `client/package-lock.json`.

## Next session starts with

- Visually inspect `/` with real uploaded media records and confirm that image/video previews frame well in the dome on desktop and mobile.
- If opened images feel too boxed-in, tune `openedImageWidth`/`openedImageHeight` or frame sizing rather than reverting `object-fit: contain`.
- If mobile still feels low/high, tune only `verticalStageOffset` and `maxRadius` first.
- Optionally address the two existing analytics hook dependency warnings.

## Open questions

- Whether the public landing page should include video playback on open, or continue using video thumbnails/previews inside the image-based DomeGallery.
