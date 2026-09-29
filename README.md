# 🐛 Bug Museum (Version 1.0)

> A full-stack developer platform designed to document, debug, and archive technical issues using AI assistance and community collaboration.

---

## 🌟 Key Features

- **Dual-State Content Engine:** Categorizes exhibits into **🤖 Open Questions** (unresolved bugs needing help) and **📜 Archived Post-Mortems** (resolved issues with root-cause analysis and lessons learned).
- **Generative AI Diagnostics:** Integrates Google Gemini API to automatically generate instant 3-step diagnostic guides for open questions and executive summaries for resolved post-mortems.
- **Community Solution Engine:** Threaded proposal system allowing community curators to post fixes, with author-driven solution acceptance.
- **Granular Filtering:** Real-time gallery filtering by status mode, programming language, category (_Frontend, Backend, Database, Security, DevOps, Concurrency_), and difficulty (_Beginner_ to _Senior Nightmare_).
- **Security & Persistence:** JWT authentication, curator authorization guards, photo exhibit uploads, and upvote reactions.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** `useSyncExternalStore` (Local Authentication Sync)

### Backend

- **Framework:** ASP.NET Core 8 Web API
- **ORM:** Entity Framework Core
- **Database:** PostgreSQL
- **AI Integration:** Google Gemini API (`generativelanguage.googleapis.com`)
- **Media Management:** Cloudinary Service

---
