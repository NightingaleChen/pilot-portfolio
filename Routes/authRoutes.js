const express = require('express');
const router = express.Router();
const { Login, GetUserInfo } = require('../Controllers/auth');

// 登录路由
router.post('/login', Login);

// 获取用户信息
router.get('/user', GetUserInfo);

module.exports = router;