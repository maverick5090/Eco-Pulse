const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { generateCampusData } = require('./simulator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 5000;

// IN-MEMORY STUDENT SIMULATION STATE
// Maintains state for each student session
// Separate from localStorage to enable server-side validation and notifications
const studentSessions = new Map(); // socketId -> studentState

// Student state object structure
function createStudentState(userId) {
  return {
    userId: userId,
    chargerOn: false,
    chargerTurnedOnAt: null,
    lightsOn: false,
    lightsTurnedOnAt: null,
    ecoPointsTotal: 0,
    ecoPointsToday: 0,
    chargerDurationViolation: false,
    chargerViolationTriggeredAt: null,
    lightsDaytimeViolation: false,
    lightsViolationTriggeredAt: null,
    connectedAt: new Date().toISOString()
  };
}

// Serve static files
app.use(express.static('.'));

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// SOCKET.IO CONNECTION HANDLING
io.on('connection', (socket) => {
  console.log(`[CONNECTION] Client connected: ${socket.id}`);

  // STUDENT LOGIN event
  // Initialize student session state when student logs in
  socket.on('studentLogin', (data) => {
    const { username, userRole } = data;
    
    if (userRole !== 'student') {
      console.log(`[SECURITY] Non-student attempt to register as student: ${username}`);
      return;
    }

    // Create new student session in server memory
    const studentState = createStudentState(username);
    studentSessions.set(socket.id, studentState);

    console.log(`[STUDENT] ${username} logged in - Session: ${socket.id}`);
    socket.emit('studentLoginAck', { 
      message: 'Logged in successfully',
      sessionId: socket.id 
    });
  });

  // CHARGER TOGGLE event
  // Listen for charger ON/OFF actions from student
  // Update server-side state and emit notifications back
  socket.on('chargerToggle', (data) => {
    const studentState = studentSessions.get(socket.id);
    if (!studentState) {
      console.log(`[ERROR] Charger toggle received but no session found: ${socket.id}`);
      return;
    }

    const { chargerOn } = data;
    studentState.chargerOn = chargerOn;

    if (chargerOn) {
      // CHARGER TURNED ON: capture timestamp
      studentState.chargerTurnedOnAt = new Date().toISOString();
      console.log(`[STUDENT] ${studentState.userId} - Charger turned ON`);
      socket.emit('notification', {
        type: 'device',
        message: '⚡ Charger turned ON',
        timestamp: new Date().toISOString()
      });
    } else {
      // CHARGER TURNED OFF: clear timestamp and check for eco points
      const previouslyViolating = studentState.chargerDurationViolation;
      studentState.chargerTurnedOnAt = null;
      
      console.log(`[STUDENT] ${studentState.userId} - Charger turned OFF`);

      // Award eco points if charger was violating the 3-minute rule
      if (previouslyViolating && studentState.chargerViolationTriggeredAt) {
        const violationTime = new Date(studentState.chargerViolationTriggeredAt);
        const nowTime = new Date();
        const minutesSinceViolation = (nowTime - violationTime) / (1000 * 60);

        let pointsAwarded = 0;
        let bonusMessage = '';

        // Award +10 bonus points if action taken within 2 minutes
        if (minutesSinceViolation <= 2) {
          pointsAwarded = 10;
          bonusMessage = ' (Bonus +10 for quick action!)';
        } else {
          pointsAwarded = 5;
        }

        // Update student state
        studentState.ecoPointsTotal += pointsAwarded;
        studentState.ecoPointsToday += pointsAwarded;

        console.log(`[ECO_POINTS] ${studentState.userId} earned +${pointsAwarded} for turning off charger`);

        // Emit eco points update to client
        socket.emit('ecoPointsUpdate', {
          pointsAwarded: pointsAwarded,
          totalPoints: studentState.ecoPointsTotal,
          todayPoints: studentState.ecoPointsToday,
          message: `🎉 +${pointsAwarded} eco points earned${bonusMessage}`
        });
      }

      socket.emit('notification', {
        type: 'device',
        message: '⚡ Charger turned OFF',
        timestamp: new Date().toISOString()
      });
    }

    // Emit updated state to client
    socket.emit('studentStateUpdate', studentState);
  });

  // LIGHTS TOGGLE event
  // Listen for lights ON/OFF actions from student
  // Update server-side state and emit notifications back
  socket.on('lightsToggle', (data) => {
    const studentState = studentSessions.get(socket.id);
    if (!studentState) {
      console.log(`[ERROR] Lights toggle received but no session found: ${socket.id}`);
      return;
    }

    const { lightsOn } = data;
    studentState.lightsOn = lightsOn;

    if (lightsOn) {
      // LIGHTS TURNED ON: capture timestamp
      studentState.lightsTurnedOnAt = new Date().toISOString();
      console.log(`[STUDENT] ${studentState.userId} - Lights turned ON`);
      socket.emit('notification', {
        type: 'device',
        message: '💡 Lights turned ON',
        timestamp: new Date().toISOString()
      });
    } else {
      // LIGHTS TURNED OFF: clear timestamp and check for eco points
      const previouslyViolating = studentState.lightsDaytimeViolation;
      studentState.lightsTurnedOnAt = null;

      console.log(`[STUDENT] ${studentState.userId} - Lights turned OFF`);

      // Award eco points if lights were violating the daytime rule
      if (previouslyViolating && studentState.lightsViolationTriggeredAt) {
        const violationTime = new Date(studentState.lightsViolationTriggeredAt);
        const nowTime = new Date();
        const minutesSinceViolation = (nowTime - violationTime) / (1000 * 60);

        let pointsAwarded = 0;
        let bonusMessage = '';

        // Award +10 bonus points if action taken within 2 minutes
        if (minutesSinceViolation <= 2) {
          pointsAwarded = 10;
          bonusMessage = ' (Bonus +10 for quick action!)';
        } else {
          pointsAwarded = 5;
        }

        // Update student state
        studentState.ecoPointsTotal += pointsAwarded;
        studentState.ecoPointsToday += pointsAwarded;

        console.log(`[ECO_POINTS] ${studentState.userId} earned +${pointsAwarded} for turning off lights`);

        // Emit eco points update to client
        socket.emit('ecoPointsUpdate', {
          pointsAwarded: pointsAwarded,
          totalPoints: studentState.ecoPointsTotal,
          todayPoints: studentState.ecoPointsToday,
          message: `🎉 +${pointsAwarded} eco points earned${bonusMessage}`
        });
      }

      socket.emit('notification', {
        type: 'device',
        message: '💡 Lights turned OFF',
        timestamp: new Date().toISOString()
      });
    }

    // Emit updated state to client
    socket.emit('studentStateUpdate', studentState);
  });

  // RULE VIOLATION event
  // Student notifies server when rule is violated (client-side detection)
  // Server updates state and may trigger server-side notifications
  socket.on('ruleViolation', (data) => {
    const studentState = studentSessions.get(socket.id);
    if (!studentState) {
      console.log(`[ERROR] Rule violation received but no session found: ${socket.id}`);
      return;
    }

    const { type, triggered } = data;

    if (type === 'chargerDuration') {
      studentState.chargerDurationViolation = triggered;
      if (triggered) {
        studentState.chargerViolationTriggeredAt = new Date().toISOString();
        console.log(`[RULE_VIOLATION] ${studentState.userId} - Charger duration violation triggered`);
      } else {
        console.log(`[RULE_RESOLVED] ${studentState.userId} - Charger duration violation resolved`);
      }
    } else if (type === 'lightsDaytime') {
      studentState.lightsDaytimeViolation = triggered;
      if (triggered) {
        studentState.lightsViolationTriggeredAt = new Date().toISOString();
        console.log(`[RULE_VIOLATION] ${studentState.userId} - Lights daytime violation triggered`);
      } else {
        console.log(`[RULE_RESOLVED] ${studentState.userId} - Lights daytime violation resolved`);
      }
    }

    // Acknowledge rule violation receipt
    socket.emit('ruleViolationAck', { type, triggered });
  });

  // CLIENT DISCONNECT event
  // Clean up student session from memory
  socket.on('disconnect', () => {
    const studentState = studentSessions.get(socket.id);
    if (studentState) {
      console.log(`[DISCONNECT] Student ${studentState.userId} disconnected - removing session`);
      studentSessions.delete(socket.id);
    } else {
      console.log(`[DISCONNECT] Client disconnected: ${socket.id}`);
    }
  });
});

// CAMPUS DATA BROADCAST for Professors
// Independent from student state - only affects professor dashboard
// Emits every 5 seconds
setInterval(() => {
  const campusData = generateCampusData();
  io.emit('campusData', campusData);
  console.log('[CAMPUS] Emitted campus data to all connected clients');
}, 5000);

// STUDENT MONITORING
// Check server-side student states periodically for rule violations
// Could trigger server-side alerts if needed
setInterval(() => {
  const now = new Date();
  
  for (const [socketId, state] of studentSessions.entries()) {
    // Check charger duration rule (server-side validation)
    if (state.chargerOn && state.chargerTurnedOnAt) {
      const turnedOnTime = new Date(state.chargerTurnedOnAt);
      const durationMinutes = (now - turnedOnTime) / (1000 * 60);

      if (durationMinutes > 3 && !state.chargerDurationViolation) {
        state.chargerDurationViolation = true;
        state.chargerViolationTriggeredAt = now.toISOString();
        // Would emit server-side alert if needed
      }
    }

    // Check lights daytime rule (server-side validation)
    if (state.lightsOn && state.lightsTurnedOnAt) {
      const currentHour = now.getHours();
      const isDaytime = currentHour >= 6 && currentHour < 18;

      if (isDaytime && !state.lightsDaytimeViolation) {
        state.lightsDaytimeViolation = true;
        state.lightsViolationTriggeredAt = now.toISOString();
        // Would emit server-side alert if needed
      }
    }
  }
}, 2000);

server.listen(PORT, () => {
  console.log(`\n[SERVER] Eco Pulse server starting...`);
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
  console.log(`[SERVER] Static files served from: ${__dirname}`);
  console.log(`[READY] Accepting student and professor connections`);
  console.log(`[READY] Access login at: http://localhost:${PORT}/login.html\n`);
});
