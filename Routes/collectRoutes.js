const express = require('express');
const router = express.Router();
const { AddCollect, GetCollect, GetCollectWithPrices, DeleteCollect, GetAllStocks, GetAllStocksWithPrices } = require('../Controllers/collect.js');

// 添加收藏
router.post('/add', AddCollect);

// 获取用户的收藏
router.get('/get', GetCollect);

// 获取用户的收藏（包含价格信息）
router.get('/get-with-prices', GetCollectWithPrices);

// 删除收藏
router.delete('/delete', DeleteCollect);

// 获取所有可用的股票列表
router.get('/stocks', GetAllStocks);

// 获取所有可用的股票列表（包含价格信息）
router.get('/stocks-with-prices', GetAllStocksWithPrices);

module.exports = router;