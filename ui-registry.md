### Auth Page

File: client/src/features/auth/AuthPage.tsx
Last updated: 2026-06-27

| Property         | Class |
| ---------------- | ----- |
| Background       | `BG.png` full-bleed image, `bg-[#121414]/78`, `bg-[#1a1c1c]/70`, `bg-[#282a2b]` |
| Border           | `border border-[#2e2e2e]`, accent `border-[#34d59a]` |
| Border radius    | none / square-edged shadcn button radius |
| Text - primary   | `text-[#e2e2e2]` |
| Text - secondary | `text-[#999999]` |
| Spacing          | `px-4 py-8`, `md:px-12`, `gap-6`, panel `px-4 py-4` |
| Hover state      | `hover:border-[#34d59a]`, `hover:text-[#5af2b4]` |
| Shadow           | none |
| Accent usage     | `LOGO.png`, `text-[#c084fc]`, `text-[#5af2b4]`, `bg-[#34d59a]/10`, `border-[#34d59a]/60` |

**Pattern notes:**
Authentication surfaces use the College Rage brand assets over the Stitch Neon Tech layout: full-bleed mosaic background, dark readability overlay, logo-first header, compact typography, and green/purple accents for brand, focus, verified, and hover states. Keep auth controls dense and centered; avoid decorative cards inside cards.

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
Custom admin playback controls should feel embedded in the media stage, not bolted underneath it. Use translucent black control capsules over the video, keep the gold accent reserved for progress, selected quality, and interactive emphasis, and preserve squared outer framing with rounded internal controls so the player still belongs to the broader dashboard system. On smaller screens, hide quality choices behind a settings trigger with a compact anchored menu rather than exposing a full button row.

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
