# Implementation Plan: Mobile Responsive UI

## Overview

Introduce a bottom navigation bar, mobile header, and touch-optimized interactions using Tailwind CSS breakpoint classes exclusively for layout switching. All layout decisions use `sm:` (640px) as the mobile/desktop boundary — no `window.innerWidth` or `useIsMobile` in render logic.

## Tasks

- [x] 1. Create `BottomNav` component
  - [x] 1.1 Create `src/components/BottomNav.tsx` with Home, Tasks, Pinned, Calendar items
    - Fixed bottom bar `fixed bottom-0 left-0 right-0 z-40 flex sm:hidden`
    - Each button: `min-h-[56px] flex-1 flex flex-col items-center justify-center gap-1 py-2`
    - Active item: filled icon variant + `text-indigo-600`
    - Calendar tap calls `onCalendarClick`, not `onSectionChange`
    - `pb-[env(safe-area-inset-bottom)]` on the container
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 2. Create `MobileHeader` component
  - [x] 2.1 Create `src/components/MobileHeader.tsx` with logo, search icon, avatar
    - Fixed top bar `fixed top-0 left-0 right-0 z-40 flex sm:hidden h-14 bg-white border-b`
    - Local `isSearchOpen` state for inline search expand/collapse
    - Cancel button collapses and clears search query
    - All buttons: `min-w-[44px] min-h-[44px]`
    - `pt-[env(safe-area-inset-top)]` on the container
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Modify `home.tsx` for responsive layout
  - [x] 3.1 Wrap `<Sidebar>` in `<div className="hidden sm:flex flex-shrink-0">`
    - _Requirements: 1.1, 1.4_
  - [x] 3.2 Add `<MobileHeader>` inside right-side column (hidden on desktop via component class)
    - Pass `searchQuery` and `setSearchQuery` to MobileHeader
    - _Requirements: 1.3_
  - [x] 3.3 Wrap `<SearchBar>` in `<div className="hidden sm:block">`
    - _Requirements: 1.3, 1.4_
  - [x] 3.4 Add `<BottomNav>` at the bottom of the layout (hidden on desktop via component class)
    - Pass `activeSection`, `setActiveSection`, and `() => setShowCalendar(true)` as props
    - _Requirements: 1.2_
  - [x] 3.5 Add `pt-14 sm:pt-0 pb-16 sm:pb-0` to the scrollable content area
    - _Requirements: 1.5, 1.6, 3.6_
  - [x] 3.6 Update grid columns class from `md:grid-cols-2` to `sm:grid-cols-2`
    - _Requirements: 4.1, 4.2_
  - [x] 3.7 Wrap the dashed "New Note" card in `<div className="hidden sm:block">`
    - _Requirements: 4.6_

- [x] 4. Modify `NoteCard` for mobile touch visibility
  - [x] 4.1 Change menu button opacity classes in grid view to `sm:opacity-0 sm:group-hover:opacity-100 opacity-100`
    - Ensure button has `min-w-[44px] min-h-[44px]` for touch target
    - _Requirements: 4.4, 4.5_
  - [x] 4.2 Change menu button opacity classes in list view to `sm:opacity-0 sm:group-hover:opacity-100 opacity-100`
    - Ensure button has `min-w-[44px] min-h-[44px]` for touch target
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 5. Modify `FloatingActionButton` for mobile positioning
  - [x] 5.1 Update positioning from `bottom-8 right-8` to `bottom-20 right-6 sm:bottom-8 sm:right-8`
    - Keep `w-14 h-14` (56×56 px)
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 6. Modify `ModeSelector` for mobile bottom sheet
  - [x] 6.1 Replace fixed animation with vaul `Drawer.Root` + `Drawer.Portal` + `Drawer.Content` for mobile
    - Use `Drawer as DrawerPrimitive` from vaul directly (the existing ui/drawer.tsx wrapper is broken)
    - Mobile: `<DrawerPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>` wrapping the content
    - Drag handle: `<div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-gray-300" />`
    - Each option button: `min-h-[56px]`
    - Desktop modal kept inside `<div className="hidden sm:flex ...">` 
    - Drawer wrapper: `<div className="sm:hidden">`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Modify `DrawingCanvas` for touch support
  - [x] 7.1 Replace mouse event handlers with pointer event handlers on the canvas element
    - Change `onMouseDown` → `onPointerDown`, `onMouseMove` → `onPointerMove`, `onMouseUp` → `onPointerUp`, `onMouseLeave` → `onPointerLeave`
    - Update `getCanvasPos` to accept `React.PointerEvent<HTMLCanvasElement>`
    - Update `startDrawing`, `draw`, `stopDrawing`, `handleMouseLeaveCanvas` signatures accordingly
    - _Requirements: 5.3_
  - [x] 7.2 Add `style={{ touchAction: 'none' }}` to the `<canvas>` element
    - _Requirements: 5.4_
  - [x] 7.3 Wrap the desktop toolbar div in `<div className="hidden sm:flex items-center gap-6">`
    - Add compact mobile toolbar strip below the header: draw/erase toggle + color swatch + stroke picker — `flex sm:hidden items-center gap-2 px-4 py-2 bg-white border-b overflow-x-auto`
    - Each toolbar button: `min-w-[44px] min-h-[44px]`
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 8. Modify `TypedEditor` for mobile readability
  - [x] 8.1 Change title input class from `text-4xl` to `text-2xl sm:text-4xl`
    - _Requirements: 6.1_
  - [x] 8.2 Change title wrapper padding from `px-8` to `px-4 sm:px-8`
    - _Requirements: 6.4_
  - [x] 8.3 Add `min-h-[40dvh]` to the editor content wrapper `flex-1 overflow-hidden` div
    - _Requirements: 6.2_

- [x] 9. Fix broken `ui/drawer.tsx` wrapper
  - [x] 9.1 Fix the `Drawer` component in `src/components/ui/drawer.tsx` so it properly renders with `shouldScaleBackground`
    - The current implementation returns `<></>` — fix it to use `DrawerPrimitive.Root`
    - _Requirements: 8.1_

- [ ] 10. Final checkpoint
  - Ensure TypeScript compiles without errors (`npx tsc --noEmit`)
  - Ask the user if questions arise.
