# 🍽️ theOGMenu

**Digital QR Menus for Indian Restaurants**

A SaaS platform enabling small restaurants in India to create, manage, and share beautiful digital menus via QR codes.

## Features

- 📱 **QR Code Menus** — Generate branded QR codes that open beautiful digital menus
- 🌐 **Multi-Language** — English, Hindi, and expandable to all Indian languages
- 📸 **Photo Gallery** — Showcase food, ambience, and events
- ⭐ **Customer Reviews** — Collect and moderate customer experiences
- 📍 **Google Maps Integration** — Link your Google Business page
- ⚡ **Real-time Updates** — Change prices and availability instantly
- 💬 **WhatsApp Ordering** — "Order via WhatsApp" button with pre-filled items

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, next-intl |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL 16 |
| Auth | Firebase Auth (phone OTP) + JWT |
| Images | Cloudinary |
| Styling | Vanilla CSS (design tokens) |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux

# Run database migrations
alembic upgrade head

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment config
copy .env.local.example .env.local  # Windows

# Start the frontend
npm run dev
```

Frontend will be running at `http://localhost:3000`

### Development Mode

Firebase credentials are optional for local development. Without them, the auth system runs in "dev mode" where any phone number works and OTP verification is skipped.

## Project Structure

```
theOGMenu/
├── frontend/          # Next.js 14 App
│   └── src/
│       ├── app/[locale]/   # i18n-routed pages
│       ├── lib/            # API client, auth, utils
│       ├── styles/         # Design system
│       └── i18n/           # Translation messages
├── backend/           # FastAPI Python App
│   └── app/
│       ├── api/v1/         # REST API routes
│       ├── models/         # SQLAlchemy ORM models
│       ├── schemas/        # Pydantic DTOs
│       ├── services/       # Business logic
│       └── utils/          # JWT, Cloudinary helpers
└── docker-compose.yml # Local PostgreSQL
```

## License

Private — All rights reserved.
