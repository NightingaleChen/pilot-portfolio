// 导入数据库连接模块
const db = require('../Models/db');

// 获取数据库游标
const cursor = db.getCursor();
// 获取原始连接用于提交事务
const conn = db.getConnection();

// 获取所有可用的股票列表
async function GetAllStocks(req, res) {
    try {
        const { user_id } = req.query;
        
        // 验证user_id参数
        if (!user_id) {
            return res.status(400).json({ error: 'user_id parameter is required' });
        }
        
        // 获取所有不重复的股票源
        const getAllStocksSql = 'SELECT DISTINCT source_name FROM stocks WHERE source_name IS NOT NULL';
        const [allStocks] = await cursor.execute(getAllStocksSql);
        
        // 获取该用户已收藏的股票
        const getUserCollectionsSql = 'SELECT DISTINCT stock_name FROM collections WHERE user_id = ?';
        const [userCollections] = await cursor.execute(getUserCollectionsSql, [user_id]);
        
        // 提取用户已收藏的股票名称
        const collectedStockNames = userCollections.map(row => row.stock_name);
        
        // 过滤掉用户已收藏的股票
        const availableStocks = allStocks
            .map(row => row.source_name)
            .filter(source => !collectedStockNames.includes(source))
            .map(source => ({
                name: source,
                displayName: source.charAt(0).toUpperCase() + source.slice(1) // 首字母大写
            }));
        
        res.json({ stocks: availableStocks });
    } catch (err) {
        console.error('Error getting all stocks:', err);
        res.status(500).send('Error getting stocks: ' + err.message);
    }
}

// 其他函数保持不变，只是使用新的 cursor 和 conn
function AddCollect(req, res) {
    const { user_id, stock_name } = req.body;
    // 获取当前时间戳
    const created_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = 'INSERT INTO collections (user_id, stock_name, created_date) VALUES (?, ?, ?)';
    cursor.execute(sql, [user_id, stock_name, created_time])
        .then(() => {
            conn.commit();
            res.send('Collect added successfully');
        })
        .catch(err => {
            res.status(500).send('Error adding collect: ' + err.message);
        });
}

function GetCollect(req, res) {
    const { user_id } = req.query;
    const sql = 'SELECT distinct(stock_name) FROM collections WHERE user_id = ?';
    cursor.execute(sql, [user_id])
        .then(([rows]) => {
            const stock_names = rows.map(row => row.stock_name);
            // 创建包含 stock_id 数组的对象
            const result = { "stock_names": stock_names };
            // 发送 JSON 响应
            res.json(result);
        })
        .catch(err => {
            res.status(500).send('Error getting collects: ' + err.message);
        });
}

function DeleteCollect(req, res) {
    const { user_id, stock_name } = req.body;
    const sql = 'DELETE FROM collections WHERE user_id = ? AND stock_name = ?';
    cursor.execute(sql, [user_id, stock_name])
        .then(() => {
            conn.commit();
            res.send('Collect deleted successfully');
        })
        .catch(err => {
            res.status(500).send('Error deleting collect: ' + err.message);
        });
}

module.exports = {
    AddCollect,
    GetCollect,
    DeleteCollect,
    GetAllStocks
};
