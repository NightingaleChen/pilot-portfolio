const express = require('express');
const router = express.Router();
const { insertTrade } = require('../Controllers/trades.js');

// 添加新交易记录
router.post('/add', async (req, res) => {
    try {
        const result = await insertTrade(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;