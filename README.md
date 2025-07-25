**README.md**

# SalonConnect - MERN Stack Project

## Setup Instructions

1. Clone the repository:
bash
git clone https://github.com/yourusername/salonconnect.git
cd salonconnect


2. Install backend dependencies:
bash
cd backend
npm install
```
3. Install frontend dependencies:
bash
cd ../frontend
npm install


4. Create .env files:
   - backend/.env with MongoDB and Twilio credentials
   - frontend/.env with VITE_API_BASE_URL=/api

5. Run development environment:
bash
# In one terminal
cd backend
npm run dev

# In another terminal
cd frontend
npm run dev


## Deployment to Render

1. Push your code to a GitHub repository

2. Create a new Web Service on Render:
   - Connect your GitHub repository
   - Name: salonconnect-backend
   - Environment: Node.js
   - Build Command: npm install && npm run build
   - Start Command: node server.js
   - Add environment variables from backend/.env

3. Configure production frontend:
env
# frontend/.env.production
VITE_API_BASE_URL=https://salonconnect-backend.onrender.com/api


4. Build and deploy:
bash
cd frontend
npm run build


5. The application will be live at: https://salonconnect-backend.onrender.com
```

Setup and deployment instructions here...