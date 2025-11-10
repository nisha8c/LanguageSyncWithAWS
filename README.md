# 🌍 AutoLanguageSyncApp  
> **AI-Powered Cloud Translation Manager** — one English source → instant multilingual support across frontend & backend.

---

## 🧭 Overview  

**LinguaSync** is a centralized, AI-driven translation system that automatically syncs multilingual content between your frontend and backend.  
You only maintain **one English JSON file**, and LinguaSync handles:  

- 🌐 Automatic translation into all configured languages  
- ⚡ Real-time language switching (frontend + backend)  
- 🔄 Centralized updates — no redeploy needed  
- 🤖 AI-assisted translation (OpenAI)  
- 🧱 Shared localization between client and server  

💡 **Architecture:** Cloud-based translation sync — all translations live in one centralized database and are fetched dynamically via tRPC.

---

## 🧱 Tech Stack

| Layer | Tech | Purpose |
|--------|------|----------|
| **Frontend** | React (Vite) + i18next + React Query | Dynamic multilingual UI |
| **Backend** | Node.js + Express + tRPC | Unified type-safe API |
| **Database** | PostgreSQL + Prisma ORM | Persistent translation store |
| **AI Translation** | OpenAI GPT-4o-mini | Automatic generation of translations |
| **Caching** | React Query + optional Redis | Performance and scalability |
| **Environment** | dotenv | Secure API key management |

---



---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repo
```bash
git clone https://github.com/yourusername/linguasync.git
cd linguasync```








