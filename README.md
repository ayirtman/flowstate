# 🌸 FlowState Planner

**A Gamified, Mindful Productivity Suite powered by Google Gemini.**

FlowState Planner is more than just a todo list; it is a holistic productivity environment designed to help users overcome procrastination, maintain focus, and find joy in the daily grind through visual rewards and AI assistance.

---

## 📖 Project Overview

In the modern digital age, productivity apps are often cold, utilitarian, and stressful. FlowState aims to be **calming, tactile, and rewarding**.

It combines rigorous time management tools (Timelines, Focus Timers) with a "Warm Gamification" layer. Instead of punishing users for missed tasks, it rewards them for focused time with digital collectibles (Crystals) that have tangible value within the app's ecosystem.

## ✨ Key Features & Philosophy

### 1. 📅 Visual Timeline
**The Feature:** A chronological view of your day where tasks are time-boxed.
**The Reason:** Traditional todo lists lack context. By assigning time slots (e.g., 9:00 AM - 10:30 AM), users face the reality of a finite day, reducing over-planning anxiety. The visual cards provide a satisfying "completion" toggle to build momentum.

### 2. 🧠 Smart Breakdown (AI Powered)
**The Feature:** Users can type a vague goal (e.g., "Plan a birthday party"), and the app uses **Google Gemini AI** to break it down into 3-5 specific, actionable steps with emojis and priority levels.
**The Reason:** "Analysis Paralysis" is the enemy of starting. Large tasks feel overwhelming. By automating the breakdown process, we lower the activation energy required to start working.

### 3. ⏱️ Focus Zone & Time Guard
**The Feature:** A tactile, radial countdown timer. It includes:
*   **Time Guard:** A setting to list "blocked apps" (visual reminder/simulator).
*   **Soundscapes:** Generated brown/white noise for flow.
*   **Modes:** Stopwatch (Count up) and Countdown (Pomodoro).
**The Reason:** The Pomodoro technique is proven, but standard timers are boring. The "Time Guard" adds a layer of intentionality, forcing the user to acknowledge distractions before they happen.

### 4. 💎 Elemental Forge (Gamification)
**The Feature:**
*   **Sanctuary:** A vault where users collect crystals.
*   **Earning:** Completing a focus session earns a crystal based on duration (e.g., 25 mins = Amethyst, 3 hours = Moonstone).
*   **Crafting:** Users can merge 3 lower-tier crystals to forge 1 higher-tier crystal (e.g., 3 Amethysts → 1 Citrine).
**The Reason:** Productivity rewards are usually delayed (e.g., getting a promotion in a year). The Forge provides **immediate dopamine** for effort. It turns "working" into "grinding for loot," leveraging mechanisms found in addictive video games for a positive purpose.

### 5. 🔓 The "Play to Pay" Economy
**The Feature:** The app features a "Pro Subscription" modal. Users can unlock Pro features via cash (simulated) OR by redeeming a **Moonstone** (the highest tier crystal).
**The Reason:** This incentivizes long-term engagement. It proves to the user that their time and focus have genuine value. It transforms the app from a tool into a game where the user can "beat" the system by being productive.

---

## 🛠️ Tech Stack

*   **Frontend:** React (v19), TypeScript
*   **Styling:** Tailwind CSS (Custom pastel palette, glassmorphism effects)
*   **Icons:** Lucide React
*   **AI:** Google GenAI SDK (Gemini 3 Flash)
*   **Audio:** Web Audio API (Procedural noise generation)

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Environment:**
    Ensure your `process.env.API_KEY` is set with a valid Google Gemini API key.
4.  **Run the app:**
    ```bash
    npm start
    ```

---

## 🎨 Design Language

The UI uses a **"Soft & Organic"** design language:
*   **Glassmorphism:** Translucent cards and modals to create depth.
*   **Pastel Gradients:** Calming backgrounds that shift slowly (via CSS animations) to keep the interface feeling alive but not distracting.
*   **Tactile Feedback:** Buttons scale on click; the timer dial can be dragged; confetti explodes on achievements.

---

*Built with focus and flow.*
