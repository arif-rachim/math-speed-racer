# Math Speed Racer

Math Speed Racer is a browser-based mental arithmetic trainer for speed drills in the style of flash anzan, the abacus-school exercise where numbers are called out one after another and the student adds them up in their head. It was built in early 2021 for anyone practising this kind of drill. Each session is a list of sums; for every sum the app plays a recorded WAV clip for each number and flashes it in large type on the screen, then waits for the player to type the total. The answer and the time taken are recorded, and at the end the app shows a score as a percentage with a per-sum table of the numbers, the answer given, the correct answer and the duration. Everything runs client-side as a Create React App (React 17) project, with session history kept in the browser's `localStorage` and the production build published to GitHub Pages.

> Prototype, built in January 2021. Not actively maintained.

**Live demo:** https://www.rach.im/math-speed-racer/

## Features

- Sessions of randomly generated sums: each number has a fixed digit count, no number repeats within a sum, and the running total never drops to zero or below
- Numbers are both spoken (pre-recorded clips `public/audio/1.wav` to `999.wav`) and shown full-screen, with a configurable pause between numbers and audio playback rate
- A progress bar across the top of the session
- Score page with the percentage correct, session date, and a table of each sum, the answer given versus the correct total, and the time taken in milliseconds
- "Prev Score" / "Next Score" buttons to browse past sessions
- An unfinished session is resumed on the next start, with new sums generated for the unanswered ones
- Config and session history are saved in `localStorage` (`speed-racer-config`, `speed-racer-sessions`)

Default settings (in `DEFAULT_CONFIG` in `src/comp/App.js`): 30 sums, 4 numbers per sum, 3 digits, 0% negative numbers, 500 ms between numbers, playback rate 1.2. There is no settings screen; change the defaults in code, or edit the `speed-racer-config` value in `localStorage`.

## Tech stack

React 17 · Create React App (react-scripts 4) · CSS Modules · HTML5 audio

## Getting started

Prerequisites: Node.js and npm.

```bash
npm install
npm start          # dev server
npm run build      # production build, then renames build/ to docs/ for GitHub Pages
```

The build script uses `rename build docs`, which is the Windows `rename` command. On macOS or Linux, run `npx react-scripts build && mv build docs` instead (delete the old `docs/` first).

## Project structure

```text
src/index.js              entry point
src/comp/App.js           config and session storage, score page, session history
src/comp/Session.js       sum generation, audio playback, answer input
public/audio/             spoken number clips (1-999) plus minus.wav / minus.mp3
docs/                     committed production build served by GitHub Pages
```

## Limitations

- Negative numbers are only partly implemented. `negativePercentage` (a fraction from 0 to 1) makes some numbers negative, but no clip exists for them (the app requests `audio/-N.wav`), the extra minus-cue element points at `1.wav` and is never played, and `minus.wav` / `minus.mp3` are unused.
- The `homepage` field in `package.json` still points to an old GitHub Pages address; the live site is the URL above.
- There are no tests.
