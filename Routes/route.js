const express = require('express');
const router = express.Router();

// 导入收藏相关路由
const collectRoutes = require('./collectRoutes');
// 导入推荐相关路由
const recommendRoutes = require('./recommendRoutes');

// 使用收藏路由
router.use('/collect', collectRoutes);
// 使用推荐路由
router.use('/recommend', recommendRoutes);

module.exports = router;