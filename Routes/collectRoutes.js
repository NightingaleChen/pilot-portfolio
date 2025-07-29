const express = require('express');
const router = express.Router();
const { AddCollect, GetCollect, DeleteCollect } = require('../Controllers/collect.js');

// 添加收藏
router.post('/add', AddCollect);

// 获取用户的收藏
router.get('/get', GetCollect);

// 删除收藏
router.delete('/delete', DeleteCollect);

module.exports = router;