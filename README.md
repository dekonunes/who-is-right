# Who Is Right?

**Who Is Right?** is a playful AI-powered web app for settling everyday arguments. Users describe a situation, write both sides of the story, and get a short verdict from an AI judge designed for entertainment-first debate resolution.

Live site: [https://whoisright.app/](https://whoisright.app/)

## What The Software Does

Who Is Right? turns small disagreements into a lightweight product experience:

- Pick the relationship context: couple, friends, mom and child, siblings, co-workers, or boss and employee.
- Enter the debate topic and each person's version of events.
- Choose the response style: `funny` or `serious`.
- Send the debate to the backend and receive an AI-generated verdict.
- View a structured result that summarizes the situation, both perspectives, and the final decision.

The product is positioned as a fun internet utility, not a truth engine. The app explicitly warns users that verdicts are for entertainment only and should not be treated as legal, medical, romantic, or real-world advice.

## Why It Exists

Who Is Right? is built as a shareable consumer web app around a simple idea: people love asking a neutral third party to break a tie. The software packages that behavior into a fast, mobile-friendly experience with character-led visuals, animated interactions, and a humorous AI judge.

If you want the shortest version of the pitch: **Who Is Right? helps people turn arguments into content, laughter, and a verdict in a few clicks.** Try it at [https://whoisright.app/](https://whoisright.app/).

## Current Product Features

- AI verdict generation powered by Gemini on the backend
- Two tone modes: `funny` and `serious`
- Multiple debate scenarios for different relationship dynamics
- Multi-language UI support: English, Portuguese, Spanish, Turkish, and German
- Responsive React interface with animated transitions
- Shareable, structured result display
- Basic abuse controls through input sanitization and a client-side daily usage cap
- Firebase Hosting, Analytics, and Cloud Functions integration

## How It Works Technically

### Frontend

- React 19 + TypeScript + Vite
- React Router for language-aware routes
- i18next for translations
- GSAP for motion and transitions
- Firebase Analytics for usage tracking

### Backend

- Firebase Cloud Functions
- Google Gemini for generating verdicts
- Firestore for saving submitted debates and verdicts

The frontend sends the sanitized debate payload to the deployed backend endpoint. The backend builds a prompt based on the selected debate type and tone, requests a verdict from Gemini, stores the debate in Firestore, and returns the generated response to the UI.

## Product Notes

- The current UI enforces a 15-debate daily limit per browser using local storage.
- Inputs are sanitized before submission.
- The live experience is designed around playful debate resolution, not factual adjudication.
- The app currently uses the deployed backend endpoint already wired into the frontend.

## Local Development

### Prerequisites

- Node.js 22+ recommended for Firebase Functions compatibility
- npm
- Firebase CLI if you want to run emulators or deploy
- A Gemini API key for backend verdict generation

### Install

```bash
npm install
cd functions && npm install
```

### Environment Setup

Create a backend env file for the Firebase Functions runtime:

```bash
cp .env.example functions/.env
```

Then replace the contents with the variable actually used by the backend:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Notes:

- The current frontend does not rely on the `VITE_*` provider keys from `.env.example`.
- Firebase web config is currently committed in [`src/firebase.ts`](/Users/andrenunes/deko/who-is-right/src/firebase.ts).
- The frontend posts to the deployed backend URL already hardcoded in [`src/App.tsx`](/Users/andrenunes/deko/who-is-right/src/App.tsx).

### Run The App

Start the frontend:

```bash
npm run dev
```

Build the Firebase Functions code when working on the backend:

```bash
cd functions
npm run build
```

If you want to use Firebase emulators for functions work:

```bash
cd functions
npm run serve
```

## Deployment

Frontend hosting:

```bash
npm run build
firebase deploy --only hosting
```

Backend functions:

```bash
cd functions
npm run deploy
```

Additional deployment notes live in [`DEPLOYMENT.md`](/Users/andrenunes/deko/who-is-right/DEPLOYMENT.md).

## Project Structure

```text
.
├── src/                 # React app, UI components, translations, assets
├── public/              # Static files and SEO assets
├── functions/           # Firebase Functions backend and Gemini integration
├── SECURITY.md          # Security notes and current limitations
├── DEPLOYMENT.md        # Hosting and routing deployment notes
└── README.md            # Project overview
```

## Scripts

Root:

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint
- `npm run deploy` - build and deploy Firebase Hosting

Functions:

- `npm run build` - compile Cloud Functions TypeScript
- `npm run serve` - build and start Firebase emulators for functions
- `npm run deploy` - deploy Firebase Functions
- `npm run logs` - inspect deployed function logs

## Security And Privacy

Relevant docs:

- [`SECURITY.md`](/Users/andrenunes/deko/who-is-right/SECURITY.md)
- [`SEO_GUIDE.md`](/Users/andrenunes/deko/who-is-right/SEO_GUIDE.md)

Important current behavior:

- User inputs are temporarily stored so the app can save debates and support moderation and safety review.
- The README should be read alongside the in-app disclaimer: users should never submit sensitive or confidential information.
