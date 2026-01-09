# 🚀 Quick Start Guide - Solar Panel Efficiency Optimizer

## Prerequisites
- Node.js 16+ installed
- MongoDB running on localhost:27017
- Terminal/Command Prompt

---

## 🏃 Quick Start (5 Minutes)

### Step 1: Start MongoDB
```bash
# Make sure MongoDB is running
# Windows: Check Services or run mongod
# Mac/Linux: sudo service mongod start
```

### Step 2: Start Backend Server
```bash
# Open terminal in project root
cd solar-efficiency-backend

# Install dependencies (first time only)
npm install

# Start the server
npm run dev

# Server will start on http://localhost:5000
# You should see: "MongoDB Connected" and "Server running on port 5000"
```

### Step 3: Start Frontend (New Terminal)
```bash
# Open NEW terminal in project root
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev

# Frontend will start on http://localhost:5173
# Browser should open automatically
```

### Step 4: Test the Application

#### Option A: Use Demo Account (Recommended)
The backend automatically creates test users on first run.

**Test User:**
- Email: `judge@demo.com`
- Password: `Password123`

**Admin User:**
- Email: `admin@demo.com`
- Password: `Password123`

#### Option B: Register New Account
1. Click "Get Started Free" or "Register"
2. Fill in your details
3. Login with your new credentials

---

## 🎯 Quick Test Flow

### 1. Login
- Navigate to http://localhost:5173
- Click "Sign In"
- Use test credentials above

### 2. Run Solar Analysis
- Click "Start New Analysis" or "Analyze" in navbar
- Click "Fill Demo Data" button (saves time!)
- Review the pre-filled data
- Click "Analyze Solar System"
- Wait 2-3 seconds for analysis
- View results with charts and recommendations

### 3. Check Dashboard
- Click "Dashboard" in navbar
- See your analysis history
- Try different filters (Recent, High Efficiency, Needs Attention)
- Click "View Details" on any analysis
- Try deleting an old analysis

### 4. Admin Panel (Admin users only)
- Login with admin account
- Click "Admin" in navbar
- View statistics overview
- Switch between "Users Management" and "Analysis Requests" tabs
- Try changing a user's role
- View all analysis requests

---

## 🔧 Troubleshooting

### Backend Issues

**Error: MongoDB connection failed**
```bash
# Solution: Start MongoDB service
# Windows: 
services.msc → MongoDB → Start

# Mac/Linux:
sudo service mongod start
```

**Error: Port 5000 already in use**
```bash
# Solution 1: Change port in backend/.env
PORT=5001

# Solution 2: Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**Error: Cannot connect to backend**
```bash
# Check if backend is running on port 5000
# Open http://localhost:5000 in browser
# Should see "Cannot GET /"

# If not running, start backend:
cd solar-efficiency-backend
npm run dev
```

**Error: Blank page after npm run dev**
```bash
# Clear browser cache
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# Or try incognito mode
```

### Common Issues

**"Invalid token" or auto-logout**
```bash
# Clear browser storage
# Open DevTools (F12)
# Application → Local Storage → Clear All
# Refresh page and login again
```

**Form validation errors**
```bash
# Use "Fill Demo Data" button
# This ensures all fields have valid values
```

---

## 📊 Test Scenarios

### Scenario 1: New User Journey
1. Register new account
2. Login
3. Run first analysis (use demo data)
4. View results
5. Go to dashboard
6. Run second analysis with different data
7. Compare results

### Scenario 2: Admin Operations
1. Login as admin
2. Go to admin panel
3. View user list
4. Create a new test user (via register page)
5. Go back to admin panel
6. Change new user's role to admin
7. Check analysis requests tab
8. Verify your analyses appear

### Scenario 3: UI/UX Testing
1. Open on different screen sizes
2. Test mobile menu (resize browser < 768px)
3. Try all navigation links
4. Test hover effects on cards/buttons
5. Verify animations (fade in, slide in)
6. Check responsive grid layouts

---

## 🎨 Demo Data Explanation

When you click "Fill Demo Data", the form populates with:

- **Location**: Mumbai, Maharashtra (19.0760° N, 72.8777° E)
- **Roof**: 50 sq meters, Sloped, 30° tilt, South facing
- **Current System**: 3 kW, 2 years old
- **Shading**: Minimal (10%)
- **Weather**: 5.5 kWh/m²/day irradiance, 28°C temperature
- **Consumption**: 300 kWh/month
- **Electricity Rate**: ₹8/kWh

This data represents a typical residential solar installation in India.

---

## 🔐 Default Accounts

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Admin | admin@demo.com | Password123 | Full access + admin panel |
| User | judge@demo.com | Password123 | Analysis + dashboard |

**Note**: Change these passwords in production!

---

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🚨 Important Notes

1. **First Run**: Backend automatically creates test users on first start
2. **Demo Data**: Use "Fill Demo Data" for quick testing
3. **Admin Routes**: May need to restart backend if admin features don't work
4. **Email**: Forgot password generates token in console (no actual email sent)
5. **ML Model**: Currently uses mock predictions (not real ML yet)

---

## 📞 Support

If you encounter issues:

1. Check console logs (F12 → Console)
2. Verify MongoDB is running
3. Ensure both servers are running
4. Clear browser cache/storage
5. Check port conflicts

---

## 🎉 Next Steps

After testing:
1. Explore different roof configurations
2. Try various shading levels
3. Compare analyses in dashboard
4. Test admin features
5. Check responsive design on mobile
6. Review generated charts and metrics

---

## 🔄 Restart Everything

If things get stuck:

```bash
# Stop all servers (Ctrl+C in both terminals)

# Restart backend
cd solar-efficiency-backend
npm run dev

# Restart frontend (new terminal)
cd frontend
npm run dev

# Clear browser storage
# F12 → Application → Clear storage
```

---

**Happy Testing! 🌞**

---

## Quick Command Reference

```bash
# Backend
cd solar-efficiency-backend
npm install          # First time only
npm run dev          # Start backend server

# Frontend
cd frontend
npm install          # First time only
npm run dev          # Start frontend server

# MongoDB
mongod               # Start MongoDB (if not running)

# Check if services are running
netstat -ano | findstr :5000    # Backend (Windows)
netstat -ano | findstr :5173    # Frontend (Windows)
lsof -ti:5000                   # Backend (Mac/Linux)
lsof -ti:5173                   # Frontend (Mac/Linux)
```
