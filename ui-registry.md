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
Last updated: 2026-07-03

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-[#151818]`, modal `bg-[#1a1d1d]`, preview well `bg-[#0b0d0d]`, drawer `bg-[#171919]` |
| Border           | `border border-white/10`, active accent `border-[#c79a31]/70`, dashed empty state `border-dashed border-white/15` |
| Border radius    | none on panels, pills `rounded-full`, media action circles `rounded-full` |
| Text - primary   | `text-[#f2ede4]` |
| Text - secondary | `text-[#beb7af]`, muted `text-[#8f887e]` |
| Spacing          | page `grid gap-6`, gallery `gap-5`, panels `p-4` and `p-6`, modal/sidebar `p-6`, variant row `mt-3 flex flex-wrap gap-2` |
| Hover state      | `hover:bg-[#181b1b]`, `hover:border-white/20`, accent hover `hover:border-[#c79a31]/60`, media hover `group-hover:scale-105` |
| Shadow           | modal `shadow-2xl`, active filter `shadow-[0_0_24px_rgba(199,154,49,0.16)]` |
| Accent usage     | `text-[#c79a31]`, `bg-[#c79a31]/15`, `text-[#f3cf7a]`, active variant `border-[#c79a31]/70`, CTA inverse button `bg-[#f2ede4] text-[#131110]` |

**Pattern notes:**
Admin media surfaces follow the Stitch gallery composition but are recolored into the dashboard's charcoal-and-gold palette. Keep gallery cards rectangular and dense, use soft white borders for structure, reserve the gold accent for filters, labels, selected variant buttons, and commit actions, and let overlays/drawers feel like darker continuations of the same workspace rather than separate card systems. Video previews should render in a true black playback well with variant toggles styled like compact pill controls, not as a separate card treatment.

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
