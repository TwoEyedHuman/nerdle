# Nerdle

A daily video game word-guessing game hosted at [nerdle.brandonlocke.xyz](https://nerdle.brandonlocke.xyz). Each day, all players get the same puzzle — a video game term, character, title, or location stripped of separators and hidden behind an 8-tile grid. Guess the letters in 6 tries.

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: CSS Modules with system dark mode via `prefers-color-scheme`
- **Word list**: Plain `.txt` file, one entry per line, loaded at build time
- **Persistence**: `localStorage` for daily progress and historical stats
- **Screenshot**: `html2canvas` for end-of-game result image generation
- **Hosting**: Fly.io (`min_machines_running = 0`), served as a static site via a lightweight container
- **DNS**: Namecheap → `nerdle.brandonlocke.xyz`

## How It Works

- The answer list is a plain text file (`words.txt`) with one canonical entry per line (e.g. `PAC-MAN`, `LINK`, `HALF-LIFE`)
- Each day's answer is selected by seeding a deterministic random function with the current UTC date — no backend required, same word for every player on the same day
- Guesses are letter-only (4–8 characters); any valid string of that length is accepted
- Separators (spaces, hyphens) are stripped from both the guess and the answer before comparison — `PACMAN`, `PAC MAN`, and `PAC-MAN` all match the same answer
- Feedback is given per letter: correct position (green), wrong position (yellow), not in answer (gray)
- Progress for the current day and all historical stats are stored in `localStorage`

---

## Epics

1. [Project Setup & Infrastructure](#epic-1-project-setup--infrastructure)
2. [Word List & Answer Engine](#epic-2-word-list--answer-engine)
3. [Core Game UI](#epic-3-core-game-ui)
4. [Game Logic](#epic-4-game-logic)
5. [Persistence & Stats](#epic-5-persistence--stats)
6. [End-of-Game Experience](#epic-6-end-of-game-experience)
7. [Polish & Accessibility](#epic-7-polish--accessibility)
8. [Deployment](#epic-8-deployment)

---

## Epic 1: Project Setup & Infrastructure

Establish the project scaffold, tooling, and repository structure so all future development has a consistent foundation.

### Story 1.1 — Scaffold React + Vite project

Set up a new Vite project with the React template. Remove all boilerplate content (default CSS, placeholder components, demo assets). Confirm `npm run dev` serves the app locally and `npm run build` produces a `dist/` folder.

**Acceptance criteria:**
- `npm run dev` starts the dev server with HMR in under 2 seconds
- `npm run build` produces a `dist/` directory with no errors
- No Vite/React boilerplate content remains (no spinning logo, no counter demo)
- `.gitignore` excludes `node_modules/`, `dist/`, and `.env*`

### Story 1.2 — Configure CSS Modules and global styles

Set up CSS Modules as the styling strategy. Create a `global.css` that defines CSS custom properties for the color palette (tile colors, backgrounds, text) in both light and dark themes using `prefers-color-scheme`. All color values in the app must reference these variables — no hardcoded hex values in component styles.

**Acceptance criteria:**
- `global.css` is imported once in `main.jsx` and applies to the whole app
- CSS custom properties defined for: background, surface, text primary, text secondary, correct (green), present (yellow), absent (gray), border, and key colors
- Dark mode values defined under `@media (prefers-color-scheme: dark)` and visually verified
- A CSS Module file (`.module.css`) is used for at least one component to confirm the pattern works

### Story 1.3 — Add `words.txt` and a loader utility

Create `public/words.txt` with an initial seed list of at least 50 video game terms (characters, titles, locations, items). One canonical entry per line, using the preferred separator style (e.g. `PAC-MAN`, `HALF-LIFE`, `LINK`). Write a utility function `loadWords()` that fetches the file at runtime, splits by newline, trims whitespace, and filters blank lines. Export the result as a string array.

**Acceptance criteria:**
- `words.txt` contains at least 50 entries, all video game related
- Entries range from 4 to 8 characters when separators are stripped
- `loadWords()` returns a Promise resolving to a string array
- Empty lines and trailing whitespace are filtered out
- Function is covered by at least one unit test (happy path + empty line handling)

### Story 1.4 — Set up path aliases and project structure

Configure Vite path aliases so imports use `@/components/...`, `@/utils/...`, etc. rather than relative paths. Establish the top-level folder structure.

```
src/
  components/
  hooks/
  utils/
  styles/
  App.jsx
  main.jsx
public/
  words.txt
```

**Acceptance criteria:**
- `@/` alias resolves to `src/` in both Vite config and any editor (jsconfig.json or tsconfig.json paths)
- Folder structure matches the spec above
- An import using `@/utils/loadWords` resolves correctly at runtime

---

### Epic 1 Acceptance Gate

> The project runs locally with `npm run dev`, builds cleanly with `npm run build`, has no boilerplate content, resolves path aliases, loads `words.txt` successfully, and renders a blank app with correct light/dark background colors driven by system preference.

---

## Epic 2: Word List & Answer Engine

Implement the logic that selects today's answer from the word list using a deterministic, date-seeded approach requiring no backend.

### Story 2.1 — Implement date-seeded word selection

Write a utility `getTodaysAnswer(words: string[]): string` that takes the loaded word list and returns a deterministic answer based on the current UTC date. Use a simple seeded hash of the date string (YYYY-MM-DD) to produce a stable index into the word array. The same date must always return the same word for any player.

**Acceptance criteria:**
- Given the same date and the same word list, `getTodaysAnswer` always returns the same word
- Changing the date (even by one day) returns a different word
- The function does not rely on word list ordering being stable beyond array indexing (i.e. the seed maps to an index, not a value)
- Unit tests cover: consistent output for the same date, different output for adjacent dates, handles a single-word list

### Story 2.2 — Implement separator-normalizing comparator

Write a utility `normalizeWord(word: string): string` that strips all hyphens and spaces and uppercases the result. Write a second utility `wordsMatch(guess: string, answer: string): boolean` that normalizes both inputs before comparing. This is the single source of truth for all matching logic.

**Acceptance criteria:**
- `normalizeWord('PAC-MAN')` → `'PACMAN'`
- `normalizeWord('pac man')` → `'PACMAN'`
- `normalizeWord('PACMAN')` → `'PACMAN'`
- `wordsMatch('PAC MAN', 'PAC-MAN')` → `true`
- `wordsMatch('PACMAN', 'PAC-MAN')` → `true`
- `wordsMatch('MARIO', 'PAC-MAN')` → `false`
- All cases covered by unit tests

### Story 2.3 — Implement per-letter feedback engine

Write a utility `evaluateGuess(guess: string, answer: string): LetterResult[]` where `LetterResult` is `'correct' | 'present' | 'absent'`. Both inputs are normalized before evaluation. The function returns one result per letter in the normalized guess.

Logic must handle duplicate letters correctly: if the answer is `ZELDA` and the guess is `LLAMA`, the first `L` should be `correct` (position 1), the second `L` should be `absent` (the answer only has one `L` and it's already accounted for).

**Acceptance criteria:**
- Correct letter, correct position → `'correct'`
- Correct letter, wrong position → `'present'`
- Letter not in answer → `'absent'`
- Duplicate letter handling follows the "mark correct first, then present up to remaining count" rule
- Unit tests cover: all-correct, all-absent, mixed, duplicate letters in guess, duplicate letters in answer

### Story 2.4 — Implement guess validation

Write a utility `validateGuess(guess: string): { valid: boolean; reason?: string }` that checks whether a guess is acceptable before it's submitted. A guess is valid if its normalized form is between 4 and 8 characters (inclusive) and contains only letters (A–Z, case-insensitive) after normalization. Separators are stripped before the length check.

**Acceptance criteria:**
- Normalized length < 4 → invalid, reason: `'too_short'`
- Normalized length > 8 → invalid, reason: `'too_long'`
- Contains non-letter characters after normalization → invalid, reason: `'invalid_characters'`
- Valid 4–8 letter string → `{ valid: true }`
- Unit tests cover all branches

---

### Epic 2 Acceptance Gate

> Given any word list and any date, the app can deterministically select today's answer, normalize and compare guesses to it, evaluate per-letter feedback correctly (including duplicates), and validate that a guess is an acceptable length — all verified by passing unit tests.

---

## Epic 3: Core Game UI

Build the visual components of the game board: the tile grid, the on-screen keyboard, and the header.

### Story 3.1 — Build the Header component

Create a `Header` component displaying the game title "Nerdle" and a stats icon button (opens stats modal, built in Epic 5). The header should be fixed at the top with a bottom border. Title is centered. Stats icon is right-aligned.

**Acceptance criteria:**
- Title "Nerdle" is centered and uses the primary heading style
- Stats icon button is present and keyboard-focusable (aria-label: "View stats")
- Header has a visible bottom border in both light and dark mode
- Component accepts an `onStatsClick` prop that is called when the stats icon is pressed

### Story 3.2 — Build the Tile component

Create a `Tile` component representing a single letter cell. It accepts: `letter` (string | undefined), `state` (`'correct' | 'present' | 'absent' | 'filled' | 'empty'`), and `reveal` (boolean). States map to colors:

- `empty` — default border, no background
- `filled` — border darkens, letter shown, no color yet (current guess being typed)
- `correct` — green background, white letter
- `present` — yellow background, white letter
- `absent` — gray background, white letter

When `reveal` is true, the tile plays a flip animation as it transitions from `filled` to its result state. Each tile in a row flips with a staggered delay based on its index.

**Acceptance criteria:**
- All 5 visual states render correctly in both light and dark mode
- Flip animation plays when `reveal` transitions to `true`
- Stagger delay is applied via a CSS custom property or inline style driven by the tile's index prop
- Tile is always square; letter is centered horizontally and vertically
- No letter shown when `letter` is undefined

### Story 3.3 — Build the Board component

Create a `Board` component that renders a 6-row × 8-column grid of `Tile` components. It accepts the full game state: `guesses` (array of submitted guess+result pairs), `currentGuess` (string being typed), and `currentRow` (index of the active row).

Rows 0 through `currentRow - 1` are submitted rows and show their result states with reveal animations. The current row shows `currentGuess` letters as `filled` tiles and remaining tiles as `empty`. Rows below the current row are all `empty`.

**Acceptance criteria:**
- Renders exactly 6 rows × 8 columns at all times
- Submitted rows display correct tile states and trigger flip animations
- Current row updates live as `currentGuess` changes
- Future rows are all empty tiles
- Board is centered horizontally on all screen sizes
- Tiles are evenly spaced with a small gap; the full board fits on a 375px wide mobile screen without horizontal scroll

### Story 3.4 — Build the Keyboard component

Create a `Keyboard` component rendering an on-screen QWERTY keyboard with three rows. Each key shows a letter and is colored based on the best result seen for that letter across all submitted guesses (`correct` > `present` > `absent` > unplayed). The keyboard accepts a `letterStates` map and `onKey` / `onDelete` / `onEnter` callbacks. A `DELETE` key and `ENTER` key are included.

**Acceptance criteria:**
- Three rows: `QWERTYUIOP`, `ASDFGHJKL`, `ENTER ZXCVBNM DELETE`
- Key colors reflect best-seen state for each letter across all guesses
- Unplayed keys use the default key background
- `onKey(letter)`, `onDelete()`, and `onEnter()` callbacks fire on tap/click
- Physical keyboard events (keydown) are wired up in the parent and delegate to these same callbacks
- Keys are large enough to tap on mobile (min 40px tall)

---

### Epic 3 Acceptance Gate

> A fully static rendering of the game is visible: a header with title and stats button, a 6×8 board with correct tile states and flip animations, and a color-coded QWERTY keyboard. The layout is usable on a 375px mobile screen and looks correct in both light and dark mode. No game logic is wired yet — props can be hardcoded for visual verification.

---

## Epic 4: Game Logic

Wire all game state together into a playable game loop using a custom React hook.

### Story 4.1 — Build `useGameState` hook

Create a `useGameState` hook that owns all game state and exposes it to the UI. It loads the word list, derives today's answer, and manages:

- `guesses`: array of `{ word: string; results: LetterResult[] }` for submitted guesses
- `currentGuess`: string being typed
- `gameStatus`: `'playing' | 'won' | 'lost'`
- `letterStates`: map of letter → best-seen `LetterResult` (for keyboard coloring)
- `addLetter(letter)`, `deleteLetter()`, `submitGuess()` actions

The hook hydrates from `localStorage` on mount (today's progress only) and persists state on every change (Epic 5 handles the full persistence schema).

**Acceptance criteria:**
- Hook initializes with today's answer from `getTodaysAnswer`
- `addLetter` appends to `currentGuess` up to 8 normalized characters
- `deleteLetter` removes the last character from `currentGuess`
- `submitGuess` validates the guess, runs `evaluateGuess`, appends to `guesses`, clears `currentGuess`, and updates `letterStates`
- After 6 guesses without a win, `gameStatus` → `'lost'`
- On a correct guess, `gameStatus` → `'won'`
- Invalid guess triggers an error state (too short, too long) without consuming a guess
- Hook is the single source of truth; no game logic lives in components

### Story 4.2 — Wire keyboard input (physical + on-screen)

In `App.jsx`, attach a `keydown` event listener that maps physical key presses to `addLetter`, `deleteLetter`, and `submitGuess`. Ignore input when `gameStatus` is not `'playing'`. Pass the same callbacks to the `Keyboard` component.

**Acceptance criteria:**
- Letter keys (A–Z, case-insensitive) call `addLetter`
- `Backspace` calls `deleteLetter`
- `Enter` calls `submitGuess`
- All other keys are ignored
- Input is disabled (no-op) when `gameStatus` is `'won'` or `'lost'`
- Event listener is cleaned up on unmount

### Story 4.3 — Invalid guess feedback (shake animation)

When `submitGuess` is called with an invalid guess (too short, too long), the current row shakes to signal the error. Display a small toast message above the board with the reason ("Too short", "Too long"). The toast auto-dismisses after 1.5 seconds.

**Acceptance criteria:**
- Invalid guess triggers a CSS shake animation on the current row
- A toast message appears with the relevant reason string
- Toast disappears automatically after 1.5 seconds
- No guess is consumed and `currentGuess` is unchanged
- Animation and toast do not interfere with each other if triggered in quick succession

### Story 4.4 — Win/loss state

When the game ends (win or loss), disable all input and trigger the end-of-game modal (built in Epic 6). On a win, the correct row tiles play a brief bounce animation after the flip completes. On a loss, no bounce — the answer is revealed in the modal.

**Acceptance criteria:**
- Win: correct row tiles bounce sequentially after flip animation completes
- Loss: no bounce animation; board remains as-is
- All keyboard input (physical and on-screen) is disabled after game ends
- End-of-game modal opens automatically after a short delay (800ms) following the last tile flip

---

### Epic 4 Acceptance Gate

> The game is fully playable end-to-end: a player can type or tap letters, submit guesses, see correct tile colors and keyboard updates, receive feedback on invalid guesses, and reach a win or loss state. The game correctly handles duplicate letters. Today's in-progress state survives a page refresh.

---

## Epic 5: Persistence & Stats

Save today's game state and accumulate historical stats in `localStorage`.

### Story 5.1 — Define localStorage schema

Document and implement the full `localStorage` schema. Two keys are used:

**`nerdle_daily`** — today's progress (reset each new day):
```json
{
  "date": "2025-06-27",
  "guesses": [
    { "word": "MARIO", "results": ["absent", "present", "correct", "absent", "absent"] }
  ],
  "currentGuess": "",
  "gameStatus": "playing"
}
```

**`nerdle_stats`** — historical performance (never reset):
```json
{
  "gamesPlayed": 42,
  "gamesWon": 35,
  "currentStreak": 4,
  "bestStreak": 11,
  "guessDistribution": { "1": 2, "2": 5, "3": 10, "4": 9, "5": 6, "6": 3 }
}
```

Write `loadDailyState()`, `saveDailyState()`, `loadStats()`, and `saveStats()` utilities.

**Acceptance criteria:**
- Both schema shapes are written and exported as TypeScript types or JSDoc typedefs
- `loadDailyState()` returns `null` if no data exists or if the stored date doesn't match today
- `saveDailyState()` always writes the current UTC date alongside the state
- `loadStats()` returns a default zero-state object if no stats exist yet
- All four utilities handle `JSON.parse` errors gracefully (catch and return null/default)
- Unit tests cover: missing key, stale date, malformed JSON

### Story 5.2 — Hydrate game state from localStorage on mount

In `useGameState`, call `loadDailyState()` on mount. If a valid saved state exists for today, initialize `guesses`, `currentGuess`, and `gameStatus` from it rather than starting fresh. Rebuild `letterStates` from the saved guesses.

**Acceptance criteria:**
- Mid-game refresh restores exactly the same board state
- A completed game (won or lost) on refresh shows the completed board and opens the end-of-game modal after a short delay
- A saved state from a previous day is ignored (new game starts)
- `letterStates` is correctly rebuilt from saved guesses on hydration

### Story 5.3 — Persist daily state on every change

In `useGameState`, call `saveDailyState()` after every state change that modifies `guesses`, `currentGuess`, or `gameStatus`.

**Acceptance criteria:**
- After every letter typed, deleted, or guess submitted, `localStorage` is updated
- The saved state is always consistent with the in-memory state
- No extraneous writes (e.g. no save on mount, only on change)

### Story 5.4 — Update stats on game end

When `gameStatus` transitions to `'won'` or `'lost'`, load the current stats, update them, and save. On a win, increment `gamesPlayed`, `gamesWon`, `currentStreak`, and the appropriate `guessDistribution` bucket. On a loss, increment `gamesPlayed`, reset `currentStreak` to 0. Update `bestStreak` if `currentStreak` now exceeds it.

**Acceptance criteria:**
- Stats update exactly once per completed game
- Stats are not updated again if the player refreshes after the game is already complete (guard using `gameStatus` from saved daily state)
- `bestStreak` is updated correctly when a new streak surpasses it
- `guessDistribution` bucket for guess count N is incremented on win

### Story 5.5 — Build Stats modal

Create a `StatsModal` component that displays the player's historical stats. Sections:

1. Four summary metrics: Games Played, Win %, Current Streak, Best Streak
2. Guess distribution bar chart (rows 1–6, each bar proportional to that bucket's count, highlighted bar for today's result if game is complete)
3. If game is in progress or complete today, show a "Next Nerdle" countdown to midnight UTC

**Acceptance criteria:**
- Modal opens when the stats icon in the header is clicked
- Modal closes when clicking outside or pressing Escape
- All four metrics display correctly from `nerdle_stats`
- Distribution bars are proportional (widest bar = 100%, others scaled)
- Today's winning row is highlighted in the distribution (if applicable)
- Countdown updates every second and displays as `HH:MM:SS`
- Modal is accessible: focus is trapped inside, role="dialog", aria-modal="true"

---

### Epic 5 Acceptance Gate

> Game progress survives page refresh. Stats accumulate correctly across multiple completed games. A fresh-day visit always starts a new game. The stats modal displays accurate metrics and a live countdown. All localStorage operations handle corrupt or missing data gracefully.

---

## Epic 6: End-of-Game Experience

Build the result modal shown when the player wins or loses, including the screenshot share feature.

### Story 6.1 — Build the Result modal

Create a `ResultModal` component that appears when `gameStatus` is `'won'` or `'lost'`. It should display:

- Win: "You got it!" + the answer in its canonical form (e.g. `PAC-MAN`)
- Loss: "Better luck tomorrow!" + the answer revealed
- The player's guess count (or "X/6" on loss)
- A "Screenshot" button
- A "Stats" button that opens the Stats modal

**Acceptance criteria:**
- Modal opens automatically 800ms after the last tile flip completes
- Displays canonical answer (with original separators, e.g. `HALF-LIFE` not `HALFLIFE`)
- Win message and loss message are distinct
- "Screenshot" and "Stats" buttons are present and keyboard-focusable
- Modal is dismissible via Escape key (but not by clicking outside — player should not accidentally dismiss it)
- Modal is accessible: role="dialog", aria-modal="true", focus trapped

### Story 6.2 — Implement screenshot generation

When the "Screenshot" button is clicked, use `html2canvas` to capture a styled result card (not the whole page). The card should show:

- The Nerdle logo/title
- The date
- The guess grid represented as colored squares (no letters — preserves the spoiler-free Wordle convention)
- The guess count (e.g. `4/6`) or `X/6` for a loss

Render this card as a hidden DOM element sized for the capture, then trigger a download of the resulting PNG as `nerdle-YYYY-MM-DD.png`.

**Acceptance criteria:**
- Clicking "Screenshot" downloads a PNG file named `nerdle-YYYY-MM-DD.png`
- The PNG contains the title, date, colored square grid, and guess count
- Letters are not shown in the screenshot
- The colored squares match the in-game tile colors (green/yellow/gray)
- The card renders correctly in both light and dark mode (capture uses current theme)
- `html2canvas` is loaded as a dependency, not a CDN script

---

### Epic 6 Acceptance Gate

> On game completion, the result modal appears automatically with the correct message and canonical answer. The screenshot button downloads a clean PNG result card with colored squares, date, title, and guess count — no letters visible. The stats button opens the stats modal from within the result modal.

---

## Epic 7: Polish & Accessibility

Ensure the game is keyboard-accessible, screen-reader friendly, and feels polished on all devices.

### Story 7.1 — Keyboard accessibility audit

Audit all interactive elements (header buttons, keyboard keys, modal close buttons) for keyboard accessibility. Every interactive element must be reachable by Tab, activatable by Enter/Space, and have a visible focus ring.

**Acceptance criteria:**
- Tab order follows a logical visual order throughout the app
- All buttons have visible focus rings (not suppressed by `outline: none` without a replacement)
- The on-screen keyboard keys are not in the tab order (they are supplementary; physical keyboard is primary) — they use `tabIndex={-1}`
- Modal focus trap works correctly: Tab cycles within the modal, Shift+Tab cycles in reverse

### Story 7.2 — Screen reader support

Add appropriate ARIA attributes and live regions so screen reader users receive meaningful feedback.

**Acceptance criteria:**
- Board has `aria-label="Nerdle game board"`
- Each submitted row announces its result when revealed (use `aria-live="polite"` region that receives a text description like "Guess 3: MARIO — M absent, A present, R correct, I absent, O absent")
- Toast messages are announced via `aria-live="assertive"`
- Win/loss status is announced when game ends
- Stats modal has correct role and aria-label

### Story 7.3 — Mobile layout and touch polish

Verify and fix layout on small screens (375px width). Ensure no horizontal scroll, tiles are appropriately sized, and the keyboard is comfortably tappable.

**Acceptance criteria:**
- No horizontal scroll on 375px viewport
- Tile grid fits comfortably above the keyboard with no overlap
- On-screen keyboard keys are minimum 40px tall and 28px wide
- Touch tap targets meet 44×44px minimum for Delete and Enter keys
- Page does not zoom on input focus (meta viewport is set correctly)

### Story 7.4 — Add page metadata and favicon

Set the page title to "Nerdle", add an Open Graph title/description for link previews, and add a favicon.

**Acceptance criteria:**
- `<title>Nerdle</title>` in the document head
- `og:title` = "Nerdle", `og:description` = short description of the game
- Favicon is present and shows in browser tab (SVG or PNG, 32×32 minimum)
- Meta viewport tag is present: `width=device-width, initial-scale=1`

---

### Epic 7 Acceptance Gate

> The game is fully playable using only a keyboard. Screen reader users receive meaningful feedback on every guess. The layout is correct and comfortable on a 375px mobile screen. The page has a title, favicon, and Open Graph metadata.

---

## Epic 8: Deployment

Package and deploy the game to Fly.io, configure DNS, and verify the live site.

### Story 8.1 — Containerize as a static site

Create a `Dockerfile` that builds the Vite app and serves the `dist/` folder using a minimal static file server (e.g. `nginx:alpine`). The container should be as small as possible.

**Acceptance criteria:**
- `docker build` completes without errors
- `docker run -p 8080:80` serves the app locally at `localhost:8080`
- The container image is under 50MB
- `nginx.conf` includes a `try_files` rule so client-side routing (if ever added) doesn't 404

### Story 8.2 — Configure `fly.toml`

Create a `fly.toml` with:
- App name: `nerdle-brandonlocke`
- `min_machines_running = 0` (scale to zero when idle)
- Internal port matching the nginx config (80)
- Health check on `/`

**Acceptance criteria:**
- `fly.toml` is present and passes `fly config validate`
- `min_machines_running = 0` is set
- `fly deploy` completes successfully and the app is reachable on the `.fly.dev` domain

### Story 8.3 — Configure custom domain DNS

In Namecheap, add a CNAME record pointing `nerdle.brandonlocke.xyz` to the Fly.io app hostname. Add the custom domain in the Fly.io dashboard and verify the TLS certificate is issued.

**Acceptance criteria:**
- CNAME record: `nerdle` → `nerdle-brandonlocke.fly.dev` (or the assigned Fly hostname)
- TLS certificate is active in Fly.io dashboard (may take up to 15 minutes)
- `https://nerdle.brandonlocke.xyz` loads the app with a valid certificate
- HTTP redirects to HTTPS

### Story 8.4 — Verify production deployment

Smoke test the live site across devices and confirm all features work end-to-end in production.

**Acceptance criteria:**
- Game loads and is playable on desktop Chrome, Safari, and Firefox
- Game loads and is playable on iOS Safari and Android Chrome
- `localStorage` persists correctly across page refreshes on the live domain
- Screenshot download works in production
- Dark mode activates correctly based on system preference
- The site scales to zero after inactivity and cold-starts in under 3 seconds

---

### Epic 8 Acceptance Gate

> The game is live at `https://nerdle.brandonlocke.xyz` with a valid TLS certificate. It is reachable from desktop and mobile browsers, all game features work end-to-end, the Fly.io machine scales to zero when idle, and a cold start serves the page in under 3 seconds.

---

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npm run test

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Adding Words

Edit `public/words.txt`. One entry per line. Use the canonical form with preferred separators (e.g. `PAC-MAN`, `HALF-LIFE`). Entries must be 4–8 characters when separators are stripped. Rebuild and redeploy after changes.

## Deployment

```bash
fly deploy
```

Fly.io will build the Docker image, push it, and swap the machine. The custom domain and TLS are managed in the Fly.io dashboard.
