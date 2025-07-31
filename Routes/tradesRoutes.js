const express = require('express');
const router = express.Router();
const { GetPortfolio, AddTrade } = require('../Controllers/trades.js');

// 获取用户投资组合
router.get('/portfolio', GetPortfolio);

// 添加交易记录
router.post('/add', AddTrade);

module.exports = router;