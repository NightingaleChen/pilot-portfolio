const express = require('express');
const router = express.Router();
const { Login, GetUserInfo, RefreshUserBalance } = require('../Controllers/auth');

// 登录路由
router.post('/login', Login);

// 获取用户信息
router.get('/user', GetUserInfo);
router.get('/user/:userId', GetUserInfo);

// 刷新用户余额
router.get('/user/:userId/balance', RefreshUserBalance);

module.exports = router;