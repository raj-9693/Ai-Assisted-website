# Requirements Document

## Introduction

The MINO notes app currently has a well-designed desktop UI built with React, TypeScript, Tailwind CSS, and shadcn/ui. The mobile experience is an afterthought — the sidebar occupies permanent horizontal space, touch targets are undersized, the toolbar in DrawingCanvas overflows on small screens, and layout breakpoints are inconsistently applied across components. This feature delivers a responsive, clean, and maintainable mobile UI by introducing a bottom navigation bar, a mobile-aware top header, touch-optimized controls, and consistent Tailwind breakpoint usage across all components — without changing the desktop experience.

## Glossary

- **App**: The MINO React + TypeScript notes application.
- **Mobile_Viewport**: Any viewport with a width less than 768 px (Tailwind `sm` breakpoint).
- **Desktop_Viewport**: Any viewport with a width of 768 px or greater.
- **Bottom_Nav**: The fixed bottom navigation bar that replaces the Sidebar on Mobile_Viewport.
- **Mobile_Header**: The fixed top header bar shown on Mobile_Viewport, containing the app logo, search trigger, and user avatar.
- **Sidebar**: The existing fixed left-side navigation panel used on Desktop_Viewport.
- **DrawingCanvas**: The full-screen drawing editor component.
- **TypedEditor**: The full-screen rich-text note editor component.
- **NoteCard**: The card component representing a single note in grid or list view.
- **FAB**: The Floating Action Button used to trigger note creation.
- **ModeSelector**: The modal sheet for choosing note type (typed or drawing).
- **Touch_Target**: An interactive element (button, link) with a minimum tappable area of 44×44 px as per WCAG 2.5.5.
- **Breakpoint**: A Tailwind CSS responsive prefix (`sm`, `md`, `lg`) used to apply styles conditionally.

---

## Requirements

### Requirement 1: Responsive Layout Structure

**User Story:** As a mobile user, I want the app layout to adapt to my screen size, so that I can navigate and use all features without horizontal scrolling or obscured content.

#### Acceptance Criteria

1. THE App SHALL render the Sidebar only on Desktop_Viewport.
2. THE App SHALL render the Bottom_Nav only on Mobile_Viewport.
3. WHEN the viewport is Mobile_Viewport, THE App SHALL render the Mobile_Header as a fixed top bar in place of the SearchBar-within-content-area pattern.
4. THE App SHALL use Tailwind Breakpoint classes exclusively (no inline `window.innerWidth` checks in render logic) to control layout visibility, ensuring the layout reacts to CSS media queries.
5. WHILE the viewport is Mobile_Viewport, THE App SHALL remove the left-sidebar offset so the main content area spans the full viewport width.
6. WHILE the viewport is Mobile_Viewport, THE App SHALL add bottom padding to the scrollable content area equal to the height of the Bottom_Nav to prevent content from being obscured.

---

### Requirement 2: Bottom Navigation Bar

**User Story:** As a mobile user, I want a persistent bottom navigation bar, so that I can switch between sections with one thumb tap from any position in the app.

#### Acceptance Criteria

1. THE Bottom_Nav SHALL display navigation items for Home, Tasks, Pinned, and Calendar sections.
2. THE Bottom_Nav SHALL display each navigation item as an icon with a label below it.
3. WHEN a navigation item is tapped, THE Bottom_Nav SHALL update the active section to the tapped item's section.
4. WHEN a section is active, THE Bottom_Nav SHALL visually distinguish that item (e.g., filled icon, accent color) from inactive items.
5. THE Bottom_Nav SHALL fix itself to the bottom of the viewport and remain visible during scroll.
6. WHEN the Calendar item is tapped, THE Bottom_Nav SHALL open the CalendarView sheet instead of changing the active section label.
7. THE Bottom_Nav SHALL apply a safe-area-inset-bottom padding to support devices with home indicator bars (iOS notch/home bar).
8. EACH navigation item in the Bottom_Nav SHALL meet the Touch_Target minimum size of 44×44 px.

---

### Requirement 3: Mobile Header

**User Story:** As a mobile user, I want a clean top header with quick access to search and my profile, so that key actions are always reachable without scrolling.

#### Acceptance Criteria

1. THE Mobile_Header SHALL display the MINO logo on the left.
2. THE Mobile_Header SHALL display a search icon button on the right that, when tapped, expands an inline search input within the header.
3. WHEN the search input is expanded, THE Mobile_Header SHALL display a close/cancel button that collapses the search input and clears the search query.
4. THE Mobile_Header SHALL display a user avatar button on the right side.
5. THE Mobile_Header SHALL fix itself to the top of the viewport.
6. WHILE the viewport is Mobile_Viewport, THE App SHALL add top padding to the scrollable content area equal to the height of the Mobile_Header to prevent content from being obscured.
7. EACH interactive element in the Mobile_Header SHALL meet the Touch_Target minimum size of 44×44 px.

---

### Requirement 4: Mobile-Optimized Note Grid and List

**User Story:** As a mobile user, I want note cards that are readable and tappable on a small screen, so that I can browse and open notes comfortably.

#### Acceptance Criteria

1. WHILE the viewport is Mobile_Viewport, THE NoteCard SHALL render in a single-column grid layout.
2. WHILE the viewport is Desktop_Viewport, THE NoteCard SHALL render in a multi-column grid layout (2 columns on `md`, 3 columns on `lg` and above) as it does today.
3. WHEN the viewMode is list on Mobile_Viewport, THE NoteCard SHALL display the title and preview in a horizontal layout with adequate spacing.
4. WHILE the viewport is Mobile_Viewport, THE NoteCard menu button (three-dot icon) SHALL be permanently visible (not hidden behind group-hover) because hover states are not available on touch devices.
5. THE NoteCard SHALL meet the Touch_Target minimum size of 44×44 px for the menu button.
6. WHILE the viewport is Mobile_Viewport, THE App SHALL replace the "add new note" dashed card placeholder in the grid with the FAB as the sole note creation trigger.

---

### Requirement 5: Mobile-Optimized DrawingCanvas Toolbar

**User Story:** As a mobile user, I want the drawing toolbar to be usable on a small screen, so that I can create and edit drawing notes without the toolbar overflowing or overlapping the canvas.

#### Acceptance Criteria

1. WHILE the viewport is Mobile_Viewport, THE DrawingCanvas SHALL move the toolbar to a bottom sheet or a compact floating bar anchored above the canvas, separate from the top header area.
2. WHILE the viewport is Mobile_Viewport, THE DrawingCanvas SHALL display tool controls (color picker, stroke size, mode toggle) as a horizontally scrollable row within the toolbar area.
3. WHILE the viewport is Mobile_Viewport, THE DrawingCanvas SHALL add touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`) to the canvas element so drawing works with finger input.
4. WHILE the viewport is Mobile_Viewport, THE DrawingCanvas SHALL prevent the page from scrolling while a finger is actively drawing on the canvas.
5. THE DrawingCanvas top header SHALL always show the back button and save button regardless of viewport size.
6. EACH toolbar button in the DrawingCanvas SHALL meet the Touch_Target minimum size of 44×44 px.

---

### Requirement 6: Mobile-Optimized TypedEditor

**User Story:** As a mobile user, I want the note editor to make full use of the screen and handle the software keyboard gracefully, so that I can write notes without layout issues.

#### Acceptance Criteria

1. WHILE the viewport is Mobile_Viewport, THE TypedEditor title input SHALL use a font size no smaller than 24 px to remain readable.
2. WHILE the viewport is Mobile_Viewport, THE TypedEditor content area SHALL not shrink below 40% of the initial viewport height when the software keyboard is open.
3. THE TypedEditor header SHALL always show the back/close button and the save-indicator on Mobile_Viewport as clearly visible elements.
4. WHILE the viewport is Mobile_Viewport, THE TypedEditor SHALL apply horizontal padding of at least 16 px to all text areas.

---

### Requirement 7: Touch-Friendly Floating Action Button

**User Story:** As a mobile user, I want the FAB to be always accessible and correctly positioned, so that I can create a new note without it overlapping content or navigation controls.

#### Acceptance Criteria

1. WHILE the viewport is Mobile_Viewport, THE FAB SHALL be positioned above the Bottom_Nav (i.e., its bottom offset SHALL be at least the Bottom_Nav height plus 16 px).
2. WHILE the viewport is Desktop_Viewport, THE FAB SHALL retain its current `bottom-8 right-8` positioning.
3. THE FAB SHALL maintain its minimum size of 56×56 px on all viewports.
4. WHEN the ModeSelector is open, THE FAB SHALL not be visible.

---

### Requirement 8: ModeSelector Sheet Mobile Behavior

**User Story:** As a mobile user, I want the new-note type selector to feel native on mobile, so that I can pick a note type without accidentally dismissing it.

#### Acceptance Criteria

1. WHILE the viewport is Mobile_Viewport, THE ModeSelector SHALL render as a bottom sheet anchored to the bottom of the viewport with rounded top corners.
2. WHILE the viewport is Desktop_Viewport, THE ModeSelector SHALL render as a centered modal as it does today.
3. THE ModeSelector SHALL display a visible drag handle indicator at the top of the bottom sheet on Mobile_Viewport.
4. EACH option button in the ModeSelector SHALL meet the Touch_Target minimum size of 44×44 px on Mobile_Viewport.

---

### Requirement 9: Consistent Breakpoint Strategy

**User Story:** As a developer, I want all mobile-responsive styles to follow a single, documented breakpoint strategy, so that the codebase is maintainable and free from ad-hoc layout hacks.

#### Acceptance Criteria

1. THE App SHALL use Tailwind's `sm` prefix (min-width: 640 px) as the boundary between stacked (mobile) and side-by-side (tablet/desktop) layouts — except where a specific component's design requires the `md` breakpoint.
2. THE App SHALL NOT use JavaScript `window.innerWidth` comparisons or the `useIsMobile` hook to drive layout visibility; Tailwind responsive classes SHALL be the single source of truth for layout toggling.
3. IF a new component requires mobile-specific layout, THEN THE component SHALL use the established Tailwind breakpoint classes documented in this feature rather than introducing new responsive logic patterns.
4. THE App SHALL document the breakpoint strategy in a brief inline comment at the top of each component that introduces new responsive classes.
