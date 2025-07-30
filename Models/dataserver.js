// 导入所需模块
const express = require('express');
const path = require('path');
const cors = require('cors');
const stockData = require('./stockdata');

// 创建Express路由实例
const router = express.Router();

// 中间件配置
router.use(cors());
router.use(express.json());
router.use(express.static(path.join(__dirname, 'public')));

// API路由1：获取指定股票历史数据
router.get('/stocks/:symbol/history/:days', async (req, res) => {
  try {
    const { symbol, days } = req.params;
    
    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
      return res.status(400).json({ 
        error: '股票代码不能为空',
        details: '请提供有效的股票代码（如AAPL、GOOG）'
      });
    }
    
    if (!days || isNaN(days) || parseInt(days) <= 0) {
      return res.status(400).json({
        error: '天数参数无效',
        details: '请提供有效的天数（正整数）'
      });
    }
    
    const data = await stockData.getPriceDataBySymbolAndDays(symbol, parseInt(days));
    
    res.json({
      symbol,
      days: parseInt(days),
      count: data.length,
      data
    });
  } catch (error) {
    console.error(`获取股票历史数据失败 [symbol=${req.params.symbol}, days=${req.params.days}]：`, error);
    const errorResponse = {
      error: '获取股票历史数据失败',
      details: process.env.NODE_ENV === 'development' 
        ? {
            message: error.message,
            stack: error.stack.substring(0, 500),
            symbol: req.params.symbol,
            days: req.params.days
          }
        : '请联系管理员'
    };
    res.status(500).json(errorResponse);
  }
});

// API路由2：获取用户持有的所有股票代码列表
router.get('/users/:user_id/stocks', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        error: '用户ID无效',
        details: '请提供有效的用户ID（正整数）'
      });
    }
    
    const symbols = await stockData.getStockSymbolsByUserId(parseInt(user_id));
    res.json(symbols);
  } catch (error) {
    console.error('获取股票代码列表失败:', error);
    res.status(500).json({ error: '获取股票代码列表失败' });
  }
});

// API路由3：获取指定股票现价
router.get('/stocks/:symbol/current', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
      return res.status(400).json({ 
        error: '股票代码不能为空',
        details: '请提供有效的股票代码（如AAPL、GOOG）'
      });
    }
    
    const data = await stockData.getPriceDataBySymbolAndDays(symbol, 1);
    
    if (data.length === 0) {
      return res.status(404).json({
        error: '未找到股票数据',
        details: `没有找到股票代码"${symbol}"的价格数据`
      });
    }
    
    res.json({
      symbol,
      price: data[0].close,
      timestamp: data[0].date
    });
    
  } catch (error) {
    console.error(`获取股票现价失败 [symbol=${req.params.symbol}]：`, error);
    const errorResponse = {
      error: '获取股票现价失败',
      details: process.env.NODE_ENV === 'development' 
        ? {
            message: error.message,
            stack: error.stack.substring(0, 500),
            symbol: req.params.symbol
          }
        : '请检查股票代码或联系管理员'
    };
    res.status(500).json(errorResponse);
  }
});

// API路由4.1：获取用户指定股票的持有数量
router.get('/users/:user_id/stocks/:symbol/quantity', async (req, res) => {
  try {
    const { user_id, symbol } = req.params;
    
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        error: '用户ID无效',
        details: '请提供有效的用户ID（正整数）'
      });
    }
    
    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
      return res.status(400).json({ 
        error: '股票代码不能为空',
        details: '请提供有效的股票代码（如AAPL、GOOG）'
      });
    }
    
    // 获取用户指定股票的所有交易数据
    const trades = await stockData.getUserStockTrades(parseInt(user_id), symbol);
    
    // 计算持有数量，根据action字段判断是买入还是卖出
    const quantity = trades.reduce((sum, trade) => {
      if (trade.action === 'buy') {
        return sum + trade.quantity;
      } else if (trade.action === 'sell') {
        return sum - trade.quantity;
      }
      return sum;
    }, 0);
    
    res.json({
      user_id: parseInt(user_id),
      symbol,
      quantity
    });
  } catch (error) {
    console.error(`获取用户股票持有数量失败 [user_id=${req.params.user_id}, symbol=${req.params.symbol}]：`, error);
    const errorResponse = {
      error: '获取用户股票持有数量失败',
      details: process.env.NODE_ENV === 'development' 
        ? {
            message: error.message,
            stack: error.stack.substring(0, 500),
            user_id: req.params.user_id,
            symbol: req.params.symbol
          }
        : '请联系管理员'
    };
    res.status(500).json(errorResponse);
  }
});

// API路由4.2：获取用户指定股票的总市值
router.get('/users/:user_id/stocks/:symbol/value', async (req, res) => {
  try {
    const { user_id, symbol } = req.params;
    
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        error: '用户ID无效',
        details: '请提供有效的用户ID（正整数）'
      });
    }
    
    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
      return res.status(400).json({ 
        error: '股票代码不能为空',
        details: '请提供有效的股票代码（如AAPL、GOOG）'
      });
    }
    
    // 获取用户指定股票的所有交易数据
    const trades = await stockData.getUserStockTrades(parseInt(user_id), symbol);
    
    // 计算总市值，根据action字段判断是买入还是卖出
    const value = trades.reduce((sum, trade) => {
      if (trade.action === 'buy') {
        return sum + trade.total_amount;
      } else if (trade.action === 'sell') {
        return sum - trade.total_amount;
      }
      return sum;
    }, 0);
    
    res.json({
      user_id: parseInt(user_id),
      symbol,
      value
    });
  } catch (error) {
    console.error(`获取用户股票总市值失败 [user_id=${req.params.user_id}, symbol=${req.params.symbol}]：`, error);
    const errorResponse = {
      error: '获取用户股票总市值失败',
      details: process.env.NODE_ENV === 'development' 
        ? {
            message: error.message,
            stack: error.stack.substring(0, 500),
            user_id: req.params.user_id,
            symbol: req.params.symbol
          }
        : '请联系管理员'
    };
    res.status(500).json(errorResponse);
  }
});

// API路由5：获取指定股票最近30日价格数据
router.get('/stocks/:symbol/history30', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
      return res.status(400).json({ 
        error: '股票代码不能为空',
        details: '请提供有效的股票代码（如AAPL、GOOG）'
      });
    }
    
    const data = await stockData.getPriceDataBySymbolAndDays(symbol, 30);
    
    res.json({
      symbol,
      days: 30,
      count: data.length,
      data
    });
  } catch (error) {
    console.error(`获取股票30日历史数据失败 [symbol=${req.params.symbol}]：`, error);
    const errorResponse = {
      error: '获取股票30日历史数据失败',
      details: process.env.NODE_ENV === 'development' 
        ? {
            message: error.message,
            stack: error.stack.substring(0, 500),
            symbol: req.params.symbol
          }
        : '请联系管理员'
    };
    res.status(500).json(errorResponse);
  }
});

// API路由6：计算用户指定股票的收益（收益 = 持有数量 * 现价 - 总市值）
router.get('/users/:user_id/stocks/:symbol/profit', async (req, res) => {
  try {
    const { user_id, symbol } = req.params;
    
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        error: '用户ID无效',
        details: '请提供有效的用户ID（正整数）'
      });
    }
    
    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
      return res.status(400).json({ 
        error: '股票代码不能为空',
        details: '请提供有效的股票代码（如AAPL、GOOG）'
      });
    }
    
    // 获取用户指定股票的持有数量
    const trades = await stockData.getUserStockTrades(parseInt(user_id), symbol);
    // 计算持有数量，根据action字段判断是买入还是卖出
    const quantity = trades.reduce((sum, trade) => {
      if (trade.action === 'buy') {
        return sum + trade.quantity;
      } else if (trade.action === 'sell') {
        return sum - trade.quantity;
      }
      return sum;
    }, 0);
    
    // 获取用户指定股票的总市值
    // 计算总市值，根据action字段判断是买入还是卖出
    const value = trades.reduce((sum, trade) => {
      if (trade.action === 'buy') {
        return sum + trade.total_amount;
      } else if (trade.action === 'sell') {
        return sum - trade.total_amount;
      }
      return sum;
    }, 0);
    
    // 获取股票现价
    const priceData = await stockData.getPriceDataBySymbolAndDays(symbol, 1);
    
    if (priceData.length === 0) {
      return res.status(404).json({
        error: '未找到股票数据',
        details: `没有找到股票代码"${symbol}"的价格数据`
      });
    }
    
    const currentPrice = priceData[0].close;
    
    // 计算收益
    const profit = quantity * currentPrice - value;
    
    res.json({
      user_id: parseInt(user_id),
      symbol,
      quantity,
      value,
      current_price: currentPrice,
      profit
    });
  } catch (error) {
    console.error(`计算用户股票收益失败 [user_id=${req.params.user_id}, symbol=${req.params.symbol}]：`, error);
    const errorResponse = {
      error: '计算用户股票收益失败',
      details: process.env.NODE_ENV === 'development' 
        ? {
            message: error.message,
            stack: error.stack.substring(0, 500),
            user_id: req.params.user_id,
            symbol: req.params.symbol
          }
        : '请联系管理员'
    };
    res.status(500).json(errorResponse);
  }
});

module.exports = router;