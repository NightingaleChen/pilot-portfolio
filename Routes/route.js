const express = require('express');
const router = express.Router();

// 导入收藏相关路由
const collectRoutes = require('./collectRoutes');

// 使用收藏路由
router.use('/collect', collectRoutes);

module.exports = router;