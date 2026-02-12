# 🚀 Quick Start Guide - Eco Pulse

## Step 1: Start the Server

Open a terminal in the project directory and run:

```bash
node server.js
```

You should see:
```
✓ Server running on port 5000
```

## Step 2: Open in Browser

Navigate to: **http://localhost:5000/login.html**

## Step 3: Login

Choose your role:
- **Professor**: View campus-wide analytics dashboard
- **Student**: Access personal energy control dashboard

Use any username/password (it's simulated):
- Example: `john_doe` / `password123`

## 📱 Explore the App

### For Professors
1. Login as **Professor**
2. You'll see the **Campus Dashboard** (index.html)
3. View real-time:
   - Energy usage, solar generation, waste, carbon metrics
   - Animated energy trend chart
   - Supply vs demand chart
   - Active energy sources

### For Students
1. Login as **Student**
2. Navigate to **Student Zone** (student.html)
3. Control your devices:
   - Toggle charger ON/OFF
   - Toggle lights ON/OFF
   - Watch eco points accumulate!

**Rule Violations**:
- ⚠️ Charger ON for >3 min = violation (earn +5 points to fix it)
- ⚠️ Lights ON during 6am-6pm = violation (earn +5 points to fix it)
- 🎁 Fix within 2 minutes = +10 bonus points total!

## 📊 Pages & Navigation

Once logged in, use the navbar to access:

| Page | Purpose |
|------|---------|
| **Dashboard** | Home page with metrics |
| **Energy & Solar** | Detailed energy analytics |
| **Waste Monitoring** | Waste levels & recycling stats |
| **Student Zone** | Personal device control (students) |
| **Insights** | Sustainability analytics |
| **About** | Project information |

## 🎮 Try These Actions

### As a Student:
1. ✅ Turn ON your charger
2. 🕐 Wait 4+ minutes → See violation notification
3. ✅ Turn OFF charger quickly → +5 eco points (or +10 if <2 min)
4. 📊 Watch total eco points increase
5. 🌙 Turn ON lights during daytime → See violation
6. ✅ Turn OFF lights → Earn eco points

### As a Professor:
1. 👁️ Watch campus metrics update every 3 seconds
2. 📈 Observe charts animating with new data
3. 🔍 Review energy trends and efficiency
4. 📊 Monitor waste levels across campus

## 🔄 Real-Time Features

- **Campus Metrics**: Update every 5 seconds
- **Chart Animations**: Smooth updates every 3 seconds
- **Rule Checking**: Every 2 seconds for violations
- **Eco Points**: Awarded immediately

## 🛠️ Troubleshooting

**Q: Server won't start**
- Check if port 5000 is already in use
- Try: `node server.js` in a new terminal

**Q: Can't login**
- Refresh the page
- Clear localStorage: Open DevTools → Application→ localStorage → Clear

**Q: Charts not animating**
- Wait 3 seconds, they should update
- Check DevTools console for errors

**Q: Navbar not showing**
- If using navbar-injector.js, ensure navbar.html is present
- Refresh the page

## 📝 Example Data Flow

```
1. Login as Student
   ↓
2. Turn charger ON
   └─ Timestamp saved: chargerStartTime = now
   ↓
3. Wait 3+ minutes
   └─ Rule check every 2 seconds detects violation
   └─ Notification appears: "⚠️ Charger ON for >3 minutes"
   ↓
4. Turn charger OFF after 4 minutes
   └─ Violation duration: 4 min > 2 min window
   └─ Award: +5 eco points (base award)
   ↓
5. Points saved to localStorage
   └─ Total: increased
   └─ Today: increased
   └─ Persists on page refresh
```

## 🎓 Educational Note

This is a **simulation** demonstrating how a real campus sustainability dashboard would work. All data is randomly generated to show the system's capabilities.

## 💡 Key Insights

- **Eco Points** gamify sustainability choices
- **Rule Violations** encourage proper device usage
- **Real-time Updates** keep data fresh and engaging
- **Role-based Access** separates professor analytics from student controls

## 🤔 Next Steps

1. **Explore**: Try different roles and pages
2. **Experiment**: See how quickly you can earn eco points
3. **Analyze**: Check trends in the Insights page
4. **Learn**: Read about sustainability in About page

---

**Enjoy exploring Eco Pulse!** 🌱
