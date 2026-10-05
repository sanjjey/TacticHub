# TacticHub 2.0 (Modern Python & React Edition)

Modern full-stack rebirth of **TacticHub**, upgraded from legacy Java/JSP to **FastAPI (Python)**, **React 19 (TypeScript + Vite)**, and a **Computer Vision AI Credential Verification Pipeline**.

---

## 🏗️ Architecture & Upgraded Features

### 1. Strategy & Tactics Engine (`/api/tactics`)
- Coaches post game tactics, drills, formation setups, and transition triggers.
- Players and coaches search playbooks by sport, keyword, or coach username.
- Verified coaches display an official verified badge on their tactical posts.

### 2. Certificates & Achievements Portfolio (`/api/certificates`)
- Universal achievement repository for both Players and Coaches.
- Upload sports degrees, tournament trophies, state championships, and federation licenses.
- Publicly inspectable digital sports CV for scouting.

### 3. Matchmaking & Player LFG Board (`/api/matches`)
- Players can broadcast Looking-For-Group (LFG) requests when needing players for sports matches.
- Includes: Sport/Format (e.g. Football 5v5, Basketball 3x3), Location/Venue, Start Time, Slots Required, Skill Level expectations, and Equipment specs.
- Players can join or leave with real-time roster counter updates.

### 4. Scouting Portal with Privacy Gate (`/api/scouting`)
- **Player Privacy Toggle**: Players can toggle `coach_visibility` ON or OFF.
- If disabled, player is hidden from the scouting directory and coaches are blocked from viewing or sending trial invites.
- If enabled, coaches can inspect player credentials and send formal recruitment offers.
- Players have an inbox to Accept or Decline offers.

### 5. Computer Vision AI Coach Credential Verification (`/api/verification`)
- Multi-stage CV document analysis:
  1. **OpenCV** image preprocessing and circular stamp/seal contour detection (`HoughCircles`).
  2. **RapidOCR** optical character recognition extracting text tokens, license numbers, and issuing bodies.
  3. **RapidFuzz** fuzzy entity matching comparing extracted text against coach's legal name and sports council taxonomy.
  4. Generates an automated confidence score and audit record, elevating valid coaches to **VERIFIED** status.

### 6. AI Text Analyzer: English Improvisation & Global Translation (`/api/ai`)
- **✨ 1-Click English Improviser (`/api/ai/improvise`)**:
  - Available across strategy creation, match LFG notes, and coach recruitment trial offers.
  - Automatically elevates rough/informal grammar, transforms casual wording into high-precision athletic coaching terminology, and fixes punctuation.
- **🌐 Multi-Language Sports Translation (`/api/ai/translate`)**:
  - Authors can post tactics in their native tongue or translate their drafts before posting.
  - Viewers can translate any tactic card on-demand into Spanish, French, German, Italian, Hindi, Tamil, Japanese, or English with a single click.
  - Includes instantaneous "Show Original" reset toggle.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Launch Backend (FastAPI)
```bash
cd tactichub-modern/backend
python -m pip install -r requirements.txt
python run.py
```
*Backend API docs available at: `http://localhost:8000/docs`*

### 2. Launch Frontend (React + Vite)
```bash
cd tactichub-modern/frontend
npm install
npm run dev
```
*Frontend opens at: `http://localhost:5173`*

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Coach** | `coach_alex` | `coach123` | Verified Coach (Premier Football Academy) |
| **Player** | `striker_leo` | `player123` | Player with Coach Visibility ENABLED |
| **Player** | `hoops_jordan` | `player123` | Player with Coach Visibility DISABLED |
