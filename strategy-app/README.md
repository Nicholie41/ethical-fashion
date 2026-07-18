# Enterprise Transformation & Strategy App (MERN + Python)

## Stack
- Frontend: React (Vite), Recharts, Socket.IO client
- Backend: Node.js, Express, MongoDB, Socket.IO
- Analytics: Python Flask, Pandas
- Orchestration: Docker Compose

## Quick Start (Local)
1. Install dependencies:
   - `cd frontend && npm install`
   - `cd ../backend && npm install`
   - `cd ../python-analytics && python -m venv venv`
   - `venv\\Scripts\\activate` (Windows) then `pip install -r requirements.txt`
2. Copy env examples (optional — defaults match localhost):
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
3. Run apps in three terminals:
   - `cd frontend && npm run dev`
   - `cd backend && npm run dev`
   - `cd python-analytics && venv\\Scripts\\activate && python app.py`
4. Open `http://localhost:3000`

Frontend URLs are configured via `VITE_BACKEND_URL` and `VITE_ANALYTICS_URL` (see `frontend/.env.example`).

## Quick Start (Docker)
1. Ensure Docker Desktop is running.
2. From root: `docker compose up --build`
3. Open `http://localhost:3000`

## Endpoints
- Backend health: `GET http://localhost:5000/health`
- Auth register: `POST http://localhost:5000/api/auth/register`
- Auth login: `POST http://localhost:5000/api/auth/login`
- Current user: `GET http://localhost:5000/api/auth/me`
- List initiatives: `GET http://localhost:5000/api/initiatives`
- Create initiative (admin/analyst): `POST http://localhost:5000/api/initiatives`
- Strategy updates: `POST http://localhost:5000/api/strategy/update`
- Analytics health: `GET http://localhost:5001/health`
- Forecast: `POST http://localhost:5001/forecast`
- Chart data: `GET http://localhost:5001/chart-data`
