const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const dreamRoutes = require('./routes/dreams');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// 静态文件（前端）
app.use(express.static(path.join(__dirname, '../frontend')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);

// 兜底路由（SPA）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Dream Diary 服务运行在 http://localhost:${PORT}`);
});