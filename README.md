<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

NutriMind 🥗
A smarter way to understand what you eat
Most people don't fail at eating healthy because they lack willpower. They fail because they lack awareness. I wanted to build something that sits between a meal and a habit — something that gives you instant, honest feedback without making you feel judged.
NutriMind is a personal nutrition assistant that uses Google's Gemini AI to analyse your meals, track your macros, and nudge you toward better choices — one meal at a time.
---
The Thought Behind It
I started with a simple question: why do people give up on eating healthy?
The answer almost always comes down to friction. Calorie counting apps are tedious. Nutritionists are expensive. Generic meal plans don't account for how you actually live. There's a gap between "I want to eat better" and "I know how to eat better for me."
The goal was to make that gap disappear. You tell NutriMind what you ate — or just take a photo — and it tells you what that means for your body, your goal, and your day. No spreadsheets. No subscriptions. Just a conversation.
---
Research & Problem Space
A few things shaped the design:
Most nutrition apps are built around logging, not learning. Users burn out because the app makes them feel like accountants, not people.
Personalization is the missing piece. Generic advice ("eat more protein") lands differently when the AI knows you're vegetarian and trying to build muscle.
Consistency beats perfection. A streak of small, informed choices matters more than one perfect diet day. So the app tracks streaks and sends daily nudges — not guilt, just momentum.
Trust matters in health apps. People share sensitive information — their weight, their health goals, what they eat. That data deserves to be handled carefully. So every piece of user data is encrypted before it ever touches the database.
---
How It Works
1. You set your context once
On onboarding, you pick your health goal (lose weight, build muscle, eat healthier, more energy) and any dietary preferences (vegetarian, vegan, gluten-free, none). That context travels with every single AI call — so Gemini always responds with you in mind, not a generic user.
2. You log a meal — however is easiest
Type it out: "had poha with chai for breakfast"
Take a photo and let Gemini Vision figure out the rest
3. Gemini does the heavy lifting
The meal gets run through a structured Gemini prompt that returns calories, macros (protein / carbs / fat), a health score out of 10, and one practical tip. Not overwhelming. Just enough to learn something.
4. Everything builds over time
Meals stack up in your daily log. The dashboard shows your macro progress. A streak counter rewards consistency. A daily AI tip is generated fresh each morning based on what you've been eating.
5. You can ask anything
The AI chat lets you go deeper — "is paneer good for weight loss?", "give me a high protein Indian breakfast idea", "how much water should I drink today?" — and Gemini answers with your goal and preferences baked in.
---
User Flow
```
Login with Google
      ↓
Onboarding — set goal + dietary preference (one time)
      ↓
Dashboard — today's calories, macros, streak, AI tip
      ↓
Log a meal (text or photo)
      ↓
  → PII redaction runs on input
  → Gemini analyses the meal
  → Result: calories, macros, health score, tip
      ↓
Save to log → encrypted write to Firestore
      ↓
Dashboard updates live
      ↓
AI Chat available anytime for food questions
```
---
Google Tools & Why Each One
Tool	Why it's here
Gemini 1.5 Flash	Core intelligence — meal analysis, daily tips, chat responses
Gemini Vision	Recognises food from photos so users don't have to type
Firebase Auth	Google login — one tap, no passwords, secure sessions
Firestore	Stores meals, user profiles, chat history in real time
Firebase Hosting	Fast, global CDN deployment for the React frontend
Google Cloud Run	Serverless backend — scales to zero, costs nothing at rest
Gemini was the obvious choice for the AI layer — not just because of the hackathon context, but because Gemini Flash is genuinely fast for structured output, and the multimodal capability (Vision) meant image-based meal logging came almost for free.
Firestore made sense over a traditional database because the data model is document-based, which maps naturally to "a user has many meal logs, each log has many fields." No schema migrations, no overhead.
---
Security & Privacy
Health data is personal. I didn't want to treat security as an afterthought.
PII Redaction — before any user input reaches Gemini, it passes through a redaction layer that strips emails, phone numbers, Aadhaar numbers, and other identifiable patterns. The AI analyses food, not personal details.
AES-256-GCM Encryption — every meal log and user record is encrypted before it's written to Firestore. The same standard used by banks. If the database were ever compromised, the data would be unreadable without the key.
No data sold, no tracking — this is a hackathon project built to help people, not monetise them.
The `🔒 Secured` badge visible in the chat UI isn't just cosmetic — it represents a real pipeline running on every message.
---
Accessibility
Accessibility wasn't an afterthought — it was designed in from the start:
Keyboard navigable — every interactive element is reachable without a mouse
ARIA labels on all icon buttons and form inputs
Colour contrast — the black-and-white monochromatic palette was chosen partly because it exceeds WCAG AA contrast ratios out of the box
Screen reader friendly — semantic HTML throughout, no div-soup
Responsive layout — works on a 375px phone screen as well as a desktop
Loading states — every async action shows a skeleton or spinner so users with slower connections always know something is happening
---
Real World Impact
The honest answer is: most people in India don't have access to a nutritionist. A decent consultation costs ₹500–2000 and most people only go once. The advice they get is generic and doesn't account for what they actually eat day to day.
NutriMind won't replace a doctor. But it can be the thing that sits between "I want to be healthier" and actually becoming healthier — available at 2am when you're wondering if that plate of biryani was a mistake, or on a Tuesday morning when you want a high-protein breakfast idea that doesn't require a gym bro's supplement stack.
The goal is awareness, not perfection. Small, consistent, informed choices compound over time. This app is built to support that.
---
Assumptions
Calorie and macro estimates are AI-generated approximations — not medical advice
The app is designed for adults aged 18–45 who are self-motivated to improve their eating habits
Image recognition works best with clear, well-lit photos of single meals
Internet connection required (no offline mode in v1)
---
Local Setup
```bash
git clone https://github.com/yourusername/nutrimind
cd nutrimind
npm install
cp .env.example .env   # add your Gemini API key + Firebase config
npm run dev
```
```
VITE_GEMINI_API_KEY=your_key_here
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_FIREBASE_API_KEY=your_key_here
```
---
Built in 2 hours. Designed to last longer than that.
