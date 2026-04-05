# CashTrack Web Analytics Dashboard Design Guide

## Overview
This document outlines recommended chart types, bento grid layouts, and analytics sections for the CashTrack web dashboard. The design is based on your existing mobile analytics page while optimizing for desktop viewing and adding advanced analytics insights.

---

## Current Mobile Analytics Features
Your mobile analytics page currently displays:
- ✅ Summary stats (total expense, income, transaction counts)
- ✅ Story highlights carousel (top merchant, daily pulse, monthly recap, persona)
- ✅ Donut/pie chart (category breakdown)
- ✅ Trend charts with bar/line toggle (monthly, quarterly, semi-annual, yearly views)
- ✅ Category spending list
- ✅ Personalized insights & badges

---

## Recommended Web Analytics Sections

### **Section 1: Executive Summary Widgets**
**Grid Layout:** Top bar - 4 equal columns (Bento grid cols 1-4)

| Widget | Type | Size | Purpose |
|--------|------|------|---------|
| **Total Expense Card** | KPI/Metric | 1 col | Shows current period total with % change vs previous period |
| **Total Income Card** | KPI/Metric | 1 col | Shows income with trend indicator (↑↓) |
| **Net Cashflow Card** | KPI/Metric | 1 col | Income - Expense = Net (color: green if positive, red if negative) |
| **Savings Rate Card** | KPI/Metric | 1 col | (Income - Expense) / Income × 100% (motivational metric) |

**Features:**
- Mini sparkline charts inside each card showing 30-day trend
- Comparison with previous period (↑ 12% vs last month)
- Color-coded status (green for improvement, red for increase)

---

### **Section 2: Primary Analytics Grid**
**Grid Layout:** 2x2 Bento configuration

#### **Row 1:**

**[1.1] Expense Breakdown - Donut/Pie Chart** (Col 1-2, Row 1)  
- **Size:** 2 columns wide, 1 row tall
- **Current:** Donut chart showing top categories (8 max, rest as "Others")
- **Enhancement:** 
  - Interactive legend (click category to filter other charts)
  - Hover tooltips with percentage & amount
  - Click to drill down to transaction list
  - Option to view as treemap instead
- **Data:** Category-wise expense breakdown for selected period

**[1.2] Income vs Expense Comparison** (Col 3-4, Row 1)  
- **Size:** 2 columns wide, 1 row tall
- **Type:** Grouped bar or combo chart
- **Features:**
  - Compare income vs expense month-by-month or week-by-week
  - Show net cashflow as line overlay
  - Toggle between stacked & grouped view
  - Highlights best/worst months
- **Data:** Monthly comparison (last 12 months) with income/expense breakdown

#### **Row 2:**

**[1.3] Spending Trends Timeline** (Col 1-3, Row 2)  
- **Size:** 3 columns wide, 1 row tall
- **Type:** Area or line chart with brushable timeline
- **Features:**
  - Multi-line breakdown by category (toggle top 5 categories)
  - Hover to see stacked daily breakdown
  - Zoom/pan functionality
  - Period selector (week, month, quarter, year)
  - Annotations (expense spikes, milestones)
- **Data:** Daily spending trends for selected period

**[1.4] Quick Insights Panel** (Col 4, Row 2)  
- **Size:** 1 column wide, 1 row tall
- **Type:** Metric cards with insights
- **Content:**
  - 🔥 Highest spending day: [Date] (₹[Amount])
  - 🏪 Top merchant: [Name] ([X] transactions)
  - 📊 Biggest category: [Category] ([%] of total)
  - 📈 Daily average: ₹[Amount]
  - ⚠️ Anomaly alert: "30% higher than usual" (if applicable)
  - 🎯 Savings goal progress (if set)
- **Features:** Clickable cards to drill into details

---

### **Section 3: Advanced Analytics Section**
**Grid Layout:** 3-column layout (can stack on smaller screens)

#### **[2.1] Category Deep Dive** (Col 1-2, Rows 1-2)  
- **Size:** 2 columns wide, 2 rows tall
- **Type:** Stacked bar chart or waterfall
- **Features:**
  - Show category trends over time
  - Compare month-over-month growth
  - Identify growing vs shrinking categories
  - Color code by category
  - Show % change vs previous period
- **Data:** Category spending evolution (12-month view)

#### **[2.2] Merchant/Vendor Analysis** (Col 3, Rows 1-2)  
- **Size:** 1 column wide, 2 rows tall
- **Type:** Horizontal bar chart
- **Features:**
  - Top 10 merchants by spending
  - Show frequency (transaction count) on secondary axis
  - Pareto analysis (80/20 rule visualization)
  - Click to filter all other charts by merchant
- **Data:** Top merchants ranked by amount spent

---

### **Section 4: Spending Behavior & Patterns**
**Grid Layout:** 2x2 configuration

#### **[3.1] Heatmap - Spending by Day & Hour** (Col 1-2, Row 1)  
- **Size:** 2 columns wide
- **Type:** Calendar/heatmap visualization
- **Features:**
  - 7x4 grid (days of week × weeks)
  - Color intensity = spending amount
  - Click on day to see transactions
  - Toggle between absolute amount and deviation from average
- **Data:** Daily spending patterns (current month)

#### **[3.2] Time-Based Distribution** (Col 3-4, Row 1)  
- **Size:** 2 columns wide
- **Type:** Radial/polar bar chart or donut chart segments
- **Features:**
  - Spending by day of week (Mon-Sun)
  - Spending by time period (Morning/Afternoon/Evening/Night)
  - Show which day is most expensive
  - Average transaction amount by period
- **Data:** Behavioral patterns in spending timing

#### **[3.3] Expense Ratio Analysis** (Col 1-2, Row 2)  
- **Size:** 2 columns wide
- **Type:** Sankey or Alluvial diagram
- **Features:**
  - Flow from payment method → category
  - Show how different payment methods are used for different categories
  - Interactive filtering
- **Data:** Payment mode vs category relationship

#### **[3.4] Moving Averages & Forecasting** (Col 3-4, Row 2)  
- **Size:** 2 columns wide
- **Type:** Line chart with dual axis
- **Features:**
  - 7-day & 30-day moving average lines
  - Simple forecast for next month (linear trend)
  - Confidence interval bands
  - Show if on track for budget
- **Data:** Trend analysis with projections

---

### **Section 5: Split Bills & Group Expenses**
**Grid Layout:** 2x2 configuration

#### **[4.1] Split Overview** (Col 1-2, Row 1)  
- **Size:** 2 columns wide
- **Type:** Horizontal stacked bar or gauge charts
- **Features:**
  - "You Owe" vs "Others Owe You" balance visualization
  - Settlement status (settled/pending)
  - Most frequent split partner
  - Outstanding balance timeline
- **Data:** Group/split transaction summary

#### **[4.2] Friend/Group Spending** (Col 3-4, Row 1)  
- **Size:** 2 columns wide
- **Type:** Bubble chart or scatter plot
- **Features:**
  - X-axis: Total spent with friend
  - Y-axis: Number of splits
  - Bubble size: Total amount owed/owing
  - Click to see split details
- **Data:** Relationships with frequent split partners

#### **[4.3] Settlement History** (Col 1-4, Row 2)  
- **Size:** 4 columns wide (full width table/chart)
- **Type:** Interactive timeline or bar chart
- **Features:**
  - Show settlement frequency
  - Average time to settle
  - Most common split amounts
  - Partner with highest pending balance
- **Data:** Split settlement patterns

---

### **Section 6: Budget & Goals (Future-Ready)**
**Grid Layout:** 2 columns

#### **[5.1] Budget vs Actual** (Col 1-2, Row 1)  
- **Size:** 2 columns wide, 1 row
- **Type:** Bullet charts or progress bars
- **Features:**
  - Category-wise budget remaining/exceeded
  - Color: Green (under budget), Yellow (80%+), Red (exceeded)
  - Show trend line (on pace to exceed?)
  - Month-to-date progress
- **Data:** Compare spending to predefined budgets

#### **[5.2] Savings Goals Progress** (Col 1-2, Row 2)  
- **Size:** 2 columns wide
- **Type:** Radial progress charts or gauges
- **Features:**
  - Visual goal completion percentage
  - Time remaining to goal date
  - Required daily savings to hit goal
  - Savings rate trend
- **Data:** Goal tracking metrics

---

### **Section 7: AI-Powered Insights & Anomaly Detection**
**Grid Layout:** Full width scroll or 1-row carousel

**Features:**
- 📊 "Your spending is 23% higher this month. Top reason: Dining out (₹8,500)"
- 🎯 "You're on track to spend ₹XX,XXX this month. Last month was ₹YY,YYY"
- 🚨 "High-frequency merchant alert: You visited Starbucks 15 times this month"
- 💡 "Opportunity: Your grocery spending can be reduced by 15% based on similar users"
- 🏆 "Achievement unlocked: You saved ₹5,000 this month vs last month"
- ⚠️ "Unusual pattern: High spending on [Date], 3x your average"

**Data Source:** Your existing insight generation + ML anomaly detection

---

## Bento Grid Layout Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ SECTION 1: KPI Summary Row                                      │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐   │
│ │ Total Exp    │ Total Income │ Net Cashflow │ Savings Rate │   │
│ │ (1 col)      │ (1 col)      │ (1 col)      │ (1 col)      │   │
│ └──────────────┴──────────────┴──────────────┴──────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SECTION 2: Primary Analytics (2x2)                              │
│ ┌────────────────────────────┬────────────────────────────────┐ │
│ │ [1.1] Category Donut       │ [1.2] Income vs Expense       │ │
│ │      (2 cols × 1 row)      │      (2 cols × 1 row)         │ │
│ ├────────────────────────────┼────────────────────────────────┤ │
│ │ [1.3] Spending Timeline    │ [1.4] Quick Insights          │ │
│ │      (3 cols × 1 row)      │      (1 col × 1 row)          │ │
│ └────────────────────────────┴────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SECTION 3: Advanced Analytics                                   │
│ ┌────────────────────────────┬────────────────────────────────┐ │
│ │ [2.1] Category Deep Dive   │ [2.2] Merchant Analysis       │ │
│ │      (2 cols × 2 rows)     │      (1 col × 2 rows)         │ │
│ └────────────────────────────┴────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SECTION 4: Behavior Patterns (2x2)                              │
│ ┌────────────────────────────┬────────────────────────────────┐ │
│ │ [3.1] Daily Heatmap       │ [3.2] Time Distribution        │ │
│ │     (2 cols × 1 row)      │     (2 cols × 1 row)           │ │
│ ├────────────────────────────┼────────────────────────────────┤ │
│ │ [3.3] Payment-Category     │ [3.4] Forecasting              │ │
│ │     (2 cols × 1 row)      │     (2 cols × 1 row)           │ │
│ └────────────────────────────┴────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SECTION 5: Splits & Groups (2x2)                                │
│ ┌────────────────────────────┬────────────────────────────────┐ │
│ │ [4.1] Split Overview       │ [4.2] Friend Relationships    │ │
│ │     (2 cols × 1 row)      │     (2 cols × 1 row)           │ │
│ ├────────────────────────────┴────────────────────────────────┤ │
│ │ [4.3] Settlement History (4 cols × 1 row)                  │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SECTION 6: Budget & Goals (2 cols)                              │
│ ┌────────────────────────────┬────────────────────────────────┐ │
│ │ [5.1] Budget vs Actual     │                                │ │
│ │      (2 cols × 1 row)      │                                │ │
│ ├────────────────────────────┴────────────────────────────────┤ │
│ │ [5.2] Savings Goals (2 cols × 1 row)                       │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SECTION 7: AI Insights & Anomalies (Full Width)                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scrollable Insight Carousel / Alert Cards                  │ │
│ │ [7.1] [7.2] [7.3] [7.4] [7.5] [7.6]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Chart Types Comparison: Mobile vs Web

| Feature | Mobile | Web | Recommendation |
|---------|--------|-----|-----------------|
| **Donut Chart** | ✅ (single view) | ✅ (interactive legend) | Add drill-down to category details |
| **Time Trends** | ✅ (bar/line toggle) | ✅ (with zoom/pan) | Add date range selector & moving averages |
| **Category List** | ✅ (scrollable) | ✅ (sortable table) | Add comparison & growth indicators |
| **Sparklines** | ❌ | ✅ | Add mini trend charts to KPI cards |
| **Heatmap** | ❌ | ✅ | New weekly/daily pattern visualization |
| **Bubble Chart** | ❌ | ✅ | New for merchant/friend relationships |
| **Sankey Diagram** | ❌ | ✅ | New for payment method flows |
| **Forecast** | ❌ | ✅ | New prediction capability |
| **Anomaly Detection** | Implied insights | ✅ Explicit | Highlight unusual patterns visually |

---

## Interactive Features to Implement

### **Cross-Filtering**
- Click on category → all charts filter to show only that category
- Click on merchant → highlight their transactions across all charts
- Select date range → all charts update dynamically

### **Drill-Down Capabilities**
- Donut slice → transaction list for that category
- Bar in timeline → daily breakdown
- Heatmap cell → transactions for that day
- KPI card → detailed report

### **Export & Sharing**
- Export selected chart as PNG/SVG
- Create custom report combining multiple charts
- Share dashboard snapshot with email
- Schedule weekly/monthly reports

### **Customization**
- Pin favorite charts to top
- Rearrange widget order (saved preferences)
- Toggle sections on/off
- Choose comparison period (vs last month/quarter/year)

---

## Technology Stack Recommendations

**For Charts:**
- **Recharts** (React): Responsive, composable, accessible
- **Apache ECharts**: Feature-rich, better performance for large datasets
- **D3.js**: Maximum flexibility for custom visualizations (Sankey, Sunburst)
- **Plotly.js**: Interactive, publication-quality charts

**For Calendar/Heatmap:**
- **react-calendar-heatmap** or custom D3 implementation
- **CalHeatMap** library

**For Dashboard Grid:**
- **React Grid Layout**: Draggable, resizable
- **Chakra UI / Mantine**: Pre-styled grid components
- **TailwindCSS**: Custom grid with responsive design

---

## Data Requirements

To build these analytics, ensure your API provides:
- ✅ Transaction list with timestamps, amounts, categories, merchants, payment modes
- ✅ Income vs Expense breakdown
- ✅ Balance history (optional but useful for net cashflow)
- ✅ Split transaction details
- ✅ Budget configuration (if implementing budget section)
- ✅ User friend/group list for split analysis

---

## Implementation Priority

**Phase 1 (MVP):**
1. Section 1: KPI Summary with sparklines
2. Section 2: Primary analytics (Donut + Income vs Expense)
3. Section 4: Daily heatmap and time distribution

**Phase 2:**
4. Section 3: Category trends + merchant analysis
5. Section 5: Split bill overview
6. Advanced time selectors & cross-filtering

**Phase 3:**
7. Section 4: Sankey diagram + forecasting
8. Section 6: Budget vs actual
9. Section 7: AI insights & anomaly detection

---

## Notes
- All timestamps should be timezone-aware
- Support dark/light theme consistency with mobile app
- Ensure mobile responsiveness (stack sections vertically on tablets/phones)
- Cache calculations for performance (don't recompute on every filter change)
- Consider data aggregation strategies for users with 10k+ transactions
