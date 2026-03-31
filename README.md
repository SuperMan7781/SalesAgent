# 🚀 Autonomous SDR - Showcase App

An AI-driven hyper-contextual Sales Development Representative built with **FastAPI** (Backend) and **Next.js** (Frontend). 

This application orchestrates multi-agent pipelines starting from lead generation, campaign analysis, to real-time analytics.

---

## 🏗️ Architecture

This is a **monorepo** containing two main components:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python, FastAPI, LiteLLM, Celery | API and AI automation server with WebSockets support. |
| **Frontend** | React, Next.js, Framer Motion, TailWindCSS | Intuitive Dashboard for tracking campaign health, analysis, and leads. |

---

## 🛠️ Local Development Setup

### 1. Backend Setting
Ensure you are using the virtual environment or `uv` to manage dependencies. From the root directory:

```powershell
cd backend
uv sync  # OR uv pip install -r requirements.txt
uv run uvicorn app.main:app --reload
```

### 2. Frontend Setting
```powershell
cd frontend
npm install
npm run dev
```

---

## 🌍 Production Deployment 
This project is pre-configured for **Dockerized production deployment** (specifically on Platforms like Render / Railway / Vercel).

👉 Refer to **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for step-by-step cloud setup instructions.
