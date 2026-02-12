# Eco Pulse - Net Zero Campus Simulation Platform

A comprehensive web-based system for monitoring and managing campus sustainability with role-based dashboards, real-time energy tracking, and gamified student engagement.

## 🚀 Quick Start

### Prerequisites
- Node.js v24+ 
- npm (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Startup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js
# Server will run on http://localhost:5000

# 3. Open in browser
# Navigate to: http://localhost:5000/login.html
```

## 📁 Project Structure

### Frontend Pages

| File | Purpose | Role |
|------|---------|------|
| `login.html` | User authentication with role selection | Entry point |
| `index.html` | Main dashboard with campus overview | Professor/Student shared |
| `student.html` | Personal energy control dashboard | Student only |
| `professor.html` | Campus-wide analytics & metrics | Professor/Admin only |
| `energy.html` | Detailed energy & solar analytics | All authenticated users |
| `waste.html` | Waste monitoring & bin status | All authenticated users |
| `insights.html` | Sustainability insights & analytics | All authenticated users |
| `about.html` | Project information & features | All authenticated users |
| `navbar.html` | Shared navigation component | Reference only |

### Backend Files

| File | Purpose |
|------|---------|
| `server.js` | Node.js/Express/Socket.IO server |
| `package.json` | Project dependencies |
| `simulator.js` | Data simulation utilities |
| `shared.js` | Shared utility functions |

### JavaScript Utilities

| File | Purpose |
|------|---------|
| `navbar-injector.js` | Dynamic navbar injection script |

## 🔐 Authentication System

### Login Flow

```
User visits login.html
    ↓
Selects role (Professor/Student)
Enters username & password
    ↓
Credentials stored in localStorage
    ↓
Redirects to appropriate dashboard
    ↓
Role & protected by initializeUser() function on each page
```

### Session Storage Keys

```javascript
localStorage.setItem('username', 'john_doe');
localStorage.setItem('userRole', 'student'); // or 'professor'
localStorage.setItem('simulationState', {...}); // Student data only
```

## 👥 User Roles

### Student Dashboard (`student.html`)
**Access**: Restricted to users with role='student'

**Features**:
- Toggle charger & lights devices ON/OFF
- Real-time eco points tracking
  - +5 points for turning devices OFF when violating rules
  - +10 bonus points if corrected within 2 minutes
- Real-time notifications for rule violations
- Total eco points (lifetime) and daily points tracking
- Rule-based violation detection

**Rules**:
- ⚠️ Charger ON for >3 minutes triggers violation
- ⚠️ Lights ON during 6am-6pm triggers violation

### Professor Dashboard (`professor.html`)
**Access**: Restricted to users with role='professor'

**Features**:
- Campus-wide metric cards:
  - Energy Usage (kWh)
  - Solar Generation (kWh)
  - Waste Level (%)
  - Carbon Score (tonnes CO₂)
- Animated Chart.js visualizations:
  - Energy trend line chart (12-hour history)
  - Supply vs Demand bar chart
- Active energy sources table
- Real-time metrics update every 3 seconds
- Campus data broadcast every 5 seconds

## 📊 Data Flow

### Simulated Campus Data

```javascript
// Generated every 5 seconds on server
{
  energyUsage: 800-1500 kWh,
  solarGeneration: 700-1000 kWh,
  wasteLevel: 55-75 %,
  carbonScore: 7-7.5 tonnes CO₂
}
```

### Student State (localStorage)

```javascript
{
  chargerOn: boolean,
  chargerStartTime: timestamp,
  lightsOn: boolean,
  lightsStartTime: timestamp,
  ecoPointsTotal: number,
  ecoPointsToday: number,
  violationHistory: [],
  lastCheckDate: YYYY-MM-DD
}
```

## 🔌 Socket.IO Events

### Server-Side Events

```javascript
// Listens for:
io.on('connection', (socket) => {
  socket.on('studentLogin', (data) => {...});
  socket.on('chargerToggle', (data) => {...});
  socket.on('lightsToggle', (data) => {...});
  socket.on('ruleViolation', (data) => {...});
  socket.on('disconnect', () => {...});
});

// Broadcasts:
io.emit('campusDataUpdate', {...}); // Every 5 seconds
```

## 🎮 Game Mechanics (Eco Points)

### Earning Points

1. **Base Award**: +5 points when device turned OFF after violating a rule
2. **Bonus Award**: +10 total points if turned OFF within 2 minutes of violation

### Point Calculation Logic

```
1. Device ON passes 3 seconds (charger) or is between 6am-6pm (lights)
2. Violation flag set, notification shown
3. When device turned OFF:
   - If violation happened <2 minutes ago → +10 points
   - Otherwise → +5 points
4. Points stored in localStorage, reset daily at midnight
```

## 🌐 Navbar Integration

### Method 1: Dynamic Injection (Recommended)

Add to your page's `<head>`:
```html
<script src="navbar-injector.js"></script>
```

Add at start of `<body>`:
```html
<div id="navbar-container"></div>
```

The navbar will automatically load from `navbar.html` with full styling and functionality.

### Method 2: Manual Copy

Copy the entire `<nav>` element and `<style>` block from `navbar.html` into your page.

### Navbar Features

- **Auto-Active Detection**: Highlights current page based on filename
- **User Info Display**: Shows logged-in username and role
- **Logout Button**: Clears session and redirects to login
- **Responsive Design**: Mobile-friendly hamburger menu
- **Navigation Links**:
  - Dashboard → index.html
  - Energy & Solar → energy.html
  - Waste Monitoring → waste.html
  - Student Zone → student.html
  - Insights → insights.html
  - About → about.html

## 🛡️ Role-Based Access Control

Every protected page has this initialization:

```javascript
function initializeUser() {
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    if (!username || !userRole) {
        window.location.href = 'login.html';
        return;
    }
    
    // Page-specific role check
    if (userRole !== 'student') {
        window.location.href = 'login.html';
    }
}

initializeUser(); // Called at page load
```

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Full layout with all features
- **Tablet**: Optimized grid layouts
- **Mobile**: Stacked layouts, touch-friendly buttons

## ⚙️ Simulation Details

### Update Frequencies

| Component | Update Interval | Purpose |
|-----------|-----------------|---------|
| Campus metrics | Every 5 seconds | Server broadcasts |
| Professor metrics display | Every 3 seconds | Visual updates |
| Student rule checking | Every 2 seconds | Real-time violation detection |
| Charts | On metric update | Visual data representation |

### Random Data Generation

```javascript
energyUsage = Math.floor(800 + Math.random() * 500);
solarGeneration = Math.floor(700 + Math.random() * 300);
wasteLevel = Math.floor(55 + Math.random() * 20);
carbonScore = Math.floor(7 + Math.random() * 0.5);
```

## 🔧 Server Configuration

### Express Static Serving

```javascript
app.use(express.static(__dirname));
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
```

### Socket.IO Configuration

```javascript
const io = require('socket.io')(server);
const studentSessions = new Map();

// Manages per-socket student state validation
```

## 📊 Chart.js Implementation

### Line Chart (Energy Trend)
- Shows 12-hour energy usage history
- New data added every 3 seconds
- Old data shifted out (moving window)
- Blue line with filled area

### Bar Chart (Supply vs Demand)
- Solar generation vs energy consumption
- Side-by-side comparison
- Yellow bars for solar, red for consumption
- Animated updates

## 🚨 Error Handling

### Common Issues & Solutions

**Issue**: Page redirects to login immediately
- **Cause**: Session expired or role mismatch
- **Solution**: Log back in with correct role

**Issue**: Charts not animating
- **Cause**: Chart instances not stored in global variables
- **Solution**: Verify `energyChart` and `balanceChart` are defined globally

**Issue**: Navbar not loading
- **Cause**: navbar.html not found or fetch failed
- **Solution**: Ensure navbar.html is in same directory, check browser console for errors

**Issue**: Socket.IO connection fails
- **Cause**: Server not running or port blocked
- **Solution**: Run `node server.js`, verify port 5000 is available

## 📝 Key Code Patterns

### Saving Student State

```javascript
function saveSimulationState() {
    localStorage.setItem('simulationState', JSON.stringify(simulationState));
}
```

### Loading Student State

```javascript
function loadSimulationState() {
    const stored = localStorage.getItem('simulationState');
    if (stored) {
        simulationState = JSON.parse(stored);
    }
    // Reset daily points if new day
    const today = new Date().toDateString();
    if (simulationState.lastCheckDate !== today) {
        simulationState.ecoPointsToday = 0;
        simulationState.lastCheckDate = today;
    }
}
```

### Checking Rules

```javascript
function checkChargerDuration() {
    if (simulationState.chargerOn) {
        const duration = Date.now() - simulationState.chargerStartTime;
        if (duration > 180000) { // 3 minutes
            simulationState.chargerDurationViolation = true;
            addNotification('⚠️ Charger ON for >3 minutes');
        }
    }
}
```

### Updating Charts

```javascript
function updateCharts() {
    if (!energyChart || !balanceChart) return;
    
    energyChart.data.datasets[0].data.shift();
    energyChart.data.datasets[0].data.push(campusState.energyUsage);
    energyChart.update('none');
    
    balanceChart.data.datasets[0].data = solarData;
    balanceChart.data.datasets[1].data = energyData;
    balanceChart.update('none');
}
```

## 🎨 Color Scheme

```css
Primary: #1a5490 (Dark Blue)
Secondary: #4caf50 (Green)
Warning: #ffd54f (Yellow)
Error: #f44336 (Red)
Success: #4caf50 (Green)
Background: #e8f4f8 or #f5f5f5
```

## 📚 Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO 4.6.1
- **Charts**: Chart.js
- **Storage**: localStorage (client), in-memory Map (server)

## 🔐 Security Notes

- Credentials stored in localStorage (demo only)
- No password hashing (simulation only)
- Client-side state validation backed by server checks
- Server-side eco points calculation to prevent cheating

## 📈 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication with JWT tokens
- [ ] Real sensor data integration
- [ ] Email notifications for violations
- [ ] Advanced analytics & reporting
- [ ] Mobile native app
- [ ] Multi-campus support
- [ ] API for third-party integrations

## 📄 License

This project is part of the Net Zero Campus Hackathon.

## 👥 Team

Built as a proof-of-concept for campus sustainability monitoring and student engagement.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Fully Functional Simulation
