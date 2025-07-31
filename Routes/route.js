const express = require('express');
const router = express.Router();

// 导入收藏相关路由
const collectRoutes = require('./collectRoutes');
// 导入推荐相关路由
const recommendRoutes = require('./recommendRoutes');
// 导入股票相关路由
const stocksRoutes = require('./stocksRoutes');

// 使用收藏路由
router.use('/collect', collectRoutes);
// 使用推荐路由
router.use('/recommend', recommendRoutes);
// 使用股票路由
router.use('/stocks', stocksRoutes);

module.exports = router;