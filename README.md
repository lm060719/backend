# 🌙 Dream Diary / 梦境日记

一个基于 **Node.js + Express + SQLite + 原生前端** 实现的简易梦境记录系统。

用户可以注册登录后记录自己的梦境内容，并使用前端输入的本地密钥对梦境内容进行加密存储。服务端只保存加密后的文本，不直接保存明文内容，从而提升隐私性。

---

## 功能简介

- 用户注册与登录
- JWT 身份认证
- 梦境记录新增、查看、编辑、删除
- 支持记录梦境时间
- 支持记录梦境心情标签
- 使用前端本地密钥对梦境内容进行 AES-GCM 加密
- SQLite 轻量化存储
- 前后端集成部署

---

## 项目结构

```bash
backend-main/
├── backend/
│   ├── db.js                # SQLite 数据库初始化
│   ├── package.json         # 后端依赖配置
│   ├── server.js            # Express 服务入口
│   └── routes/
│       ├── auth.js          # 注册 / 登录接口
│       └── dreams.js        # 梦境增删改查接口
│
└── frontend/
    ├── index.html           # 梦境主页
    ├── login.html           # 登录页
    ├── register.html        # 注册页
    ├── css/
    │   ├── index.css        # 主页面样式
    │   └── style.css        # 登录注册页样式
```
## 技术栈
## 后端
```
Node.js
Express
SQLite3
bcrypt
jsonwebtoken
cors
body-parser
```
## 前端
```
HTML
CSS
JavaScript
Alpine.js
Web Crypto API
```
## 核心设计
## 1. 用户系统

项目支持：

用户注册
用户登录
```
JWT Token 鉴权
```
登录成功后，后端返回 JWT，前端将其保存到 localStorage 中，后续请求通过：
```
Authorization: Bearer <token>
```
进行身份校验。

## 2. 梦境数据加密

项目的一个主要特点是：

梦境内容在前端加密后再上传到服务端。

加密流程如下：

用户在前端设置或生成加密密钥
使用 Web Crypto API 的 AES-GCM 算法对文本进行加密
后端只接收并存储 encrypted_content
前端读取数据后再使用密钥进行解密显示

这意味着：

服务端数据库中保存的是密文
用户密钥丢失后，数据无法恢复
服务端无法直接看到明文内容
## 3. 梦境记录管理

每条梦境记录包含：
```
梦境时间 dream_time
加密后的梦境内容 encrypted_content
心情 mood
创建时间 created_at
```
支持以下操作：

新增梦境
获取当前用户全部梦境
编辑已有梦境
删除梦境
数据库设计

项目使用 SQLite，本地数据库文件为：
```
backend/dreams.db
```
数据库启动时会自动创建以下两张表。
```
users 表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
dreams 表
CREATE TABLE IF NOT EXISTS dreams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  dream_time TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  mood TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```
接口说明

后端默认运行端口：
```
3000
```
基础地址：
```
http://localhost:3000
```
认证接口
注册
```
POST /api/auth/register
Content-Type: application/json
```
请求体：
```
{
  "username": "test",
  "password": "123456"
}
```
返回示例：
```
{
  "message": "注册成功"
}
```
登录
```
POST /api/auth/login
Content-Type: application/json
```
请求体：
```
{
  "username": "test",
  "password": "123456"
}
```
返回示例：
```
{
  "token": "xxxxx.yyyyy.zzzzz"
}
```
梦境接口

以下接口都需要携带 Token：

Authorization: Bearer <token>
获取梦境列表
GET /api/dreams

返回示例：
```
[
  {
    "id": 1,
    "dream_time": "2026-03-21T12:00",
    "encrypted_content": "Base64EncryptedText",
    "mood": "开心",
    "created_at": "2026-03-21 12:30:00"
  }
]
新增梦境
POST /api/dreams
Content-Type: application/json
Authorization: Bearer <token>

请求体：

{
  "dream_time": "2026-03-21T12:00",
  "encrypted_content": "Base64EncryptedText",
  "mood": "平静"
}

返回示例：

{
  "id": 1
}
更新梦境
PUT /api/dreams/:id
Content-Type: application/json
Authorization: Bearer <token>

请求体：

{
  "dream_time": "2026-03-21T12:00",
  "encrypted_content": "UpdatedEncryptedText",
  "mood": "开心"
}

返回示例：

{
  "message": "更新成功"
}
删除梦境
DELETE /api/dreams/:id
Authorization: Bearer <token>

返回示例：

{
  "message": "删除成功"
}
```
## 安装与运行
## 1. 安装依赖

进入后端目录：
```
cd backend
npm install
```
## 2. 启动项目
```
npm start
```
启动后默认地址：
```
http://localhost:3000
```
因为后端通过：
```
express.static(...) 提供前端静态页面
/api/auth 提供认证接口
/api/dreams 提供梦境接口
```
所以只需要启动后端即可访问完整项目。

页面说明
```
frontend/register.html
```
用户注册页面。
```
frontend/login.html
```
用户登录页面，登录成功后将 JWT 保存到浏览器本地。
```
frontend/index.html
```
主页面，负责：

校验登录状态
输入或生成加密密钥
创建梦境
加载梦境列表
解密梦境内容
编辑与删除梦境
加密说明

## 前端使用 frontend/js/crypto.js 完成加密解密逻辑。

## 使用算法
```
AES-GCM 256 位密钥
```
## 主要方法
```
generateKey()：生成随机密钥
encryptText()：加密梦境文本
decryptText()：解密梦境文本
```
## 密钥存储

密钥通过浏览器 localStorage 保存：

localStorage.getItem('dreamKey')
## 注意
密钥丢失后，无法解密已有内容
更换密钥后，旧内容可能无法读取
当前设计更偏向“轻量隐私保护”，不是完整的零知识安全架构
```
    └── js/
        ├── crypto.js        # 前端加解密逻辑
        └── script.js        # 其他前端脚本
```
