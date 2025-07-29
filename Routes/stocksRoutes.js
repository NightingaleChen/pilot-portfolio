const express = require('express');
const router = express.Router();
const { GetStocks, GetStockData, GetStockDetails } = require('../Controllers/stocks.js');

// 获取所有股票列表
router.get('/list', GetStocks);

// 获取特定股票的K线数据
router.get('/data', GetStockData);

// 获取股票详细信息
router.get('/details', GetStockDetails);

module.exports = router;