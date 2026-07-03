# CalorieTracker

CalorieTracker is a full-stack nutrition and fitness tracking app with a Django REST API backend and a React + Vite frontend.

## Tech Stack

- Backend: Django, Django REST Framework, SimpleJWT
- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Database: SQLite (default in this repo)

## Project Structure

- `backend/`: Django project settings and URL config
- `api/`: REST API app (auth, profile, meals, calories, diet plans, insights, workouts)
- `app/`: React frontend
- `docs/API_ENDPOINTS.md`: endpoint reference

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Backend Setup

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

## Frontend Setup

```bash
cd app
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173` (default Vite port).

## Core Features

- JWT auth (`register`, `login`, `me`)
- User profile with calorie-related metrics
- Meal logging and daily/weekly calorie tracking
- Diet plan generation and retrieval
- Workout suggestions and insights
- Food image analysis endpoint

## API Base

- Base URL: `http://127.0.0.1:8000/api/v1`
- Detailed docs: `docs/API_ENDPOINTS.md`

## Notes

- Gemini API key usage in `api/services/ai_service.py` is currently disabled, so AI features fall back to default responses.

