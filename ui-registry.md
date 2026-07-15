### Auth Page

File: client/src/features/auth/AuthPage.tsx
Last updated: 2026-07-15

| Property         | Class |
| ---------------- | ----- |
| Background       | `BG.png` full-bleed image, `bg-[#121414]/78`, `bg-[#1a1c1c]/70`, `bg-[#282a2b]` |
| Border           | `border border-[#2e2e2e]`, accent `border-[#34d59a]` |
| Border radius    | none / square-edged shadcn button radius |
| Text - primary   | `text-[#e2e2e2]` |
| Text - secondary | `text-[#999999]` |
| Spacing          | responsive viewport `min-h-[100dvh] overflow-y-auto`, mobile `px-3 py-4`, desktop `md:px-12`, form card `p-5 sm:p-8`, marketing detail cards hidden below `sm` |
| Hover state      | `hover:border-[#34d59a]`, `hover:text-[#5af2b4]` |
| Shadow           | none |
| Accent usage     | `LOGO.png`, `text-[#c084fc]`, `text-[#5af2b4]`, `bg-[#34d59a]/10`, `border-[#34d59a]/60` |

**Pattern notes:**
Authentication surfaces use the College Rage brand assets over the Stitch Neon Tech layout: full-bleed mosaic background, dark readability overlay, logo-first header, compact typography, and green/purple accents for brand, focus, verified, and hover states. Keep auth controls dense and centered; avoid decorative cards inside cards. On narrow screens, use a centered single-column composition with centered brand content, reduced spacing, a capped form card, full-width form controls, and vertical page scrolling only when the viewport is too short; hide secondary marketing detail cards so the form remains reachable and visually centered. At larger widths, restore the left-aligned marketing column beside the centered form.

### Admin Media Page

File: client/src/features/admin/pages/MediaPage.tsx
Last updated: 2026-07-06

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#151818]`, modal `bg-[#1a1d1d]`, preview well `bg-[#0b0d0d]`, drawer `bg-[#171919]` |
| Border           | `border border-white/10`, active accent `border-[#c79a31]/70`, dashed empty state `border-dashed border-white/15`, modal info action `border-[#3c5362]`, close/cancel neutral `border-[#4a4540]`, edit action `border-[#705929]`, delete action `border-[#7a2b2b]` |
| Border radius    | none on panels, pills `rounded-full`, media action circles `rounded-full` |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#beb7af]`, muted `text-[#8f887e]` |
| Spacing          | page `grid gap-6`, gallery `gap-5`, panels `p-4` and `p-6`, modal/sidebar `p-6`, variant row `mt-3 flex flex-wrap gap-2` |
| Hover state      | `hover:bg-[#181b1b]`, `hover:border-white/20`, accent hover `hover:border-[#c79a31]/60`, media hover `group-hover:scale-105`, modal info `hover:bg-[#1b2d38]`, close/cancel `hover:bg-[#211b18]`, edit `hover:bg-[#312713]`, delete `hover:bg-[#381919]` |
| Shadow           | modal `shadow-2xl`, active filter `shadow-[0_0_24px_rgba(199,154,49,0.16)]` |
| Accent usage     | `text-[#c79a31]`, `bg-[#c79a31]/15`, `text-[#f3cf7a]`, active variant `border-[#c79a31]/70`, CTA inverse button `bg-[#f2ede4] text-[#131110]`, modal controls use cool blue for view toggles, warm stone for neutral dismissal, gold-brown for edit, and deep red for destructive actions |

**Pattern notes:**
Admin media surfaces follow the Stitch gallery composition but are recolored into the dashboard's charcoal-and-gold palette. Keep gallery cards rectangular and dense, use soft white borders for structure, reserve the gold accent for filters, labels, selected variant buttons, and commit actions, and let overlays/drawers feel like darker continuations of the same workspace rather than separate card systems. Video previews should render in a true black playback well with variant toggles styled like compact pill controls, not as a separate card treatment. Within the modal, avoid black-on-black buttons: give each action family its own low-saturation role color so controls stay legible against the dark surface without overpowering the media.

### Admin Video Player

File: client/src/features/media/components/AdminVideoPlayer.tsx
Last updated: 2026-07-03

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#050606]`, stage `bg-black`, overlay gradients `from-black/50` and `from-black/85` |
| Border           | `border border-white/10`, overlay controls `border-white/10`, hero play button `border-white/15`, active variant `border-[#c79a31]/70` |
| Border radius    | container square, controls `rounded-full` |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#beb7af]` |
| Spacing          | frame header `p-4`, control stack `gap-4 p-4`, control rows `gap-2` and `gap-3`, quality menu `p-2` |
| Hover state      | `hover:bg-white/10`, `hover:border-[#c79a31]/60`, `hover:text-[#f3cf7a]`, hero play `hover:scale-105` |
| Shadow           | none; depth comes from backdrop blur and gradient overlays |
| Accent usage     | sliders `accent-[#c79a31]`, active quality `bg-[#c79a31]/15 text-[#f3cf7a]`, gold hover text/borders, active status `text-[#c79a31]` |

**Pattern notes:**
Custom admin playback controls should feel embedded in the media stage, not bolted underneath it. Use translucent black control capsules over the video, keep the gold accent reserved for progress, selected quality, and interactive emphasis, and preserve squared outer framing with rounded internal controls so the player still belongs to the broader dashboard system. On smaller screens, hide quality choices behind a settings trigger with a compact anchored menu rather than exposing a full button row. During initial loading, quality changes, or network stalls, show a compact centered gold spinner without changing the player layout; remove it when the video can play again.

### Admin Overview Metrics

File: client/src/features/admin/pages/OverviewPage.tsx
Last updated: 2026-07-06

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#151818]`, metric tile `bg-[#111414]`, chart tooltip `bg-[#101313]`, progress well `bg-[#0f1212]` |
| Border           | `border border-white/10`, Dropbox status `border-[#3c5362]`, empty chart `border-dashed border-white/15` |
| Border radius    | none on panels, metric tiles, chart wells, and tooltips |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#beb7af]`, muted axis/tile text `text-[#8f887e]` |
| Spacing          | page `grid gap-6`, dashboard panels `p-6`, chart section `mt-6 grid gap-6`, metric tiles `px-4 py-3` |
| Hover state      | inherits button hover patterns from admin media and auth actions |
| Shadow           | chart tooltip `shadow-2xl` |
| Accent usage     | storage progress `bg-[#c79a31]`, radar stroke/fill `#c79a31`, radar dots `#f3cf7a`, tooltip value `text-[#f3cf7a]` |

**Pattern notes:**
Admin overview metrics should read as operational dashboard surfaces: dense, rectangular, and scan-friendly. Use the existing charcoal panels and soft white borders, reserve gold for primary storage emphasis, and keep the media-by-type chart inside the Dropbox storage container rather than creating a separate analytics panel. The media storage visualization uses one shadcn-style radar chart with visible dots so the dashboard stays compact while still showing image, video, and music balance.

### Admin Analytics Visitor Table

File: client/src/features/analytics/components/AnalyticsVisitorList.tsx
Last updated: 2026-07-07

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#151818]`, table wrapper `bg-[#111414]` |
| Border           | `border border-white/10`, row divider `border-b border-white/10`, error `border-destructive/40` |
| Border radius    | none on panel, table wrapper, rows, and badges |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#beb7af]`, muted labels `text-[#8f887e]` |
| Spacing          | panel `p-4 sm:p-6`, content `gap-6`, cells `px-3 py-3`, pagination `pt-4` |
| Hover state      | pagination buttons `hover:border-[#5f8599] hover:bg-[#1a232b] hover:text-[#f2ede4]` |
| Shadow           | none |
| Accent usage     | section label `text-[#c79a31]`, authenticated badge `border-emerald-500/30 bg-emerald-500/10 text-emerald-300` |

**Pattern notes:**
Admin analytics tables should stay compact and dense while keeping overflow contained inside the table wrapper. Use smaller table typography, clipped/truncated long cells, and `max-w-full overflow-x-auto` on the inner table container so wide operational data can be inspected without creating horizontal scroll on the whole page. Keep status badges square and understated, with green reserved for authenticated visitor state.

### Admin Sidebar

File: client/src/features/admin/components/AdminSidebar.tsx
Last updated: 2026-07-05

| Property         | Class |
| ---------------- | ----- |
| Background       | `[--sidebar:#090b10]`, logo well `bg-[#0f1420]`, footer buttons `bg-[#0d1118]`, active/hover nav `bg-[#121720]`, dashboard inset `bg-[#0f1111]` |
| Border           | `[--sidebar-border:rgb(255_255_255_/_0.08)]`, `border border-white/10`, button hover `hover:border-[#8f7cff]/45` |
| Border radius    | outer shell square, logo `rounded-full` |
| Text - primary   | `[--sidebar-foreground:#d7d2ca]`, nav active `text-[#f5f1ea]` |
| Text - secondary | group label `text-[#7f89a3]`, idle nav `text-[#b9c0ce]`, idle icons `text-[#7f89a3]`, action hover `text-[#fcfbf8]` |
| Spacing          | header `px-3 py-6`, content `px-2 pb-2`, footer `px-3 py-4`, nav buttons `px-3 py-2` |
| Hover state      | `hover:bg-[#121720]`, `hover:text-[#f5f1ea]`, action hover `hover:text-[#fcfbf8]`, logo `hover:scale-[1.02]` |
| Shadow           | logo `shadow-[0_0_28px_rgba(143,124,255,0.18)]` |
| Accent usage     | `[--sidebar-primary:#8f7cff]`, active icons `text-[#8f7cff]`, action border hover `hover:border-[#8f7cff]/45` |

**Pattern notes:**
Admin navigation should read as a darker, cooler control rail than the content area. Keep the shell nearly black, remove inset gutters that expose lighter wrapper tones, use slate-blue hover wells for item focus, and reserve the purple accent for active icons and subtle glow rather than broad fills. Branding in the sidebar is image-led: a larger circular logo mark replaces stacked text identity and user meta blocks, while collapsed navigation should center its icon buttons cleanly within the narrow rail.
On mobile, the sheet-backed sidebar must inherit the same dark sidebar surface and border treatment as the desktop rail so the drawer does not flash the default light sheet background.

### Admin Music Panel

File: client/src/features/music/components/AdminMusicPanel.tsx
Last updated: 2026-07-06

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#151818]`, form wells `bg-[#121515]`, list cards `bg-black/10`, selected toggle `bg-[#1d1a12]` |
| Border           | `border border-white/10`, selected toggle `border-[#c79a31]/65`, browse chip `border-[#c79a31]/55`, action states `border-[#465256]`, `border-[#7a6128]`, `border-[#7a2b2b]` |
| Border radius    | none on panels, internal status icon wells square, badges and chips square |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#beb7af]`, muted `text-[#8f887e]`, selected support `text-[#e7d7b0]` |
| Spacing          | section `grid gap-5`, panels `p-6`, form `gap-4`, toggle cards `px-4 py-4`, list items `p-4 sm:p-5` |
| Hover state      | `hover:bg-[#181b1b]`, browse `hover:border-[#c79a31]/45`, show `hover:bg-[#223034]`, default `hover:bg-[#312713]`, delete `hover:bg-[#381919]` |
| Shadow           | selected toggle `shadow-[0_0_24px_rgba(199,154,49,0.12)]` |
| Accent usage     | `text-[#c79a31]`, `bg-[#c79a31]/12`, `text-[#f3cf7a]`, CTA `bg-[#c79a31] text-[#131110]` |

**Pattern notes:**
Admin music surfaces should stay in the same charcoal-and-gold dashboard family as media, but use richer state color coding for actions: cool teal for visibility, warm gold for default selection, and deep red for destructive controls. Upload toggles should read like selectable command tiles rather than browser checkboxes, with the checked state communicated through both a gold border wash and a compact check indicator.

### Admin Music Player

File: client/src/features/music/components/AdminMusicPlayer.tsx
Last updated: 2026-07-06

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[linear-gradient(180deg,#111515_0%,#0b0e0e_100%)]`, play well `bg-[#171b1b]` |
| Border           | `border border-white/10`, play ring `border-[#c79a31]/30`, inner ring `border-white/8`, control buttons `border-white/10` |
| Border radius    | outer shell square, transport control `rounded-full` |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#8f887e]`, footnote `text-[#6e685f]` |
| Spacing          | panel `p-5 sm:p-6`, main row `gap-4`, timeline `mt-4 gap-2`, footer `pt-4` |
| Hover state      | `hover:border-[#c79a31]/65`, `hover:bg-[#1b2020]`, control hover `hover:bg-[#1d2222] hover:text-[#f3cf7a]` |
| Shadow           | play control `shadow-[0_0_0_1px_rgba(255,255,255,0.03)]` |
| Accent usage     | progress and volume `accent-[#c79a31]`, animated bars `bg-[#c79a31]`, hover text `text-[#f3cf7a]` |

**Pattern notes:**
The music player should feel like a quiet studio transport sitting inside the admin dashboard, not a native browser embed. Keep the frame squared and architectural, then soften the interaction points with one circular hero control, gold-accented sliders, and subdued equalizer bars that come alive only while audio is playing.

### Public Landing Dome Gallery

File: client/src/features/home/components/DomeGallery.tsx
Last updated: 2026-07-08

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#101212]`, header `bg-[#101212]/95`, header music player `bg-[linear-gradient(180deg,#121616_0%,#0d1010_100%)]`, gallery overlay `bg-[linear-gradient(180deg,rgba(16,18,18,0.16)_0%,rgba(16,18,18,0)_34%,rgba(16,18,18,0.68)_100%)]`, empty state `bg-[#101212]` |
| Border           | `border-b border-white/10`, header player `border border-white/10`, player controls `border-[#c79a31]/30`, CTA `border-[#c79a31]`, error `border-destructive/40` |
| Border radius    | page shell none, gallery media tiles `8px`, opened media `8px` |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#d7d2ca]`, muted `text-[#beb7af]`, empty state `text-[#8f887e]` |
| Spacing          | shell `h-dvh min-h-screen`, header `px-5 py-5`, responsive `sm:px-8 lg:px-10`, header uses a `lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]` layout, player transport buttons `size-10`, track select `lg:w-[240px]`, gallery stage `flex-1 basis-0`, DomeGallery `fit={0.78} fitBasis="max" dynamic segments/columns maxVerticalRotationDeg={20} padFactor={0} maxPad={0} verticalStageOffset="-8%"`, progressive activation starts with `24` images, then `8` more every `240ms`, error well `px-5 pb-10 sm:px-8 sm:pb-14 lg:px-10` |
| Hover state      | player controls `hover:border-[#c79a31]/65 hover:bg-[#1b2020] hover:text-[#f3cf7a]`, select `hover:border-white/20 focus:border-[#c79a31]/65`, CTA `hover:bg-[#f3cf7a]` |
| Shadow           | header `shadow-[0_18px_40px_rgba(0,0,0,0.32)]`, header player `shadow-[0_0_0_1px_rgba(255,255,255,0.03)]`, opened media `box-shadow:0 10px 30px rgba(0,0,0,.35)`; loading tiles use a static charcoal placeholder |
| Accent usage     | CTA `bg-[#c79a31] text-[#131110]`, player active bars `bg-[#c79a31]` and `bg-[#e8d5a4]`, player slider `accent-[#c79a31]`, DomeGallery overlay blur `#101212`; loading states have no animated sheen, spectrum border, or retry pulse |

**Pattern notes:**
The public landing page should be media-first: the React Bits dome owns the viewport area below a normal-flow header, keeping the gallery interactive and unobscured. Keep first-viewport content unframed, avoid stacked cards, use a brighter near-solid header surface for navigation clarity, and reserve gold for route actions. The header should carry a compact soundtrack player for visitors instead of a separate sign-in button: use public music tracks only, support direct track selection, previous/next transport, play/pause, and looping auto-advance when a track ends. Keep the player dense enough for the top bar by truncating text, using square transport controls, and collapsing the layout into a stacked mobile-friendly grid rather than expanding into an admin-style panel. DomeGallery should use a fuller `fit={0.78}` with a small mobile upward stage offset so the visible media belt stays large and steady on narrow screens. Dome density is dynamic: columns and effective segments are derived from the unique image count, rows per column scale from 6 to 9 as the library grows, and the layout must always provide at least one slot for each unique image without repeating images. Prefer this higher per-column capacity because it subtracts/reduces the effective segment count as image volume grows. The public dome should receive image media only, never videos or video thumbnails. Image-to-tile placement should feel fresh across visits without jumping around mid-session: use a seeded session shuffle so each unique image still appears once, but not in the exact same dome slot forever. Load images progressively with the smaller first batch and browser lazy-loading for later tiles. Failed images may retry with backoff, but loading placeholders must remain static: no animated sheen, spectrum border, retry blink, or ambient loading glow. Keep drag inertia and opened-image transitions available while avoiding continuous visual effects when the gallery is idle. Thumbnail tiles stay cropped with `object-fit: cover`, but opened media must use a no-padding full viewer frame and an aspect-fitted overlay with `object-fit: contain`, so the overlay is the image's own aspect ratio instead of a square box around it.

### Public Landing Video Memories

File: client/src/features/home/components/VideoMemoriesSection.tsx
Last updated: 2026-07-15

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#101212]`, gallery well `bg-[#151818]`, lighter gallery loading placeholder `#252b2a`, player overlay `bg-black/80` |
| Border           | `border border-white/10`, empty state `border border-dashed border-white/15` |
| Border radius    | square outer gallery and player frame; gallery thumbnails have no rounded corners |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#beb7af]`, muted `text-[#8f887e]` |
| Spacing          | section `px-4 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24`, gallery `h-[420px] sm:h-[520px]`, player uses `w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] p-1.5` on mobile and `sm:w-full sm:max-h-[calc(100dvh-2rem)] sm:p-3` on larger screens |
| Hover state      | thumbnail `hover:brightness-110` with `focus-visible:ring-2 focus-visible:ring-[#c79a31]`; off-center click recenters only, centered click opens playback; close control `hover:border-[#c79a31]/60 hover:bg-[#211b18] hover:text-[#f3cf7a]` |
| Shadow           | gallery `shadow-[0_24px_60px_rgba(0,0,0,0.24)]`, player `shadow-[0_30px_80px_rgba(0,0,0,0.58)]` |
| Accent usage     | section label `text-[#c79a31]`, player hover `text-[#f3cf7a]`, buffering spinner `border-t-[#c79a31]` |

**Pattern notes:**
Landing video media is a second, scrollable section after the image-first dome. Keep the curved thumbnail gallery inside a squared charcoal well with no card stack around it. Use normal image elements rather than WebGL textures so remote thumbnail URLs remain visible, and retry failed thumbnails without modifying their source URLs. Keep gallery thumbnail rendering reliable; video loading is deferred until selection. When playback opens, pause pending image activation and thumbnail retries across both galleries while preserving already loaded media, then mount the player after that pause takes effect so the selected video receives the available network bandwidth. Open playback uses automatic video preloading and locks the main document scroll while leaving only the small-screen player frame scrollable when necessary. The landing header keeps its logo, music trigger, and admin action inside the viewport on narrow screens; the soundtrack drawer is width-constrained and internally scrollable on very small devices. Use a lighter charcoal thumbnail fallback and a translucent buffering spinner so loading does not dominate the gallery. Clicking an off-center thumbnail recenters it without opening playback; clicking the centered thumbnail opens the selected video in a viewport-constrained dark overlay above the gallery. Touch and pen swipes use increased sensitivity so the arc travels farther per gesture while mouse-wheel behavior remains unchanged. Do not show a player title header; use an in-frame close control. Gallery cards must not show filenames or labels, with gold reserved for interactive close/control emphasis.
