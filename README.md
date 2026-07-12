# AssetFlow

**AssetFlow** is an intelligent, AI-powered enterprise asset management system built for the modern organization. Designed with a premium interface and robust architecture, it streamlines asset tracking, allocations, maintenance, and auditing processes.

## ✨ Key Features

- **📊 Comprehensive Dashboard**: Gain immediate insights with real-time financial metrics, AI diagnostics, and interactive Recharts-powered graphs.
- **📦 Asset & Inventory Management**: Track the complete lifecycle of assets, from procurement to retirement. Use AI to predict maintenance needs and analyze asset health.
- **🔄 Allocations & Transfers**: Seamlessly assign assets to employees or process transfer requests with an intuitive workflow.
- **🛠️ Predictive Maintenance**: Log maintenance requests, track issue resolutions, and utilize AI diagnostics for rapid troubleshooting and downtime reduction.
- **📅 Interactive Bookings**: Manage asset reservations via a Google Calendar-style interface.
- **🔐 Role-Based Access Control (RBAC)**: Secure access tailored for Admins, Asset Managers, Department Heads, and Employees.
- **🤖 AI Assistant**: A dedicated copilot to analyze reports, suggest actions, and help navigate the asset database.

## 🛠️ Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React) + TypeScript + Vanilla CSS / CSS Modules
- **Backend**: Node.js + Express
- **Machine Learning / AI**: Python-based ML services for predictive maintenance and diagnostics
- **Database**: MongoDB
- **UI & Visualization**: Lucide React (Icons), Recharts (Analytics), React-Big-Calendar

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- MongoDB running locally or remotely
- Python 3.8+ (for the ML backend)

### 1. Setup the Backend
Navigate to the backend directory and install dependencies:
```bash
cd Backend
npm install
```
Set up your `.env` file based on `.env.example`, ensuring your MongoDB URI and necessary AI keys are configured.
```bash
npm run dev
```

### 2. Setup the Frontend
Navigate to the frontend directory:
```bash
cd Frontend
npm install
```
Start the development server:
```bash
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 3. Setup the ML Backend (Optional but recommended)
Navigate to the ML directory to spin up the Python endpoints for AI diagnostics.
```bash
cd Backend-ml
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🎨 UI/UX Philosophy
AssetFlow was designed with an extreme focus on aesthetics. The UI features dynamic glassmorphism, responsive micro-animations, tailored HSL color palettes, and completely custom modal interfaces replacing native browser prompts—providing an enterprise experience that feels alive and premium.

## 👥 Contributors
Developed as part of the Odoo Hackathon.