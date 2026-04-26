# Deployment Guide - QR.SaaS

Follow these steps to take your Dynamic QR platform live.

## 1. Database (Aiven MySQL)
1. Create a free account at [Aiven.io](https://aiven.io/).
2. Start a **MySQL** service (Free Tier).
3. Copy the **Service URI**. It should look like `mysql+pymysql://...`.

## 2. Backend (Render)
1. Connect GitHub to [Render.com](https://render.com/).
2. Create a **Web Service**.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `pip install -r requirements.txt`.
5. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add **Env Vars**: `DATABASE_URL` (from Aiven) and `SECRET_KEY`.

## 3. Frontend (Vercel)
1. Open `frontend/js/api.js` and change `API_BASE_URL` to your Render URL.
2. Push changes to GitHub.
3. Import project to [Vercel.com](https://vercel.com/).
4. Set **Root Directory** to `frontend`.
5. Deploy.
