require('dotenv').config();
const express = require('express');
const sosRoutes = require('./src/routes/sos.routes');

const app = express();
app.use(express.json());

app.use('/sos', sosRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`SOS service running on port ${PORT}`);
});