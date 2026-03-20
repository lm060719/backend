const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_change_in_prod';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 获取所有梦境（仅返回加密内容）
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT id, dream_time, encrypted_content, mood, created_at FROM dreams WHERE user_id = ? ORDER BY dream_time DESC', [req.user.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    res.json(rows);
  });
});

// 添加梦境
router.post('/', authenticateToken, (req, res) => {
  const { dream_time, encrypted_content, mood } = req.body;
  if (!dream_time || !encrypted_content) return res.status(400).json({ error: '时间与内容必填' });
  db.run(
    'INSERT INTO dreams (user_id, dream_time, encrypted_content, mood) VALUES (?, ?, ?, ?)',
    [req.user.userId, dream_time, encrypted_content, mood || ''],
    function(err) {
      if (err) return res.status(500).json({ error: '保存失败' });
      res.json({ id: this.lastID });
    }
  );
});

// 更新梦境
router.put('/:id', authenticateToken, (req, res) => {
  const { dream_time, encrypted_content, mood } = req.body;
  db.run(
    'UPDATE dreams SET dream_time = ?, encrypted_content = ?, mood = ? WHERE id = ? AND user_id = ?',
    [dream_time, encrypted_content, mood, req.params.id, req.user.userId],
    function(err) {
      if (err || this.changes === 0) return res.status(500).json({ error: '更新失败' });
      res.json({ message: '更新成功' });
    }
  );
});

// 删除梦境
router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM dreams WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId], function(err) {
    if (err || this.changes === 0) return res.status(500).json({ error: '删除失败' });
    res.json({ message: '删除成功' });
  });
});

module.exports = router;