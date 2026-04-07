require('dotenv').config();
const express = require('express');
const mentalhealthRoutes = require('./src/routes/mentalhealth.routes');

const app = express();
app.use(express.json());

app.use('/mentalhealth', mentalhealthRoutes);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Mental health service running on port ${PORT}`);
});