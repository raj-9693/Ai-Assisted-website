# NotepadX

A modern, fully responsive notes and task management app built with React and TypeScript. Works beautifully on both desktop and mobile — with rich text editing, freehand drawing, daily task tracking, and a calendar view.

---

## Features

### Notes
- **Typed Notes** — Full rich text editor powered by TipTap. Supports bold, italic, underline, highlights, text colors, headings, bullet/numbered lists, and image embeds.
- **Drawing Notes** — Freehand canvas drawing with pencil and eraser tools, multiple colors, adjustable stroke sizes, and customizable backgrounds.
- **Custom Backgrounds** — Apply solid colors, grid patterns, gradients, or image backgrounds to any note.
- **Pin Notes** — Pin important notes to keep them in a dedicated "Pinned" section.
- **Color Labels** — Each note gets a soft pastel card color for quick visual identification.
- **Grid / List View** — Toggle between a card grid and a compact list layout.
- **Search** — Instant search across note titles and content.
- **Date Filters** — Filter notes by Today, This Week, This Month, or All.
- **Calendar Picker** — Click any date on the calendar to see notes created on that day.
- **Auto-save** — Notes are auto-saved every 2 seconds while editing. Save also triggers on close.
- **Empty Note Discard** — Notes with no title and no content are automatically discarded.

### Daily Tasks
- **Create Tasks** — Add tasks with a title and priority level (High / Medium / Low).
- **Status Cycle** — Tap a task's status badge to cycle through Pending → In Progress → Completed.
- **Priority Cycle** — Tap the priority badge to cycle through Low → Medium → High.
- **Delete Tasks** — Remove individual tasks with a single tap.
- **Streak Counter** — Tracks consecutive days where all tasks were completed.

### Task Analytics
- **Today Tab** — Live stats for total, active, pending, and completed tasks with a progress bar.
- **Analytics Tab** — Weekly bar chart of daily completions, monthly productivity summary, and priority breakdown with progress bars. Also shows the top 5 most-completed task titles for the week.
- **History Tab** — Browse all past tasks grouped by date, collapsible by day.

### Calendar
- **Month View** — Navigate months with forward/back arrows.
- **Note Indicators** — Dots on calendar days that have notes.
- **Date Selection** — Tap a day to filter the notes view to that date.

### Responsive Design (Mobile & Desktop)
- **Desktop** — Fixed left sidebar with logo, navigation, and "Add new" button.
- **Mobile** — Fixed bottom navigation bar (Home / Tasks / Pinned / Calendar) with safe-area inset support for iPhone home bar.
- **Mobile Header** — Fixed top bar with the NotepadX logo, expandable inline search, and avatar button.
- **Touch Drawing** — Drawing canvas uses pointer events so it works with both mouse and finger.
- **Native Bottom Sheet** — The "New Note" type selector slides up as a bottom sheet on mobile (centered modal on desktop).
- **44px Touch Targets** — All interactive elements meet WCAG 2.5.5 minimum touch target size.

---

## Tech Stack

| Category | Library / Tool | Version |
|---|---|---|
| Framework | React | 18.2 |
| Language | TypeScript | 5.8 |
| Build Tool | Vite | 7.x |
| Styling | Tailwind CSS | 3.4 |
| UI Components | shadcn/ui + Radix UI | latest |
| Rich Text Editor | TipTap | 3.x |
| Drawing | HTML5 Canvas API | — |
| Bottom Sheet (mobile) | Vaul | 0.9 |
| Date Utilities | date-fns | 3.x |
| Icons | Lucide React | 0.394 |
| Animation | Framer Motion | 11.x |
| Charts | Recharts | 2.x |
| Forms | React Hook Form + Zod | latest |
| Storage | Browser localStorage | — |
| Routing | React Router DOM | 6.x |

---

## Project Structure

```
src/
├── components/
│   ├── home.tsx              # Root app layout & state
│   ├── Sidebar.tsx           # Desktop left navigation
│   ├── BottomNav.tsx         # Mobile bottom navigation bar
│   ├── MobileHeader.tsx      # Mobile top header with search
│   ├── NoteCard.tsx          # Note card (grid & list view)
│   ├── TypedEditor.tsx       # Full-screen rich text editor
│   ├── DrawingCanvas.tsx     # Full-screen freehand drawing editor
│   ├── RichTextEditor.tsx    # TipTap editor wrapper
│   ├── DailyTaskDashboard.tsx# Task manager with analytics & history
│   ├── CalendarView.tsx      # Month calendar modal
│   ├── ModeSelector.tsx      # New note type picker (bottom sheet / modal)
│   ├── FloatingActionButton.tsx # FAB for creating new notes
│   ├── SearchBar.tsx         # Desktop search input
│   ├── ViewToggle.tsx        # Grid / list toggle
│   ├── BackgroundThemeSheet.tsx # Background picker for notes
│   ├── NoteOptionsSheet.tsx  # Note actions sheet (open, pin, delete)
│   ├── DeleteConfirmDialog.tsx  # Delete confirmation dialog
│   ├── EmptyState.tsx        # Empty list placeholder
│   └── ui/                   # shadcn/ui base components
├── lib/
│   ├── storage.ts            # localStorage read/write for notes & tasks
│   ├── seedData.ts           # Sample data seeder for first load
│   └── utils.ts              # Tailwind class merging utility
├── types/
│   └── note.ts               # TypeScript interfaces for Note, Task, etc.
├── hooks/
│   └── use-mobile.tsx        # Mobile viewport detection hook
├── App.tsx                   # App entry with router
├── main.tsx                  # React DOM render
└── index.css                 # Global styles & Tailwind directives
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Preview the production build with:

```bash
npm run preview
```

---

## Data Storage

All data is stored in the browser's `localStorage` — no backend or account required.

| Key | Contents |
|---|---|
| `mino_notes` | Array of all notes (typed and drawing) |
| `mino_tasks` | Array of all daily tasks |

Drawing notes save canvas content as a base64 PNG. If `localStorage` quota is exceeded, older drawing note content is automatically compressed to keep the app working.

---

## Responsive Breakpoints

The app uses Tailwind's `sm` prefix (640px) as the single boundary between mobile and desktop layouts. All layout switching is done via CSS classes — no JavaScript `window.innerWidth` checks in render logic.

| Viewport | Layout |
|---|---|
| < 640px (mobile) | Bottom nav + fixed mobile header, single-column note grid |
| ≥ 640px (desktop) | Fixed left sidebar, multi-column note grid |

---

## License

MIT
