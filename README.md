# Math Speed Racer

A mental arithmetic trainer for speed drills, in the style of flash anzan. The app reads a series of numbers out loud, one after another. The player adds them up in their head and types the total. Each round is timed and saved.

**Live demo:** https://www.rach.im/math-speed-racer/

## Features

- Settings for the number of sums, numbers per sum, digit count, share of negative numbers, delay between numbers and playback speed
- Numbers are spoken from recorded WAV clips
- A progress bar and per-session results
- Config and session history are saved in `localStorage`

## Tech stack

React 17 · Create React App

## Development

```bash
npm install
npm start          # dev server
npm run build      # production build, output renamed to docs/ for GitHub Pages
```
