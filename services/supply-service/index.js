require('dotenv').config();
const express = require('express');
const supplyRoutes = require('./src/routes/supply.routes');

const app = express();
app.use(express.json());

app.use('/supply', supplyRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Supply service running on port ${PORT}`);
});