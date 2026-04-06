require('dotenv').config();
const express = require('express');
const safezoneRoutes = require('./src/routes/safezone.routes');

const app = express();
app.use(express.json());

app.use('/safezone', safezoneRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Safezone service running on port ${PORT}`);
});