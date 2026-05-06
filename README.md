# NutriMind 🥗
### Your AI-powered food intelligence layer

> *Most people don't fail at eating healthy because they lack willpower. They fail because they lack awareness.*

NutriMind is a smart nutrition assistant that puts Google's Gemini AI between you and your next meal — giving you instant, honest, personalised feedback before bad habits have a chance to stick.

---

## What Made Me Build This

I kept noticing the same pattern around me. People *want* to eat better. They download apps, follow influencers, buy meal plans. And then three weeks later they're back to where they started — not because they're lazy, but because none of those tools actually fit their life.

Calorie counting apps feel like homework. Nutritionists cost money most people don't have. Generic meal plans assume you eat like someone in California, not someone eating dal chawal in Delhi.

There's a gap between *"I want to eat better"* and *"I know exactly what better looks like for me, today, with what I actually have in my kitchen."*

NutriMind is built to close that gap. Not with a 30-page diet plan. With one meal at a time, one honest insight at a time, powered by an AI that actually knows who you are.

---

## Research & Problem Space

A few uncomfortable truths shaped this build:

- **Awareness beats willpower.** Studies consistently show that simply logging what you eat — regardless of any dietary changes — leads to better food choices. The act of paying attention changes behaviour. NutriMind makes that attention effortless.

- **Personalisation is the missing piece.** Generic advice ("eat more protein") is useless without context. The same breakfast means something completely different for someone trying to lose weight vs. someone training for a marathon. Every Gemini call in NutriMind carries the user's goal and dietary preference — so advice is never generic.

- **Consistency beats perfection.** People quit healthy eating after one bad meal because apps make them feel like they've failed. NutriMind tracks streaks and frames every interaction around progress, not perfection. One bad meal doesn't break a streak — skipping the reflection does.

- **Health data deserves real protection.** People share deeply personal information in nutrition apps — their weight, their conditions, their eating disorders. That data being stored in plaintext is not acceptable. This shaped the entire security architecture of NutriMind.

- **Accessibility in health tech is an afterthought.** Most health apps are built for able-bodied, tech-savvy users with fast internet. NutriMind was designed from the start to work for everyone — keyboard users, screen reader users, users on slow 4G connections in tier-2 cities.

---

## User Flow

```
📱 Land on app
      ↓
🔐 One-tap Google Login (Firebase Auth)
      ↓
🎯 Onboarding — 2 questions, one time only
   • What's your goal? (lose weight / build muscle / eat healthier / more energy)
   • Any dietary preferences? (none / vegetarian / vegan / gluten-free)
      ↓
🏠 Dashboard
   • Good morning greeting + streak count
   • Today's macro ring (calories / protein / carbs / fat)
   • Today's meal log
   • AI tip of the day (fresh every morning)
      ↓
🍽️ Log a Meal — two ways
   ┌─────────────────────────────────┐
   │  📝 Text        │  📷 Photo     │
   │  "dal rice      │  Upload image │
   │   and salad"    │  → Vision AI  │
   └─────────────────────────────────┘
      ↓
🔒 Security pipeline runs automatically
   • PII redacted from input
   • Safe prompt constructed with user context
      ↓
🤖 Gemini analyses the meal
   Returns: calories / protein / carbs / fat
            health score (1–10) / one actionable tip
      ↓
💾 Result encrypted → saved to Firestore
      ↓
📊 Dashboard updates live
      ↓
💬 AI Chat — ask anything, anytime
   "Is paneer good for weight loss?"
   "High protein breakfast ideas under 400 calories?"
   "How much water should I drink today?"
   → Gemini answers with your goal + preference as context
```

---

## Code Quality

The codebase is structured for a human to read, not just a machine to run.

**Folder structure — separation of concerns:**
```
src/
├── components/
│   ├── ui/              # shadcn base components
│   ├── MealCard.tsx     # single responsibility components
│   ├── MacroRing.tsx
│   ├── ChatMessage.tsx
│   └── ErrorBoundary.tsx
├── pages/
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   ├── Dashboard.tsx
│   └── Chat.tsx
├── lib/
│   ├── gemini.ts        # all AI logic in one place
│   ├── firebase.ts      # all DB calls in one place
│   ├── pii.ts           # redaction utility
│   └── crypto.ts        # encryption utility
└── hooks/
    └── useAuth.ts       # auth state in a clean hook
```

**Principles followed throughout:**
- Every component does one thing
- All Gemini calls go through `lib/gemini.ts` — no API calls scattered across components
- TypeScript strict mode — no `any`, no implicit types
- Path aliasing (`@/components`) for clean imports
- Consistent naming conventions throughout
- Comments on every non-obvious function explaining *why*, not just *what*

---

## Security

Health data is personal. This was non-negotiable.

**Layer 1 — PII Redaction**
Before any user input reaches Gemini, it passes through a redaction pipeline that strips personally identifiable information:
```
Aadhaar numbers → [AADHAAR]
Email addresses → [EMAIL]
Phone numbers   → [PHONE]
PAN numbers     → [PAN]
Credit cards    → [CARD]
```
The AI analyses food. It never sees personal details.

**Layer 2 — AES-256-GCM Encryption**
Every record written to Firestore is encrypted before it leaves the client. AES-256-GCM is the same standard used by banks and governments. GCM mode also provides tamper detection — if a stored record is modified, decryption fails loudly rather than silently returning corrupted data.

**Layer 3 — Firebase Auth + Firestore Rules**
Firestore security rules ensure users can only read and write their own documents. No user can access another user's meal logs, profile, or chat history — even with a valid auth token.

**Layer 4 — Environment Variables**
No API keys in the codebase. All secrets live in environment variables, injected at build time for the frontend and at deploy time for Cloud Run.

The `🔒 Secured` badge visible in the chat UI represents a real pipeline running on every single message.

---

## Efficiency

**Gemini Flash, not Pro** — Flash is faster and cheaper for structured output tasks like meal analysis. Pro is reserved for complex reasoning. Right tool, right job.

**Structured JSON responses** — every Gemini call requests a strict JSON response format. No parsing ambiguity, no retry logic needed for formatting errors, minimal tokens wasted.

**Firestore over SQL** — document-based storage maps directly to the data model (user → meal logs → fields). No joins, no schema migrations, reads are O(1) by document ID.

**React Query for caching** — dashboard data isn't re-fetched on every render. Cached and invalidated only when a new meal is logged. Users on slow connections don't wait unnecessarily.

**Nginx on Alpine** — the Docker image uses Nginx Alpine, one of the smallest possible production web server images. Fast cold starts on Cloud Run, minimal memory footprint.

**Cloud Run scales to zero** — no compute cost when the app isn't being used. Scales up automatically under load.

---

## Testing

**Functional validation:**
- All Gemini response shapes validated against TypeScript interfaces before rendering — malformed AI responses fail gracefully with a user-friendly error, not a crash
- Firestore writes verified with read-back confirmation before showing success state to the user
- Auth state tested across page refresh, tab close, and token expiry

**Edge cases handled:**
- Empty meal input → validation before API call
- Gemini timeout → loading state with retry option
- Image too large → client-side size check before upload
- No internet → offline banner, no silent failures
- First-time user with no meals → empty state with clear CTA, not a blank screen

**Error boundaries:**
- React Error Boundary wraps the entire app — any unhandled error shows a friendly recovery screen instead of a white page during a live demo or real use

---

## Accessibility

Built for everyone, not just the majority:

- **Keyboard navigation** — every interactive element reachable and operable without a mouse, in logical tab order
- **ARIA labels** — all icon buttons, inputs, and dynamic regions labelled for screen readers
- **Colour contrast** — monochromatic black-and-white palette exceeds WCAG AA contrast ratios (4.5:1 minimum) across all text sizes
- **Semantic HTML** — proper heading hierarchy, landmark regions (`<main>`, `<nav>`, `<section>`), no div-soup
- **Focus indicators** — visible focus rings on all interactive elements, not hidden for aesthetic reasons
- **Loading states** — every async action shows a skeleton or spinner so users on slow connections always know the app is working
- **Responsive layout** — fully functional from 375px (small Android phones) to 1440px (large desktop)
- **Reduced motion** — skeleton animations respect `prefers-reduced-motion` media query

---

## Google Services

Every Google service earns its place — nothing added just for points.

| Service | Integration | Why This One |
|---|---|---|
| **Gemini 1.5 Flash** | Meal analysis, daily tips, AI chat | Fast structured output, cost-efficient for high-frequency calls |
| **Gemini Vision** | Photo meal recognition | Multimodal — identifies food from images without extra APIs |
| **Firebase Auth** | Google login, session management | One-tap login, secure token management out of the box |
| **Firestore** | Meals, profiles, chat history | Real-time, document-based, maps perfectly to data model |
| **Firebase Hosting** | Frontend CDN deployment | Global edge network, instant cache invalidation on deploy |
| **Cloud Run** | Backend API, serverless | Scales to zero, containerised, integrates with gcloud natively |

The Gemini system prompt carries user context on every call:
```
You are NutriMind, a personal nutrition assistant.
User goal: {goal}. Dietary preference: {diet}.
Respond only in JSON: { meal_name, calories, protein_g,
carbs_g, fat_g, health_score, tip }
Be concise, practical, and encouraging. No medical claims.
```

---

## Real World Impact

In India, a single nutritionist consultation costs ₹500–2000. Most people go once, get generic advice, and never go back. The gap between "wanting to eat healthy" and "knowing how to eat healthy for your specific life" is a gap most people can't afford to close.

NutriMind doesn't replace a doctor. But it can be the thing available at 7am when you're deciding between two breakfast options, or at 11pm when you're wondering if that late dinner was a mistake. Instant, honest, personalised — and free.

The users this is built for aren't fitness enthusiasts with gym memberships. They're regular people who want to feel a little better, make slightly smarter choices, and build habits that actually stick. That's a much larger, much more underserved group.

---

## Assumptions

- Calorie and macro estimates are AI-generated approximations — not medical advice
- Image recognition works best with clear, well-lit photos of single meals
- Food descriptions in English and common transliterated Indian food names (dal, roti, sabzi) are handled well by Gemini
- Designed for adults aged 18–45 with basic smartphone literacy
- Active internet connection required — no offline mode in v1

---

## Local Setup

```bash
git clone https://github.com/yourusername/nutrimind
cd nutrimind
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

**.env.example**
```
VITE_GEMINI_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
ENCRYPTION_KEY=
```

---

*Built in 2 hours. Designed to outlast that.*
