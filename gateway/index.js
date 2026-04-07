require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE,
  changeOrigin: true
}));

app.use('/sos', createProxyMiddleware({
  target: process.env.SOS_SERVICE,
  changeOrigin: true
}));

app.use('/supply', createProxyMiddleware({
  target: process.env.SUPPLY_SERVICE,
  changeOrigin: true
}));

app.use('/safezone', createProxyMiddleware({
  target: process.env.SAFEZONE_SERVICE,
  changeOrigin: true
}));

app.use('/heartbeat', createProxyMiddleware({
  target: process.env.HEARTBEAT_SERVICE,
  changeOrigin: true
}));

app.use('/mentalhealth', createProxyMiddleware({
  target: process.env.MENTALHEALTH_SERVICE,
  changeOrigin: true
}));

app.get('/health', (req, res) => {
  res.json({ status: 'Gateway running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});