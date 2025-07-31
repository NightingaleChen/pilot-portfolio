const { cursor, conn } = require('../Models/db');

// 获取用户投资组合
async function GetPortfolio(req, res) {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id parameter is required' });
    }

    const sql = `
      SELECT 
        t.source_name,
        SUM(CASE WHEN t.action = 'buy' THEN t.quantity ELSE -t.quantity END) as total_quantity,
        AVG(t.price) as avg_price,
        s.close as current_price
      FROM trades t
      LEFT JOIN stocks s ON t.source_name = s.source_name
      WHERE t.user_id = ? AND s.date = (SELECT MAX(date) FROM stocks WHERE source_name = t.source_name)
      GROUP BY t.source_name, s.close
      HAVING total_quantity > 0
    `;
    
    const result = await cursor.execute(sql, [user_id]);
    res.json(result);
  } catch (error) {
    console.error('获取投资组合失败:', error);
    res.status(500).json({ error: '获取投资组合失败' });
  }
}

// 添加交易记录
async function AddTrade(req, res) {
  console.log('AddTrade 函数被调用');
  console.log('请求体:', req.body);
  
  try {
    const { user_id, source_name, action, quantity } = req.body;
    
    // 验证必需参数
    if (!user_id || !source_name || !action || !quantity) {
      return res.status(400).json({ error: '缺少必需参数' });
    }
    
    // 验证action类型
    if (!['buy', 'sell'].includes(action)) {
      return res.status(400).json({ error: 'action必须是buy或sell' });
    }
    
    // 获取当前股票价格
    const priceQuery = `
      SELECT close FROM stocks 
      WHERE source_name = ? 
      ORDER BY date DESC 
      LIMIT 1
    `;
    
    const priceResult = await cursor.execute(priceQuery, [source_name]);
    
    if (!priceResult || priceResult.length === 0) {
      return res.status(404).json({ error: '未找到股票价格信息' });
    }
    
    const price = priceResult[0].close;
    const total_amount = price * quantity;
    const trade_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // 获取用户当前余额
    const balanceQuery = 'SELECT cash FROM users WHERE id = ?';
    const balanceResult = await cursor.execute(balanceQuery, [user_id]);
    
    if (!balanceResult || balanceResult.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const currentBalance = balanceResult[0].cash;
    let newBalance;
    
    // 计算新余额
    if (action === 'buy') {
      // 买入：检查余额是否足够
      if (currentBalance < total_amount) {
        return res.status(400).json({ 
          error: `余额不足。当前余额: $${currentBalance.toFixed(2)}, 需要: $${total_amount.toFixed(2)}` 
        });
      }
      newBalance = currentBalance - total_amount;
    } else { // sell
      // 卖出：增加余额
      newBalance = currentBalance + total_amount;
    }
    
    // 插入交易记录
    const insertTradeQuery = `
      INSERT INTO trades (user_id, source_name, action, price, quantity, total_amount, trade_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await cursor.execute(insertTradeQuery, [user_id, source_name, action, price, quantity, total_amount, trade_date]);
    
    // 更新用户余额
    const updateBalanceQuery = 'UPDATE users SET cash = ? WHERE id = ?';
    await cursor.execute(updateBalanceQuery, [newBalance, user_id]);
    
    // 提交更改
    await conn.commit();
    
    res.json({ 
      message: '交易成功',
      trade: {
        user_id,
        source_name,
        action,
        price,
        quantity,
        total_amount,
        trade_date
      },
      balance: {
        previous: currentBalance,
        current: newBalance,
        change: action === 'buy' ? -total_amount : total_amount
      }
    });
    
  } catch (error) {
    console.error('添加交易失败:', error);
    res.status(500).json({ error: '交易失败: ' + error.message });
  }
}

module.exports = {
  GetPortfolio,
  AddTrade
};