require('dotenv').config();
const express = require('express');
const heartbeatRoutes = require('./src/routes/heartbeat.routes');
const { checkSilentUsers } = require('./src/controllers/heartbeat.controller');

const app = express();
app.use(express.json());

app.use('/heartbeat', heartbeatRoutes);

// watchdog runs every 30 seconds
setInterval(checkSilentUsers, 30 * 1000);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Heartbeat service running on port ${PORT}`);
});