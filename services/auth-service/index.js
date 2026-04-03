require('dotenv').config();
const express = require('express');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});