const express = require('express');
const router = express.Router();
const { getTopStocks } = require('../Controllers/recommend.js');

// 获取推荐股票（按涨幅排序的前5个）
router.get('/top', getTopStocks);

module.exports = router;