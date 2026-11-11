# Westpac-Style Banking UI & First-Ranked Signal Inception Concept

**Workspace Scope:** `C:\Users\mrpwe\.gemini\antigravity\scratch\titan-frontend-repo` (`origin: https://github.com/mrpswebster-collab/titan-frontend.git`)  
**Backend API Upstream:** `https://asx-quant-brain.onrender.com` (proxied locally via `/api` in `vite.config.js` on `http://localhost:3000`)  
**Separation Principle:** Keep `titan-quant-system` strictly isolated for core trading math, failover protection, Apps Script (`clasp`), and backend reliability repairs. All layout, styling, and portfolio/lifecycle visualization lives here.

---

## 1. Design Direction (Westpac Share Trading / Institutional Broker Style)
Clean, high-trust financial clarity rather than crowded dark terminal boxes:
- **Portfolio Summary Strip:** Total Equity, Available Cash, Market Value Invested, **Today's P&L (`$` & `%`)**, and **Total Since-Purchase P&L (`$` & `%`)**.
- **Portfolio Holdings Table (Upgrade Target: `src/components/PortfolioHoldingsView.jsx`):**
  - Currently displays: `Ticker`, `Workbook Node`, `Units`, `Avg Entry`, `Live Price`, `Market Value`, `Unrealized P&L`, `Stop Loss`, `Status`.
  - **Upgrade columns to add:**
    1. **Day Change (`$` & `%`)**: Intraday movement vs previous session close.
    2. **Purchase Info**: Entry date (`bought_at`), cost basis total, days held, and **Total P&L since purchase** side-by-side with **Day P&L**.
    3. **Anti-Churn Shield Badge**: ATR Chandelier floor + Catastrophe `-25%` floor + Closing-Basis shield state (`HOLD_FAITH_IN_MATH` / `HOLD_INTRADAY_WICK_SHIELD`), replacing tight `-8%` displays.
    4. **Verified `Vol Mult`**: Display exact multiplier (e.g. `2.4x`) or explicit `N/A` badge (`UNVERIFIED`), never fake `1.0x`.
- **Clean Detail Drawer on Row Click (`src/components/InteractiveKinematicDrawer.jsx`):**
  - Keep the main table scannable; open AI Dossier (`[SCHEMA:V2]`), news catalysts, MACD/RSI/OBV gauges, and exit-shield diagnostics inside the slide-over drawer.

---

## 2. "First Time Ranked" Signal Inception & Lifetime Learning Tracker
Goal: Record the **immutable Day-0 snapshot** the very first time Titan ranks or surfaces a ticker, then track its lifetime trajectory—whether bought, skipped, stopped, or won—so the system and user learn **what makes breakouts succeed or fail**.

### Frontend Views to Add Here
1. **Signal Inception / Discovery Watchlist Tab:**
   - **First Ranked Date & Price** vs **Current Price** (`Since Discovery %`).
   - **First-Seen Math**: Initial `Quant Score`, `[C:X]` conviction, `MACD`, `Vol Mult`, and `Coiled Spring / Compression` state at Day 0.
   - **Action Filter:** `Bought & Active` · `Watched / Missed Winner` · `Stopped / Failed` · `Suspended / $0 Quarantined`.
2. **Ticker Lifetime Post-Mortem Card (Inside Drawer / History Tab):**
   - **Milestones Timeline:** `First Ranked` → `First [C:8]+ Alert` → `Peak Return (MFE %)` / `Worst Drawdown (MAE %)` → `Entry Executed` → `Exit / Outcome`.
   - **Success / Failure Attribution Tags:**
     - *Why it worked:* High verified `vol_mult >= 1.5x`, sustained `slope_3bar > 0`, catalyst confirmation, `Rule 42` free-ride harvest.
     - *Why it failed:* Unverified/low volume breakout trap, major negative catalyst (`discounted placement` / `insolvency`), pre-close whipsaw vs genuine kinematic breakdown.

---

## 3. Minimal Read-Only API Contract Needed From `titan-quant-system` (Later Step)
To avoid touching core trading pipelines while iterating on UI:
1. Build and preview all UI screens locally first using `npm run dev` (`http://localhost:3000` with the existing `/api` proxy to Render) and realistic sample states alongside live `/api/v2/portfolio/fleet` data.
2. When ready to wire **Signal Inception** persistence in `titan-quant-system`, request only an additive table (`ticker_signal_inception`: write-once `first_ranked_at`, `first_price`, `first_quant_score`, `first_conviction`, `first_macd`, `first_vol_mult`, plus `peak_price_since_inception`, `low_price_since_inception`) and a read-only `GET /api/v2/portfolio/inception` endpoint.

---

## 4. Local Dev & Render Build-Minute Hygiene
- `render.yaml` auto-builds `titan-frontend` on pushes to `titan-frontend.git`.
- Run **`npm run dev`** locally during UI iteration so you can test layouts live in the browser without burning Render pipeline minutes on every small tweak.
- Commit & push to `titan-frontend.git` only when a UI milestone is tested and ready to publish.
