# Transition System Rules

## Core Principles

All page transitions follow a **unified, synchronized system** that ensures consistent navigation feel across the entire application.

## Transition Pipeline

### Execution Order
1. **Navigation Triggered** → LoadingBar appears (immediate)
2. **Current Page Exits** → Blur (20px) + Scale (1.05) over 1.5s
3. **New Page Enters** → Blur resolves to 0 + Scale (0.98) to 1.0 over 1.5s
4. **Transition Complete** → LoadingBar disappears after 1.5s

### Timeline
```
0ms      0.4s          1.5s
│         │             │
Loading:  [====→]      [hidden]
Exit:     [←────────────]
Enter:               [←────────────]
```

## Component Responsibilities

### PageTransition (`src/components/PageTransition.tsx`)
- **Wraps all page content** in the root layout
- **Mode**: `wait` (exit before enter)
- **Initial**: opacity 0, blur 20px, scale 0.98
- **Animate**: opacity 1, blur 0px, scale 1
- **Exit**: opacity 0, blur 20px, scale 1.05
- **Duration**: 1.5s, ease `easeInOut`
- **Key**: pathname (triggers on route change)

### LoadingBar (`src/components/LoadingBar.tsx`)
- **Global indicator** rendered at top of layout
- **Appearance**: Thin (0.5rem) gradient bar
- **Opacity**: 40% (0.4)
- **Trigger**: Pathname or searchParams change
- **Duration**: 400ms ease-out for appearance
- **Visibility**: 1.5s total (matches PageTransition)

### Layout Integration (`src/app/layout.tsx`)
```tsx
<NoiseOverlay />
<LoadingBar />
<PageTransition>
  <div>{children}</div>
</PageTransition>
```

## Rules for Consistency

### ✅ DO
- Keep all transitions at **1.5s duration**
- Use `blur(20px)` for exit states
- Use `scale 0.98` for enter, `1.05` for exit
- Render LoadingBar globally in root layout
- Use `AnimatePresence mode="wait"` for page transitions
- Keep opacity transitions from 0 → 1

### ❌ DON'T
- Override transition duration on individual pages
- Add competing animations during page transitions
- Change the blur/scale values without updating all references
- Place PageTransition inside dynamic sections
- Remove LoadingBar from the transition pipeline

## Adding New Pages

All new routes automatically inherit the transition system—no additional setup required.

**New pages simply wrap content as normal:**
```tsx
export default function NewPage() {
  return (
    <main>
      {/* Content here transitions automatically */}
    </main>
  );
}
```

## Customization Points

### If you need to modify timing:
- Edit `duration` in `PageTransition.tsx` (line 12)
- Edit timeout in `LoadingBar.tsx` (line 21)
- Keep both at **1500ms** for sync

### If you need to modify animation values:
- Edit `initial`, `animate`, `exit` in `PageTransition.tsx`
- Update `blur()` values (currently 20px)
- Update `scale` values (currently 0.98/1.05)
- **Document changes here**

## Technical Dependencies

- **framer-motion**: AnimatePresence, motion components
- **next/navigation**: usePathname, useSearchParams
- **React Hooks**: useState, useEffect

## Monitoring

The system is "locked" when:
- ✅ PageTransition wraps all page content
- ✅ LoadingBar rendered at layout level
- ✅ All timing values synchronized to 1500ms
- ✅ No page-level transition overrides exist
