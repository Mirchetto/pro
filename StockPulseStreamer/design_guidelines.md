# Stock Market Monitor - Design Guidelines

## Design Approach: Design System Foundation

**Selected System:** Fluent Design + Financial Dashboard Patterns  
**Justification:** Data-dense, real-time monitoring application requiring clarity, hierarchy, and performance. Drawing inspiration from Bloomberg Terminal, TradingView, and Robinhood for modern financial UX.

**Core Principles:**
- Information clarity over decoration
- Immediate status recognition through color coding
- Hierarchy through typography and spacing, not embellishment
- Performance-first (minimal animations for real-time data)

## Color Palette

**Dark Mode Primary (Default):**
- Background Base: 222 15% 12%
- Surface: 222 15% 16%
- Surface Elevated: 222 15% 20%
- Border: 222 15% 28%

**Accent Colors (Status-Driven):**
- Positive/Gain: 142 76% 36% (green for price increases)
- Negative/Loss: 0 84% 60% (red for price decreases)
- Neutral: 217 91% 60% (blue for info, links)
- Warning/Alert: 38 92% 50% (amber for volume spikes)

**Text Hierarchy:**
- Primary: 222 5% 96%
- Secondary: 222 5% 72%
- Tertiary: 222 5% 56%

## Typography

**Font Stack:**
- Primary: 'Inter' for UI elements and labels
- Monospace: 'JetBrains Mono' for prices, percentages, ticker symbols
- Display: 'Inter' semibold/bold for headers

**Scale:**
- Hero Numbers (prices): text-4xl to text-5xl, font-mono, font-semibold
- Ticker Symbols: text-sm to text-base, uppercase, font-mono, tracking-wide
- Headlines: text-lg to text-2xl, font-semibold
- Body/News: text-sm to text-base, leading-relaxed
- Labels: text-xs to text-sm, uppercase, tracking-wider, text-tertiary

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, and 12  
- Tight spacing (p-2, gap-2): Within cards, between related items
- Standard spacing (p-4, p-6): Card padding, section gaps
- Generous spacing (p-8, p-12): Page margins, major section separation

**Grid Structure:**
- Dashboard: 12-column grid (lg:grid-cols-12)
- Watchlist: Full-width with dynamic rows
- Detail View: 8-column main content + 4-column sidebar
- News Feed: Single column, max-w-4xl for readability

**Container Widths:**
- Full viewport: max-w-full with px-4 to px-8
- Content areas: max-w-7xl mx-auto

## Component Library

**Navigation:**
- Fixed top header (h-16): Logo, global controls, user menu, notification bell
- Sidebar optional for ticker categories/filters (w-64)
- Breadcrumb trail for detail navigation

**Dashboard Widgets:**
- Watchlist Table: Striped rows, hover states, sortable columns
  - Columns: Ticker (mono, bold), Price (mono, color-coded), Change% (badge), Volume (bar indicator), Last Update (timestamp)
- "Boom" Cards: Elevated surfaces (shadow-lg) with gradient borders indicating alert status
- Quick Stats Bar: Horizontal scroll of metric cards (grid-flow-col)

**Data Visualization:**
- Price Charts: Line charts with gradient fills below line, time-based x-axis
- Volume Bars: Vertical bar chart with threshold indicators
- Sentiment Meter: Radial progress or horizontal bar with color gradient (red→yellow→green)
- Sparklines: Inline mini-charts in table rows (h-8)

**News Components:**
- News Card: Border-l-4 with source color, timestamp, headline, ticker tags
- Infinite scroll feed with skeleton loading states
- Expandable card for full article preview

**Detail Modal/Page:**
- Split layout: Chart + metrics (8 cols) | News + sentiment (4 cols)
- Tabbed interface: Overview, News, Sentiment, History
- Sticky header with ticker symbol and key metrics

**Forms & Controls:**
- Search bar: Full-width with icon, instant filter
- Filter chips: Rounded-full, toggle states, color-coded by category
- Refresh button: Icon with subtle spin animation on update
- Settings panel: Slide-over drawer from right

**Status Indicators:**
- Live pulse: Animated dot (green) for active monitoring
- Update timestamp: "Updated 12s ago" in muted text
- Connection status: Small icon in header (green=connected, red=disconnected)

**Notifications:**
- Toast: Bottom-right, auto-dismiss, with action buttons
- In-app alerts: Banner at top for critical market events
- Sound toggle in settings

## Animations (Minimal)

**Permitted:**
- Price updates: Number counter animation (200ms)
- New data fade-in: opacity transition (150ms)
- Live indicator pulse: 2s infinite for active monitoring
- Hover states: scale-105 on cards (100ms)

**Forbidden:**
- Page transitions
- Scroll-triggered animations
- Decorative motion graphics

## Responsive Behavior

**Desktop (lg+):** Full dashboard with sidebar, multi-column layouts  
**Tablet (md):** Collapsed sidebar, 2-column layouts  
**Mobile (base):** Single column, bottom tab navigation, swipe gestures for charts

## Images

**Logo/Branding:**
- App logo in header (h-8 to h-10)
- Favicon with ticker symbol or graph icon

**No Hero Images:** This is a utility dashboard—immediate data access takes priority over marketing visuals.

**Icons Throughout:**
- Use Heroicons (outline for navigation, solid for statuses)
- Chart icons, trending arrows, notification bell, settings gear
- Social proof icons for news sources (small, 16×16)

**Data Visualization:** All charts/graphs rendered programmatically, no static images

## Accessibility

- High contrast ratios for text (WCAG AAA on backgrounds)
- Color-blind safe: Use icons + text labels alongside color coding
- Keyboard navigation for all interactive elements
- Screen reader labels for price changes ("Price up 3.2%")
- Focus indicators: 2px ring in neutral accent color