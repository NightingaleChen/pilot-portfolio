// 导入数据库连接模块
const db = require('../Models/db');

// 获取数据库游标（Promise 版本的连接）
const cursor = db.getCursor();

// 辅助函数：根据股票名称获取股票ID
async function getStockId(source_name) {
    const sql = 'SELECT id FROM stocks WHERE source_name = ? LIMIT 1';
    const [rows] = await cursor.execute(sql, [source_name]);
    if (rows.length === 0) {
        throw new Error(`Stock not found: ${source_name}`);
    }
    return rows[0].id;
}

// 辅助函数：获取股票最新价格
async function getLatestStockPrice(source_name) {
    const sql = 'SELECT close FROM stocks WHERE source_name = ? ORDER BY date DESC LIMIT 1';
    const [rows] = await cursor.execute(sql, [source_name]);
    if (rows.length === 0) {
        throw new Error(`Stock price not found: ${source_name}`);
    }
    return parseFloat(rows[0].close);
}

// 辅助函数：获取用户持股数量
async function getUserStockHoldings(user_id, source_name) {
    const sql = `
        SELECT 
            COALESCE(SUM(CASE WHEN action = 'buy' THEN quantity ELSE -quantity END), 0) as holdings
        FROM trades 
        WHERE user_id = ? AND source_name = ?
    `;
    const [rows] = await cursor.execute(sql, [user_id, source_name]);
    return parseInt(rows[0].holdings) || 0;
}

// 辅助函数：获取用户投资组合
async function getUserPortfolio(user_id) {
    const sql = `
        SELECT 
            source_name,
            SUM(CASE WHEN action = 'buy' THEN quantity ELSE -quantity END) as total_shares,
            AVG(CASE WHEN action = 'buy' THEN price ELSE NULL END) as avg_buy_price
        FROM trades 
        WHERE user_id = ? 
        GROUP BY source_name
        HAVING total_shares > 0
    `;
    const [rows] = await cursor.execute(sql, [user_id]);
    return rows;
}

// 添加交易记录
async function AddTrade(req, res) {
    try {
        const { user_id, source_name, action, quantity } = req.body;
        
        // 验证必要参数
        if (!user_id || !source_name || !action || !quantity) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // 验证action参数
        if (action !== 'buy' && action !== 'sell') {
            return res.status(400).json({ error: 'Action must be either "buy" or "sell"' });
        }
        
        // 验证quantity参数
        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive number' });
        }
        
        // 如果是卖出操作，验证用户是否有足够的股票
        if (action === 'sell') {
            const holdings = await getUserStockHoldings(user_id, source_name);
            if (holdings < quantityNum) {
                return res.status(400).json({ error: 'Not enough shares to sell' });
            }
        }
        
        // 获取股票ID和最新价格
        const stock_id = await getStockId(source_name);
        const price = await getLatestStockPrice(source_name);
        const total_amount = price * quantityNum;
        
        // 获取当前时间戳
        const created_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // 开始事务
        await cursor.beginTransaction();
        
        // 插入交易记录
        const insertTradeSql = 'INSERT INTO trades (user_id, stock_id, source_name, action, price, quantity, total_amount, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await cursor.execute(insertTradeSql, [user_id, stock_id, source_name, action, price, quantityNum, total_amount, created_date]);
        
        // 提交事务
        await cursor.commit();
        
        res.json({
            message: 'Trade added successfully',
            trade: {
                user_id,
                stock_id,
                source_name,
                action,
                price,
                quantity: quantityNum,
                total_amount,
                created_date
            }
        });
    } catch (err) {
        // 回滚事务
        try {
            await cursor.rollback();
        } catch (rollbackErr) {
            console.error('回滚事务失败:', rollbackErr);
        }
        
        console.error('Error adding trade:', err);
        console.error('Request body:', req.body);
        res.status(500).json({ error: 'Error adding trade: ' + err.message });
    }
}

// 获取用户交易历史
async function GetUserTrades(req, res) {
    try {
        const { user_id, source_name } = req.query;
        
        // 验证user_id参数
        if (!user_id) {
            return res.status(400).json({ error: 'user_id parameter is required' });
        }
        
        let sql;
        let params;
        
        // 如果提供了source_name，只获取特定股票的交易
        if (source_name) {
            sql = 'SELECT * FROM trades WHERE user_id = ? AND source_name = ? ORDER BY created_date DESC';
            params = [user_id, source_name];
        } else {
            sql = 'SELECT * FROM trades WHERE user_id = ? ORDER BY created_date DESC';
            params = [user_id];
        }
        
        const [trades] = await cursor.execute(sql, params);
        
        res.json({ trades });
    } catch (err) {
        console.error('Error getting user trades:', err);
        res.status(500).send('Error getting user trades: ' + err.message);
    }
}

// 获取用户投资组合
async function GetUserPortfolio(req, res) {
    try {
        const { user_id } = req.query;
        
        // 验证user_id参数
        if (!user_id) {
            return res.status(400).json({ error: 'user_id parameter is required' });
        }
        
        const portfolio = await getUserPortfolio(user_id);
        
        res.json({ portfolio });
    } catch (err) {
        console.error('Error getting user portfolio:', err);
        res.status(500).send('Error getting user portfolio: ' + err.message);
    }
}

// 获取用户特定股票的持有量
async function GetUserStockHoldings(req, res) {
    try {
        const { user_id, source_name } = req.query;
        
        // 验证必要参数
        if (!user_id || !source_name) {
            return res.status(400).json({ error: 'user_id and source_name parameters are required' });
        }
        
        const holdings = await getUserStockHoldings(user_id, source_name);
        
        res.json({ 
            user_id, 
            source_name, 
            holdings 
        });
    } catch (err) {
        console.error('Error getting user stock holdings:', err);
        res.status(500).send('Error getting user stock holdings: ' + err.message);
    }
}

// 数据库连接测试函数
async function TestDatabaseConnection(req, res) {
    try {
        const [rows] = await cursor.execute('SELECT 1 as test');
        res.json({ 
            status: 'success', 
            message: 'Database connection is working',
            test_result: rows[0].test 
        });
    } catch (err) {
        console.error('Database connection test failed:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Database connection failed',
            error: err.message 
        });
    }
}

module.exports = {
    AddTrade,
    GetUserTrades,
    GetUserPortfolio,
    GetUserStockHoldings,
    TestDatabaseConnection
};