# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Who Is Right?" is a React web application that uses Google's Gemini AI to settle playful debates between two people. Users submit a question and two competing answers, and the AI generates an entertaining verdict. The app is deployed on Firebase Hosting with serverless Cloud Functions handling the AI integration.

## Architecture

### Frontend (React + Vite)
- **Main App Component** (`src/App.tsx`): Central component managing form state, validation, API calls, and routing
- **User Type System**: Six debate types (couple, friends, mom_and_child, siblings, co_workers, boss_and_employee) each with custom labels, placeholders, and character images
- **Internationalization**: Uses react-i18next with support for English, Portuguese (pt-BR), and Spanish
- **Analytics**: Firebase Analytics integration tracking page views, scroll depth, user type selection, and submission events
- **Rate Limiting**: Client-side daily limit of 15 free debates per day stored in localStorage
- **Lazy Loading**: ResultDisplay, HowItWorks, and AmazonRecommendations components are lazy-loaded for better performance
- **Animations**: GSAP animations for user type selection and UI transitions

### Backend (Firebase Cloud Functions)
- **saveDebate Function** (`functions/src/index.ts`): HTTP function that receives debate submissions, calls Gemini API, saves to Firestore, and returns the verdict
- **getGeminiVerdict**: Uses Gemini 3 Flash Preview model with custom prompts tailored to each debate type and tone preference
- **CORS Configuration**: Allows requests from localhost, Firebase hosting domains, and custom domain (whoisright.app)
- **Speaker Translation**: Translates speaker names (Woman/Man, Mom/Child, etc.) based on the selected language

### Data Flow
1. User fills form (question + two answers) and selects debate type and tone (funny/serious)
2. Frontend validates inputs using `src/utils/security.ts` utilities
3. Frontend checks daily limit (localStorage-based)
4. POST request to Cloud Function with sanitized inputs
5. Cloud Function calls Gemini API with language-specific prompts
6. Gemini returns formatted verdict with structure: Situation → Person 1 → Person 2 → Verdict
7. Function saves debate to Firestore and returns verdict to frontend
8. Frontend displays verdict with structured markdown parsing

### Styling
- Uses Tailwind CSS for utility classes
- Styled Components for complex component styling
- Custom color scheme: Dark background (#131c20), accent blue (#add6ea), dark sections (#293a42)
- Responsive design with mobile-first approach

## Development Commands

### Frontend
```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run build:analyze # Build with bundle analysis
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run deploy       # Build and deploy to Firebase Hosting
```

### Backend (Cloud Functions)
```bash
cd functions
npm run build        # Compile TypeScript
npm run build:watch  # Compile in watch mode
npm run serve        # Start Firebase emulators
npm run deploy       # Deploy functions to Firebase
npm run logs         # View function logs
```

## Key Technical Details

### Input Validation and Security
- All user inputs are sanitized via `sanitizeInput()` which removes script tags, event handlers, and dangerous patterns
- Character limits: Questions (500 chars), Answers (300 chars each)
- Minimum length: 5 characters for all fields
- Valid debate types are enforced on both client and server

### Gemini AI Integration
- Model: `gemini-3-flash-preview`
- API key stored in Firebase Functions config or environment variable
- Prompts include critical operational rules to:
  - Detect and respond in the same language as inputs
  - Never give legal, medical, or relationship advice
  - Always pick a winner (no ties allowed)
  - Format responses with bold section headers
  - Adapt tone based on user preference (funny vs serious)

### Translation System
- Language detection happens automatically in Gemini prompts
- Speaker names are translated via `SPEAKER_TRANSLATIONS` mapping
- UI translations use i18next with JSON files in `src/locales/{lang}/`

### Build Optimization
- Manual code splitting: vendor (React), router, i18n, and ui chunks
- Terser minification with console removal
- Asset organization: images, fonts, and other assets sorted into separate directories
- Bundle analysis available via `npm run build:analyze`

### Firebase Configuration
- Hosting serves static build from `dist/`
- SPA routing via rewrites to index.html
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Aggressive caching for static assets (1 year), no-cache for index.html
- Functions predeploy runs lint and build

## Important Conventions

### Component Structure
- Functional components with hooks (useState, useEffect, useMemo, useLayoutEffect)
- GSAP animations initialized in useLayoutEffect to prevent flash of unstyled content
- Analytics events logged at key user interactions
- Error boundaries not currently implemented but should be considered for production

### State Management
- Local component state (no global state management library)
- Form state, errors, and loading states managed in App component
- Memoized values for translated labels and placeholders to prevent unnecessary re-renders

### Type Safety
- TypeScript strict mode enabled
- Interfaces defined for props (e.g., MainAppProps, DebateRequest)
- Type checking for debate types using `isValidDebateType()`

### Firebase Firestore Schema
Debates collection:
```
{
  question: string
  answerA: string
  answerB: string
  type: string (debate type key)
  tone: "funny" | "serious"
  verdict: string (Gemini response)
  createdAt: Timestamp
}
```

## Common Modifications

When adding a new debate type:
1. Add entry to `userTypes` array in `src/App.tsx` with key, label, placeholders, and images
2. Add type to `isValidDebateType()` in `src/utils/security.ts`
3. Add prompt template in `prompts` object in `functions/src/index.ts`
4. Add speaker translations to `SPEAKER_TRANSLATIONS` for all supported languages
5. Add UI translations to all locale JSON files

When changing text limits or daily limits:
1. Update constants in `src/App.tsx` (QUESTION_MAX, ANSWER_MAX, DAILY_LIMIT)
2. Update corresponding UI validation messages
3. Consider updating Gemini prompts if context length changes significantly

When modifying Gemini behavior:
1. Edit prompt templates in `functions/src/index.ts`
2. Test both funny and serious tones
3. Test all three languages (en, pt-BR, es)
4. Verify structured output format is maintained
