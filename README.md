# MySpotter

MySpotter is an exercise companion for older adults and people recovering from injuries. It offers guided exercise pathways, step-by-step exercise instructions with cited sources, safety guidance, and webcam-based rep counting with form feedback.

Ky, Reese, Hamida, and Stephanie built it for the **WhitHack 2026** hackathon. The prompt came from **MultiCoreWare** in Walla Walla, WA.

> **Health disclaimer:** MySpotter provides general information, not medical advice. The injury-recovery content tells users to exercise only with approval from their doctor or physical therapist and to stay within a pain-free range.

## Features

- **Browse and filter.** Search pathways and exercises, and filter them by:
  - difficulty
  - category: Balance, Strength, Flexibility, Mobility, Cardio
  - focus: For Seniors, For Injury Recovery
  - program length, using a min–max range slider

  You can sort by length, difficulty, or name.
- **Pathways.** Multi-week programs (4–6 weeks) with a day-by-day calendar of exercises and break days. They cover seven programs:
  - balance
  - upper-body strength
  - flexibility
  - knee and leg recovery
  - shoulder and arm recovery
  - hip recovery
  - everyday injury prevention

  The Strength pathways have a **Back injury alternatives** toggle that swaps in gentler exercises.
- **Exercise cards.** Each exercise has:
  - a description and the equipment needed
  - numbered instructions
  - a video link
  - links to its sources (NIA, NHS, AAOS, MedlinePlus, and others)
  - a safety screen before you begin
- **Pose tracking (web).** Webcam rep counting and live form feedback using MediaPipe Pose. Supported exercises: Squat, Push-up, Sit-to-Stand, and Gentle Elbow Bends. Optional spoken feedback is available.
- **Therapy plan import.** Upload a therapy plan (PDF on web, or a text file), review the exercises and dosage pulled from it, and save the plan on the device.
- **Daily affirmation.** A random quote in the top bar each time the app opens.
- **Responsive layout.** A sidebar layout on desktop and a stacked layout with collapsible filters on phones.

## Tech stack

- [Expo](https://expo.dev) SDK 57 and React Native 0.86, with TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation, with pop-up sheets for pathways and exercises
- [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) for pose detection in the browser
- `pdfjs-dist` for reading PDF therapy plans on web
- `expo-speech`, `expo-document-picker`, `expo-web-browser`, `expo-image`, and AsyncStorage

## Getting started

You need [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npx expo start
```

From the Expo CLI, press `w` to open the web version, or scan the QR code with [Expo Go](https://expo.dev/go) on your phone.

> Webcam pose tracking currently works **only in a web browser** (`npm run web`). On iOS and Android, the workout screen shows a message saying it isn't available yet.

Before committing, run the linter and type checker:

```bash
npx expo lint
npx tsc --noEmit
```

## Adding content

You can add exercises, pathways, and affirmations by editing JSON. No code changes are needed.

### Exercises and pathways: `src/data/content.json`

Only `name` is required. Ids are generated from names, so "Push-Up" becomes `push-up`. Pathway schedules list exercise names by day: a single name, a list of names for several exercises that day, or `"rest"` for a break day.

```json
{
  "exercises": [
    {
      "name": "Wall Push-Ups",
      "category": "Strength",
      "difficulty": "Beginner",
      "specialties": ["For Seniors"],
      "description": "A gentle, standing version of a push-up done against a wall.",
      "equipment": [],
      "instructions": ["Face a wall...", "Lean forward..."],
      "videoUrl": "https://www.youtube.com/watch?v=...",
      "sources": [{ "title": "National Institute on Aging – ...", "url": "https://..." }],
      "safety": "Move slowly and smoothly..."
    }
  ],
  "pathways": [
    {
      "name": "Strength Foundations",
      "description": "Upper-Body Strength · Track A ...",
      "difficulty": "Beginner",
      "specialties": ["For Seniors"],
      "schedule": [["Wall Push-Ups", "Chair Dip"], "rest", "rest", ["Wall Push-Ups", "Chair Dip"], "rest", "rest", "rest"],
      "alternatives": { "label": "Back injury alternatives", "exercises": ["Pendulum Swings"] }
    }
  ]
}
```

- A pathway's length comes from its schedule.
- A pathway's tags combine its own tags with tags taken from its exercises: every category among them, and any specialty that all of them share.
- The allowed tag values are defined at the top of `src/data/content.ts`.
- While the dev server is running, typos or unknown exercise names show a warning in the console.

### Affirmations: `src/data/affirmations.json`

A plain list of strings. One is picked at random each time the app opens.

### Pose tracking for a new exercise: `src/components/pose/exercises/`

Create a file like `sitToStand.tsx` that defines the joints to track and the angles that count as one rep. Then add it to the list in `index.tsx`.

## Project structure

```
src/
  app/                  Screens (Expo Router: every file is a route)
    index.tsx           Home: filters, sort, and the Browse grid
    pathway/[id].tsx    Pathway pop-up with calendar
    exercise/[id]/      Exercise pop-up and its safety screen
    pose.tsx            Webcam workout with rep counting
    safety.tsx          General safety guidelines
    therapy-plan/       Upload, review, confirm, and session screens
  components/           Reusable UI (cards, calendar, tags, range slider, sheet)
    pose/               Camera, pose analysis, and exercise detectors
  data/                 content.json, affirmations.json, and their loaders
  lib/                  Storage and therapy plan parsing
  constants/            Theme colors, spacing, and the logo
```

## Team

Built by **Ky**, **Reese**, **Hamida**, and **Stephanie** at WhitHack 2026, in response to a prompt from MultiCoreWare (Walla Walla, WA).
