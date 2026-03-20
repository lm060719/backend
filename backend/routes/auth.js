const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_change_in_prod'; // 生产环境请改！

// 注册
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], function(err) {
      if (err && err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      if (err) return res.status(500).json({ error: '注册失败' });
      res.json({ message: '注册成功' });
    });
  } catch (e) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id, password_hash FROM users WHERE username = ?', [username], async (err, row) => {
    if (err || !row) return res.status(400).json({ error: '用户名或密码错误' });
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) return res.status(400).json({ error: '用户名或密码错误' });
    const token = jwt.sign({ userId: row.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
});

module.exports = router;