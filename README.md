# SKYLINE ARS — Professional Light Theme Frontend
### React.js Frontend for Airline Reservation Management System
**Group:** Muhammad Shayan (24F-CS-19) · Insa Azhar (24F-CS-20) · Ahmed Waseem (24F-CS-21)
**Course:** Software Engineering | **Instructor:** Dr. Fida Hussain Khoso | **DUET 2025**

---

## Tech Stack
- React 18
- Chart.js + react-chartjs-2 (COCOMO II + reliability charts)
- Axios (API calls to Express backend)
- react-hot-toast (notifications)
- Professional light theme — Inter + DM Mono fonts

---

## Local Development

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Configure API URL
```bash
cp .env.example .env
# Edit .env — set your Railway backend URL:
REACT_APP_API_URL=https://your-backend.up.railway.app
```

### Step 3 — Run
```bash
npm start
# Opens at http://localhost:3000
```

---

## Deploy on Vercel

### Method 1 — Vercel CLI (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
# When prompted, set env var:
# REACT_APP_API_URL = https://your-backend.up.railway.app
```

### Method 2 — Vercel Dashboard
1. Push this folder to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Framework: Create React App (auto-detected)
4. Add environment variable:
   - Key:   REACT_APP_API_URL
   - Value: https://your-railway-backend.up.railway.app
5. Click Deploy → Done!

---

## Demo Accounts
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Passenger (Silver) | passenger1 | pass123 |
| Passenger (Bronze) | passenger2 | pass123 |
| Passenger (Gold) | passenger3 | pass123 |

---

## Modules
| Module | Role |
|--------|------|
| Dashboard | Admin stats, charts, activity |
| Flight Management | Full CRUD + status updates |
| Passenger Management | Register, view, delete |
| Booking Management | Create, cancel, filter |
| Seat Map | Visual aircraft layout |
| Maintenance Demo | 6-step IEEE 1219 simulation |
| Backup & Recovery | Backup + restore |
| Cost Model | Live COCOMO II + charts |
| Issue Tracker | Log and resolve issues |
| Passenger Portal | Book, cancel, profile, miles |
