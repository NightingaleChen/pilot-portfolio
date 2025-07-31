const express = require('express');
const router = express.Router();
const { AddTrade, GetUserTrades, GetUserPortfolio, GetUserStockHoldings, TestDatabaseConnection } = require('../Controllers/trades.js');

// 添加交易记录
router.post('/add', AddTrade);

// 获取用户交易历史
router.get('/history', GetUserTrades);

// 获取用户投资组合
router.get('/portfolio', GetUserPortfolio);

// 获取用户特定股票的持有量
router.get('/holdings', GetUserStockHoldings);

// 数据库连接测试
router.get('/test-db', TestDatabaseConnection);

module.exports = router;