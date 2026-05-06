NutriMind 🥗
A smart food & health assistant powered by Google Gemini
---
Chosen Vertical
Personal Nutrition Assistant — helping individuals make better food choices through AI-powered meal analysis, macro tracking, and contextual health guidance.
---
Approach & Logic
Most people don't fail at eating healthy because they lack willpower — they lack awareness. NutriMind puts AI in the loop at every step so the user is never making decisions blind.
The core logic:
User sets their goal (lose weight / build muscle / eat healthier) and dietary preference once at onboarding
That context is injected into every Gemini prompt — so responses are always personalised, never generic
Every meal input (text or photo) is analysed by Gemini and returned as structured data: calories, macros, health score, and one actionable tip
Data is stored encrypted in Firestore and builds up into a daily and weekly picture of the user's habits
The AI doesn't just answer questions — it nudges, tracks streaks, and generates fresh daily tips based on what the user has actually been eating.
---
How The Solution Works
1. Login — Google Auth via Firebase, one tap
2. Onboarding — user sets health goal + dietary preference (stored in Firestore, used in every AI call)
3. Log a meal — two ways:
Type it: "had dal rice and salad for lunch"
Photo: upload an image, Gemini Vision identifies the food
4. Gemini analyses the meal and returns:
```
calories / protein / carbs / fat / health score (1–10) / one tip
```
5. Dashboard updates with today's macro totals, meal log, streak count, and a daily AI-generated tip
6. AI Chat — open-ended food and health questions answered by Gemini with the user's goal and preferences as context
Security layer running throughout:
PII redacted from all inputs before reaching Gemini
All Firestore writes encrypted with AES-256-GCM
Google Services used:
Service	Usage
Gemini 1.5 Flash	Meal analysis, daily tips, chat
Gemini Vision	Photo-based meal recognition
Firebase Auth	Google login
Firestore	Meals, profiles, chat history
Firebase Hosting	Frontend deployment
Cloud Run	Backend API
---
Assumptions
Calorie and macro estimates are AI-generated approximations — not medical advice
Works best with clear, single-meal photos for image recognition
Designed for adults who are self-motivated to improve their eating habits
Requires an active internet connection (no offline mode)
Food descriptions in English or simple transliterated Hindi (e.g. "dal chawal") are handled well by Gemini
---
Local Setup
```bash
git clone https://github.com/yourusername/nutrimind
cd nutrimind
npm install
cp .env.example .env
npm run dev
```
.env.example
```
VITE_GEMINI_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
```
