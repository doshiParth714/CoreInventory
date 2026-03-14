# Inventra – Core Inventory

Local-only inventory app (no API, no database). Auth and data live in memory and localStorage.

## Logo

Place the Inventra logo at `public/logo.png` (transparent PNG). If the file is missing, the app shows an "INVENTRA" text fallback.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up on the signup page, then use login. Data persists in localStorage.

## Build

```bash
npm run build
npm start
```

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Three.js (@react-three/fiber, @react-three/drei) for animations.
