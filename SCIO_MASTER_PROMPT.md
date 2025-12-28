# 📘 SCIO_MASTER_PROMPT: Complete Specification for the Scio Pretotype Redesign

**Last Updated:** December 5, 2025

This document is the **single source of truth** for all Scio development decisions. Reference it when building features, making design decisions, or evaluating new ideas.

---

## Quick Navigation

1. [Product Philosophy](#-i-product-philosophy--what-scio-is) — What Scio is and its core values
2. [Core Learning Loop](#-ii-the-core-learning-loop) — The 4-step pedagogy
3. [Minimalist Design System](#-iii-scio-minimalist-design-system) — Layout, typography, colours, interactions
4. [Signature Features](#-iv-signature-zuck-features-required) — Prediction, interactive reading, highlight-to-explain, XP
5. [Analytics System](#-v-essential-analytics-system-only-what-matters) — Local, learning-focused metrics
6. [Page Specs](#-vi-page-by-page-redesign-spec) — Homepage and demo page requirements
7. [Component Specs](#-vii-mandatory-components-and-their-responsibilities) — All required components
8. [API Endpoints](#-viii-ai-endpoint-for-explanations) — AI explain endpoint design
9. [Learning Manifesto](#-ix-learning-first-manifesto--the-north-star) — The north star principle
10. [Copilot Guide](#-x-how-copilot-should-interpret-this-document) — How to use this document

---

## 🧠 I. PRODUCT PHILOSOPHY — What Scio Is

**Scio** ("I know" in Latin) is a minimalist, AI-powered learning platform that turns finance news into real understanding — preparing users for interviews and real-world thinking.

### Core Values

The product **must** be:

- **Classy** — Refined, sophisticated aesthetic
- **Minimalist** — Every pixel serves a purpose
- **Fast** — Instant feedback, no friction
- **Calm** — No FOMO, streaks, or notification spam
- **Intelligent** — AI-powered but not overbearing
- **Focused on learning, not dopamine** — No gamification fluff

### The Principle

> Every feature must contribute to actual, deep comprehension.
> 
> If it doesn't help a user understand something more deeply — do not implement it.

### What Scio Does

1. Takes real finance content (articles, news)
2. Activates learning with structured interaction
3. Produces real understanding
4. Builds real interview-ready skill

Scio's job is **understanding**, not engagement metrics.

---

## 🚀 II. THE CORE LEARNING LOOP

All product design and features must follow this **4-step pedagogical loop**:

### Step 1: **Prediction** 🎯
**Before reading**, users write a hypothesis about what the article will discuss or what outcome they predict.

- Activated via `<PredictionCard />`
- Users record their thinking before any content exposure
- Builds metacognitive awareness
- Analytics: `trackPredictionWritten()`

### Step 2: **Interactive Reading** 📖
Users read the article with multiple layers of **active learning**:

- Inline explanations for jargon
- `<InsightBox />` components for key concepts
- Improved tooltips (definition + example + interview relevance)
- `<InteractiveCheckpoint />` for real-time comprehension checks
- Highlight-to-explain AI feature for deep dives
- Ensures "passive reading → active understanding"

### Step 3: **Reflection** 💭
After reading, users **rewrite a concept in their own words** using `<ReflectionCard />`.

- Forces deep encoding
- Surfaces misconceptions
- Creates retrievable memory
- Analytics: `trackReflectionWritten()`

### Step 4: **Mastery** 🏆
XP rewards are **tied to learning quality**, not streaks:

- Checkpoint correct → +10 XP
- Prediction + reflection → +5 XP each
- Displayed subtly, not loudly gamified
- Reinforces the learning loop, not engagement loop

### Why This Loop Works

1. **Prediction** activates prior knowledge and curiosity
2. **Reading** provides new information with scaffolding
3. **Reflection** cements understanding through production
4. **Mastery** validates correct reasoning

This converts passive consumption into active construction of knowledge.

---

## 🎨 III. SCIO MINIMALIST DESIGN SYSTEM

The UI must feel like: **Notion × Stripe × FT × Apple Intelligence**

### Layout

- **Single column**: `max-w-3xl mx-auto px-6`
- **Heavy whitespace**: Breathing room between elements
- **Light, elegant shadows**: `shadow-sm` only
- **Rounded corners**: `rounded-xl` for modern feel
- **Subtle separators**: Use sparingly, light borders only

### Typography

- **Font family**: Clean sans-serif (system stack or Inter)
- **Headings**: `text-3xl font-semibold` (max 3xl, never larger)
- **Body text**: `text-lg leading-relaxed`
- **Contrast**: Always high contrast for readability
- **No decorative fonts** — clarity first

### Colour Palette

| Element | Hex | Usage |
|---------|-----|-------|
| Background | `#FAFAFA` | Page background |
| Primary Text | `#1A1A1A` | Body text |
| Secondary Text | `#27303F` | Labels, captions |
| Accent (Primary) | `#1A2E4B` | Deep blue for CTAs, links |
| Accent (Secondary) | `#00E0B8` | Mint for success states, highlights |
| Border | `#E5E7EB` | Light separators |
| Card Background | `#FFFFFF` | Cards, modals |

### Interactions

- **Smooth fades**: Use `transition-opacity duration-200`
- **Subtle transforms**: `scale-95` on hover, not 1.1
- **No flashy animations** — nothing above 400ms
- **Elegant micro-interactions**: Hover states should feel natural
- **Immediate feedback**: Buttons, clicks should respond instantly

### Examples of Scio-Aligned UI

✅ A textarea in a card with light border and rounded corners  
✅ A modal that fades in gently with subtle shadow  
✅ A button that scales down slightly on hover  
❌ A spinning loader animation  
❌ Bright neon colors  
❌ Confetti on completion  
❌ Toast notifications for every action

---

## 🔥 IV. SIGNATURE "ZUCK FEATURES" (REQUIRED)

These are the core features that make Scio unique and effective.

### Feature 1: Prediction Step 🎯

**Timing**: Before every article  
**Component**: `<PredictionCard />`

**Required Elements**:
- Prompt: "What do you predict this article will cover?"
- Textarea for user input
- Save button
- LocalStorage persistence (key: `scio_prediction_${articleId}`)
- Analytics call: `trackPredictionWritten()`

**Design**:
- Minimalist card
- Soft border, light shadow
- Clear CTA button
- No success toast — just a subtle state change

**Why**: Activates metacognition and creates a learning anchor before content exposure.

---

### Feature 2: Interactive Reading Enhancements 📖

**Throughout the article, insert**:

#### InsightBox
- Highlighted concept explanations
- Left accent border (deep blue `#1A2E4B`)
- Title + explanation text
- Clean, simple, elegant

#### Improved Tooltips
- **Definition**: Plain-language explanation
- **Example**: Real-world or market example
- **Interview Relevance**: Why this matters for interviews
- Trigger on hover or click

#### InteractiveCheckpoint
- Multiple choice OR drag-and-drop
- Immediate feedback
- XP award on correct answer (+10 XP)
- Analytics: `trackCheckpointResult(correct: boolean)`

#### ReflectionCard
- Prompt: "How would you explain this concept to a peer?"
- Textarea + save
- LocalStorage save
- Analytics: `trackReflectionWritten()`

---

### Feature 3: Signature AI Feature — Highlight → Interview Explanation ⭐

**This is Scio's "wow moment."**

**How It Works**:

1. User selects text anywhere in the article
2. Floating button appears: **"Explain in Interview Terms"**
3. User clicks button
4. `<InterviewExplainModal />` opens
5. Modal calls `/api/explain` with selected text
6. Modal displays:
   - **Plain-English Explanation**: What does this mean?
   - **Market Implication**: Why does this matter?
   - **Example Interview Answer**: How would you answer this in an interview?
   - **Follow-up Question**: What should you think about next?
7. Analytics: `trackInterviewExplainUse()`

**Modal Design**:
- Stylish, minimalist modal
- Dark background, light text
- Clear reading
- Close button top-right
- No animations, just fade in/out

**Why**: Turns passive reading into active learning. Users get instant, AI-powered coaching.

---

### Feature 4: Mastery & XP System 🏆

**XP Awards** (tied to learning, not engagement):

- ✅ Prediction written: +5 XP
- ✅ Checkpoint correct: +10 XP (cumulative)
- ✅ Reflection written: +5 XP
- ❌ Checkpoint incorrect: 0 XP (no penalty, no reward)

**Display**:
- Subtle XP counter in top-right (or sidebar)
- No confetti, badges, or level-up animations
- Just a number that increases
- Level shown (Level 1–4 based on total XP)
- Reinforces learning, not grinding

**Why**: XP validates learning without creating addiction loops. It's a scorecard, not a casino.

---

## 📊 V. ESSENTIAL ANALYTICS SYSTEM (ONLY WHAT MATTERS)

**Goal**: Track learning and engagement behaviour **ONLY**.

**What we DON'T track**:
- User location, device, OS
- GA, Plausible, or any third-party tracking
- Personal data of any kind
- Heatmaps or session recordings

**What we DO track** (local only):
- Learning actions (prediction, reflection, checkpoint results)
- Engagement depth (tooltips, explain uses, scroll depth)
- Time invested in learning

### Analytics Object

```typescript
export type ScioAnalytics = {
  predictionWritten: boolean;           // Did user make a prediction?
  reflectionWritten: boolean;           // Did user write a reflection?
  tooltipOpens: number;                 // How many tooltips opened?
  checkpointCorrect: number;            // Correct checkpoint attempts
  checkpointIncorrect: number;          // Incorrect checkpoint attempts
  interviewExplainUses: number;         // How many times user used highlight→explain?
  totalTimeOnArticle: number;           // Time in seconds
  scrollDepth: number;                  // Max scroll percentage 0–100
};
```

**Storage Key**: `scio_analytics`

### Required Functions

All functions must:

1. Load analytics object from localStorage
2. Modify the relevant field
3. Save it back to localStorage
4. Log to console: `SCIO ANALYTICS UPDATE: { ... }`

#### Learning Actions

**`trackPredictionWritten()`**
- Sets `predictionWritten = true`
- Called when user saves prediction

**`trackReflectionWritten()`**
- Sets `reflectionWritten = true`
- Called when user saves reflection

#### Engagement Actions

**`trackTooltipOpen()`**
- Increments `tooltipOpens++`
- Called each time a tooltip is opened

**`trackCheckpointResult(correct: boolean)`**
- If `correct`: increments `checkpointCorrect++`
- If `!correct`: increments `checkpointIncorrect++`
- Called after checkpoint submission

**`trackInterviewExplainUse()`**
- Increments `interviewExplainUses++`
- Called when user clicks "Explain in Interview Terms"

#### Behaviour Tracking

**`startArticleTimer()`**
- Starts a timer on component mount
- Stores start time in memory (not localStorage)

**`endArticleTimer()`**
- Stops timer on component unmount
- Calculates elapsed time
- Updates `totalTimeOnArticle` with cumulative value

**`trackScrollDepth(percentage: number)`**
- Called on scroll events
- Updates `scrollDepth` to max value ever reached
- Example: If user scrolls to 45%, then 60%, `scrollDepth = 60`

### What These Metrics Reveal

- **predictionWritten + reflectionWritten** → Learning engagement
- **checkpointCorrect / (correct + incorrect)** → Comprehension strength
- **tooltipOpens + interviewExplainUses** → Active learning intensity
- **totalTimeOnArticle + scrollDepth** → Investment level
- **Together** → A portrait of learning quality, not engagement addiction

### Implementation Pattern

```typescript
// Example: trackPredictionWritten()
function trackPredictionWritten() {
  const analytics = getAnalyticsFromStorage();
  analytics.predictionWritten = true;
  saveAnalyticsToStorage(analytics);
  console.log(`SCIO ANALYTICS UPDATE:`, analytics);
}
```

---

## 🏛️ VI. PAGE-BY-PAGE REDESIGN SPEC

### Page 1: Homepage (`app/page.tsx`)

**Hero Section**:
- Main heading: **"Turn finance news into interview-ready insight."**
- Subheading: **"Scio teaches you to truly understand markets — through minimalist, interactive articles powered by AI."**

**CTA Buttons**:
- Primary: "Try Demo" → links to `/demo`
- Secondary: "Join Beta List" → Google Form link

**Feature Cards** (3-column grid):

1. **"Predict First"**
   - Icon or illustration
   - Description: "Write your hypothesis before reading. Activate your thinking."

2. **"Learn as You Read"**
   - Icon or illustration
   - Description: "Interactive explanations, tooltips, and AI-powered insights embedded throughout."

3. **"Prove You Understand"**
   - Icon or illustration
   - Description: "Checkpoints and reflections measure real comprehension, not just reading speed."

**Layout**:
- Minimalist cards with light borders
- Large whitespace between sections
- Clean grid, no clutter
- Light gradient or solid backgrounds only

**Design Principles**:
- Feels editorial, not corporate
- Emphasizes learning, not gamification
- Calm, intelligent tone
- No social proof, testimonials, or FOMO copy

---

### Page 2: Demo Page (`app/demo/page.tsx`)

**Order of Components** (top to bottom):

1. **XP / Level Display** (top-right or sidebar)
   - Current level and total XP
   - Subtle, unobtrusive

2. **`<PredictionCard />`**
   - Prompt: "What do you predict this article will discuss?"
   - Full-width card
   - Save button

3. **`<InteractiveArticleWrapper />`** (wraps entire article)
   - Enables text selection detection
   - Manages floating "Explain" button
   - Manages timer and scroll tracking

4. **Article Content**
   - Body text with paragraphs
   - Inline `<InsightBox />` components strategically placed
   - Improved tooltips on key terms
   - `<InteractiveCheckpoint />` components for comprehension checks

5. **`<ReflectionCard />`**
   - Prompt: "How would you explain the main concept to someone unfamiliar with finance?"
   - Save button

6. **XP Summary**
   - Display XP earned from this article
   - Breakdown: prediction (+5), checkpoint (+10), reflection (+5)
   - Subtle, educational

**Feel**:
- Like an interactive notebook, not a blog
- Quiet, focused aesthetic
- Encourages deep reading and thinking
- No distractions, no ads, no sidebar

---

## 🧩 VII. MANDATORY COMPONENTS AND THEIR RESPONSIBILITIES

### 1. `components/PredictionCard.tsx`

**Purpose**: Captures user's initial hypothesis before reading.

**Required Props**:
- `articleId: string` — For localStorage key
- `onSave?: (text: string) => void` — Callback on save

**Required Elements**:
- Prompt text: "What do you predict this article will cover?"
- Textarea (min-height: 120px)
- Save button
- LocalStorage persistence: `scio_prediction_${articleId}`

**Interactions**:
- On mount: Load saved prediction from localStorage (if exists)
- On save: Store to localStorage + call `trackPredictionWritten()` + call `onSave` callback

**Styling** (minimalist):
- Card: white background, light border, rounded-xl, shadow-sm
- Textarea: light border, rounded-lg, padding, no resize
- Button: deep blue background, white text, rounded-lg, hover scale-95

---

### 2. `components/InsightBox.tsx`

**Purpose**: Highlight key concept explanations within the article.

**Required Props**:
- `title: string` — Concept title
- `children: React.ReactNode` — Explanation content

**Required Elements**:
- Left accent border (deep blue `#1A2E4B`, width: 4px)
- Title (bold, text-lg)
- Content (body text, text-base)
- Light background (very subtle, almost white)

**Styling**:
- Card with left border only
- Rounded corners (rounded-lg)
- Padding: p-6
- No shadow, just light border on right and bottom

---

### 3. `components/InteractiveCheckpoint.tsx`

**Purpose**: Real-time comprehension checks with immediate feedback.

**Required Props**:
- `checkpointId: string` — Unique ID for analytics
- `question: string` — Question to ask
- `options: string[]` — Multiple choice options
- `correctAnswerIndex: number` — Index of correct answer
- `onSubmit?: (correct: boolean) => void` — Callback

**Required Interactions**:
- Display question and options
- User selects answer
- Immediate feedback: ✅ "Correct!" or ❌ "Not quite..."
- Award +10 XP if correct
- Call `trackCheckpointResult(correct)`
- Call `onSubmit` callback

---

### 4. `components/ReflectionCard.tsx`

**Purpose**: Forces deep encoding by asking user to rewrite concepts.

**Required Props**:
- `articleId: string` — For localStorage key
- `prompt?: string` — Custom prompt
- `onSave?: (text: string) => void` — Callback

**Required Elements**:
- Prompt text
- Textarea (min-height: 120px)
- Save button
- LocalStorage: `scio_reflection_${articleId}`

---

### 5. `components/InteractiveArticleWrapper.tsx`

**Purpose**: Manages text selection detection, timer, scroll tracking for entire article.

**Required Props**:
- `children: React.ReactNode` — Article content
- `articleId: string` — For analytics

**Responsibilities**:
- Detect text selection
- Show floating button: "Explain in Interview Terms"
- On button click: Extract text + open modal
- Start timer on mount: `startArticleTimer()`
- End timer on unmount: `endArticleTimer()`
- Track scroll depth: `trackScrollDepth(percentage)`

---

### 6. `components/InterviewExplainModal.tsx`

**Purpose**: Display AI-powered interview explanation for selected text.

**Required Props**:
- `isOpen: boolean`
- `selectedText: string`
- `onClose: () => void`

**Required Displays**:
- Loading state while API call is in progress
- **Explanation**: Plain-English explanation
- **Market Implication**: Why this matters
- **Interview Answer**: Example response
- **Follow-up Question**: What to think about next
- Close button (X) in top-right

---

## 🤖 VIII. AI ENDPOINT FOR EXPLANATIONS

### Endpoint: `POST /app/api/explain/route.ts`

**Purpose**: Generate interview-ready explanations from selected text.

### Request Format

```typescript
POST /api/explain
Content-Type: application/json

{
  "selectedText": "The budget raised taxes to an all-time high..."
}
```

### Response Format

```typescript
{
  "explanation": "Plain English explanation of what this means...",
  "marketImplications": "Why this matters in financial markets...",
  "interviewAnswer": "Example of how to discuss this in an interview...",
  "followUpQuestion": "What should you think about next?"
}
```

### Implementation Guidelines

- **Use gpt-4-turbo** for quality
- **Set temperature to 0.7** — balanced between consistency and creativity
- **Max tokens: 800** — keep responses concise
- **Add rate limiting** to prevent abuse
- **Error handling**: Empty text → 400, API error → 500

---

## 🎯 IX. LEARNING FIRST MANIFESTO — The North Star

### This is the Core Principle

> **If a feature does not directly help a user understand something more deeply — do not implement it.**

This is the law. All features must serve learning.

### What This Means in Practice

#### ✅ DO Build

- Text selection → AI explanation (active learning)
- Prediction cards (metacognition)
- Reflection prompts (encoding)
- Interactive checkpoints (verification)
- Inline tooltips (just-in-time learning)
- Analytics on comprehension (insight, not tracking)
- Clean, minimalist UI (reduces cognitive load)

#### ❌ DON'T Build

- Gamification fluff (streaks, badges, confetti)
- Social features (leaderboards, sharing)
- Unnecessary notifications (FOMO tactics)
- Marketing widgets (social proof, testimonials)
- Excessive animations (distraction)
- Noisy analytics (personal data collection)
- Algorithm-driven recommendations (engagement loop)
- Ad integrations (conflicts with learning)

### Quality Over Engagement

- **Engagement metrics reward addiction, not learning.**
- A user who spends 10 minutes understanding one concept deeply is better than a user who spends 2 hours skimming.
- XP should validate learning quality, not time spent.
- Analytics should be invisible to users — they're for us, not for showing off.

### For Copilot

When you're unsure whether to add a feature:

1. **Ask: Does this help the user learn?**
   - If no → don't build it.
   - If yes → continue to step 2.

2. **Ask: Is this the simplest way to achieve learning?**
   - If no → simplify it.
   - If yes → continue to step 3.

3. **Ask: Does this align with minimalist design?**
   - If no → redesign it.
   - If yes → build it.

---

## 🔚 X. HOW COPILOT SHOULD INTERPRET THIS DOCUMENT

This is the **single source of truth** for all Scio development decisions.

### When You See This Comment

```typescript
// COPILOT TODO: Implement according to SCIO_MASTER_PROMPT.md
```

### You Must

1. **Reference this document** to understand what needs to be built
2. **Modify existing files** to align with the spec
3. **Create required components/files** if they don't exist
4. **Follow the design system** (layout, typography, colours, interactions)
5. **Follow the learning loop** (prediction → reading → reflection → mastery)
6. **Add analytics** where specified (track learning, not engagement)
7. **Maintain minimalism** (every pixel serves a purpose)
8. **Add no unnecessary code** (simplicity first)
9. **Keep everything consistent** with this spec

### Decision Tree for Feature Requests

```
User asks for a feature
    ↓
Does it directly help learning?
    ├─ NO → Politely decline, explain why
    ├─ YES → Next question
    ↓
Is it already in this spec?
    ├─ YES → Implement it
    ├─ NO → Next question
    ↓
Does it fit the learning loop?
    ├─ NO → Propose alternative
    ├─ YES → Next question
    ↓
Can it be minimalist?
    ├─ NO → Propose simpler version
    ├─ YES → Build it
```

### Key Sections to Reference

| Need | Reference |
|------|-----------|
| Styling guidance | Section III (Design System) |
| Component structure | Section VII (Component Specs) |
| Analytics tracking | Section V (Analytics System) |
| Learning approach | Section II (Core Loop) |
| Feature list | Section IV (Signature Features) |
| Page layouts | Section VI (Page Specs) |
| Philosophy | Sections I & IX (Philosophy + Manifesto) |

---

## Summary: Your Role

You are Scio's implementation engine. This document is your instructions manual. 

Your job is **not** to suggest features — it's to build what's in this spec, build it minimally, and always ask: **"Does this help the user learn?"**

If the answer is yes, build it beautifully. If no, politely decline.

**Welcome to Team Scio.** ✨
