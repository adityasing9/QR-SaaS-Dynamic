# QR.SaaS - Production Dynamic QR Code Platform

A complete, production-ready Dynamic QR Code SaaS platform with advanced analytics, rule-based smart redirects, and A/B testing.

## 🚀 Live Demo Links
* **GitHub Repository:** [https://github.com/adityasing9/QR-SaaS-Dynamic](https://github.com/adityasing9/QR-SaaS-Dynamic)
* **Live Frontend:** [https://qr-saa-s-dynamic.vercel.app](https://qr-saa-s-dynamic.vercel.app)
* **Live Backend API:** [https://qr-saas-dynamic.onrender.com](https://qr-saas-dynamic.onrender.com)

---

## 📌 Features
* **Dynamic QR Codes:** Generate QR codes once, change the destination URL anytime.
* **Smart Redirect Engine:** 
    * **Country-based:** Redirect users based on their location.
    * **Device-based:** Different links for Mobile vs Desktop.
    * **Time-based:** Schedule redirects based on time of day.
* **A/B Testing:** Split traffic between two URLs to optimize performance.
* **In-depth Analytics:** Track total scans, unique visitors, devices, countries, and OS.
* **Security:** Set expiry dates and scan limits for links.
* **User Auth:** Secure JWT-based authentication.

---

## 🛠️ Tech Stack
* **Backend:** Python (FastAPI), SQLAlchemy ORM.
* **Database:** MySQL (Aiven/TiDB).
* **QR Engine:** Python `qrcode` library.
* **Frontend:** Vanilla HTML5, CSS3 (Modern Glassmorphism), JavaScript (Modular Fetch).
* **Design:** Custom UI with Inter & Outfit typography.

---

## ⚙️ Setup & Deployment
For a detailed step-by-step guide on how to deploy this project to the cloud (Aiven + Render + Vercel), see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Local Backend:
1. **Clone and Enter Backend:**
   ```bash
   cd backend
   ```
2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure Environment:**
   Create a `.env` file:
   ```env
   DATABASE_URL=mysql+pymysql://user:pass@host/dbname
   SECRET_KEY=your_super_secret_key
   ```
4. **Run Server:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend:
1. **Configure API URL:**
   Update `API_BASE_URL` in `frontend/js/api.js`.
2. **Run Simple Server:**
   ```bash
   cd frontend
   python -m http.server 8080
   ```

---

## ▶️ How to Run
1. Clone the repository.
2. Start the FastAPI backend (it will automatically create tables in your MySQL DB).
3. Open `frontend/index.html` in your browser.
4. Sign up and start creating dynamic links!

---

## 📊 Future Improvements
* **Custom Domains:** Allow users to connect their own domains for short links.
* **Bulk Upload:** Create hundreds of QR codes via CSV/Excel.
* **PDF Reports:** Export analytics as PDF for clients.
* **API for Developers:** Public API for third-party integrations.

## 👨‍💻 Author
**Antigravity AI**
Designed for High-Performance SaaS scalability.
