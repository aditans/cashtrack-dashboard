Enhance the existing Demat Sandbox portfolio dashboard with AI-driven insights, onboarding flow, and personalization.

### 1. PORTFOLIO INTELLIGENCE SECTION (TOP PRIORITY)

Create a new section above or near the "Overview" card called:

→ "AI Portfolio Insights"

This section must dynamically analyze the user's portfolio data and display:

#### A. Current Asset Allocation
- Use existing allocation data (stocks, mutual funds, real estate, gold, etc.)
- Show:
  - Percentage distribution
  - Visual (progress bars or mini pie/donut)
- Make it concise and readable

#### B. Portfolio Score + Risk Personality
- Generate a score (0–100) based on:
  - Diversification
  - Risk exposure
  - Liquidity
- Assign a personality label such as:
  - "Conservative"
  - "Balanced"
  - "Aggressive"
  - "Impulsive Spender"
- Display as:
  - Score badge
  - Tagline (e.g., "You are an Impulsive Spender")

#### C. AI Recommendations (IMPORTANT)
Generate smart, human-like suggestions based on portfolio:

Examples:
- "You have allocated 40% in Fixed Deposits which yield lower returns. Consider reallocating 15–20% into mutual funds for better long-term growth."
- "High exposure to banking sector detected. Consider diversifying into tech or FMCG."
- "Current geopolitical tensions may impact energy stocks. Monitor holdings like Reliance."

Rules:
- Keep recommendations short (1–2 lines each)
- Max 3–5 recommendations
- Make them actionable, not generic

---

### 2. CONVERT "ALL ASSETS" → "TOP PICKS FOR YOU"

Modify the sections (Mutual Funds, NPS, etc.):

- Instead of showing all assets randomly:
  → Add a new label: "Top Picks For You"

#### Logic:
- Rank assets based on:
  - Returns
  - Risk alignment with user personality
  - Performance trends

#### UI:
- Highlight cards with:
  - Badge: "Best for You" or "AI Recommended"
  - Slight glow or border emphasis
- Show top 3–5 first
- Remaining assets under "Other Investments"

---

### 3. KYC ONBOARDING FLOW (FIRST-TIME USER)

Before showing dashboard, implement:

#### Step 1: PAN Entry Screen
- Input field for PAN number
- CTA: "Verify PAN"
- Clean minimal UI

#### Step 2: Verification Loader (Multi-Step)

Use a modal loader similar to provided component.

Replace dummy texts with real KYC steps:
- "Verifying PAN details"
- "Fetching financial profile"
- "Analyzing risk appetite"
- "Setting up your portfolio insights"
- "Almost done..."

Auto-progress every 1.5–2 seconds

#### Behavior:
- Once complete → redirect to dashboard
- Store a flag so this doesn’t show again

---

### 4. AI TAGGING + PERSONALIZATION

Across the dashboard:

- Add smart tags like:
  - "Best for You"
  - "High Growth"
  - "Stable"
  - "Risky"
- Tags should be based on:
  - Returns
  - Volatility
  - User risk profile

---

### 5. UI + UX RULES

- Maintain current design system (cards, gradients, charts)
- Do NOT break existing components
- Keep everything modular:
  - Create new components:
    - <PortfolioInsights />
    - <KYCFlow />
    - <TopPicksSection />

---

### 6. DATA USAGE

Use existing data structures:
- performers
- allocationRows
- topPerformers

Derive insights programmatically instead of hardcoding.

---

### 7. BONUS (OPTIONAL IF POSSIBLE)

- Add a small chatbot bubble:
  - Name: "Chippy"
  - Message example:
    → "You are an impulsive spender"
- Modern rounded rectangle (chat style)
- Positioned bottom-right

"use client";
import React, { useState } from "react";
import { MultiStepLoader as Loader } from "../ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

const loadingStates = [
  {
    text: "Buying a condo",
  },
  {
    text: "Travelling in a flight",
  },
  {
    text: "Meeting Tyler Durden",
  },
  {
    text: "He makes soap",
  },
  {
    text: "We goto a bar",
  },
  {
    text: "Start a fight",
  },
  {
    text: "We like it",
  },
  {
    text: "Welcome to F**** C***",
  },
];

export function MultiStepLoaderDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} />

      {/* The buttons are for demo only, remove it in your actual code ⬇️ */}
      <button
        onClick={() => setLoading(true)}
        className="bg-[#39C3EF] hover:bg-[#39C3EF]/90 text-black mx-auto text-sm md:text-base transition font-medium duration-200 h-10 rounded-lg px-8 flex items-center justify-center"
        style={{
          boxShadow:
            "0px -1px 0px 0px #ffffff40 inset, 0px 1px 0px 0px #ffffff40 inset",
        }}
      >
        Click to load
      </button>

      {loading && (
        <button
          className="fixed top-4 right-4 text-black dark:text-white z-[120]"
          onClick={() => setLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </div>
  );
}

