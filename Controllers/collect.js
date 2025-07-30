// 导入数据库连接模块
const db = require('../Models/db');

// 获取数据库游标
const cursor = db.getCursor();
// 获取原始连接用于提交事务
const conn = db.getConnection();

// 辅助函数：格式化日期
function formatDate(dateValue) {
    let formattedDate;
    
    if (typeof dateValue === 'string') {
        try {
            const date = new Date(dateValue);
            formattedDate = date.getFullYear() + '-' +
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0') + ' ' +
                String(date.getHours()).padStart(2, '0') + ':' +
                String(date.getMinutes()).padStart(2, '0') + ':' +
                String(date.getSeconds()).padStart(2, '0');
        } catch (e) {
            formattedDate = dateValue;
        }
    } else if (dateValue instanceof Date) {
        formattedDate = dateValue.getFullYear() + '-' +
            String(dateValue.getMonth() + 1).padStart(2, '0') + '-' +
            String(dateValue.getDate()).padStart(2, '0') + ' ' +
            String(dateValue.getHours()).padStart(2, '0') + ':' +
            String(dateValue.getMinutes()).padStart(2, '0') + ':' +
            String(dateValue.getSeconds()).padStart(2, '0');
    } else {
        try {
            const date = new Date(dateValue);
            formattedDate = date.getFullYear() + '-' +
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0') + ' ' +
                String(date.getHours()).padStart(2, '0') + ':' +
                String(date.getMinutes()).padStart(2, '0') + ':' +
                String(date.getSeconds()).padStart(2, '0');
        } catch (e) {
            console.error('无法格式化日期:', dateValue);
            throw new Error('日期格式无效: ' + dateValue);
        }
    }
    
    return formattedDate;
}

// 辅助函数：获取用户已收藏的股票名称
async function getUserCollectedStocks(user_id) {
    const getUserCollectionsSql = 'SELECT DISTINCT stock_name FROM collections WHERE user_id = ?';
    const [userCollections] = await cursor.execute(getUserCollectionsSql, [user_id]);
    return userCollections.map(row => row.stock_name);
}

// 辅助函数：获取股票的最新价格数据
async function getStocksWithLatestPrices(stockNames = null, excludeCollected = false, user_id = null) {
    // 获取最新日期的查询
    let getLatestDatesSql;
    let queryParams = [];
    
    if (stockNames && stockNames.length > 0) {
        const placeholders = stockNames.map(() => '?').join(',');
        getLatestDatesSql = `
            SELECT source_name, MAX(date) as maxDate 
            FROM stocks 
            WHERE source_name IN (${placeholders})
            GROUP BY source_name
        `;
        queryParams = stockNames;
    } else {
        getLatestDatesSql = `
            SELECT source_name, MAX(date) as maxDate 
            FROM stocks 
            WHERE source_name IS NOT NULL
            GROUP BY source_name
        `;
    }
    
    const [latestDates] = await cursor.execute(getLatestDatesSql, queryParams);
    
    if (!latestDates || latestDates.length === 0) {
        return [];
    }
    
    // 构建获取最新股票数据的查询条件
    const conditions = latestDates.map(record => {
        const formattedDate = formatDate(record.maxDate);
        return `(source_name = '${record.source_name}' AND date = '${formattedDate}')`;
    }).join(' OR ');
    
    // 查询最新的股票数据，包含价格变化计算
    const getStocksWithPricesSql = `
        SELECT source_name, close, (close - open) / close as price_change, date
        FROM stocks 
        WHERE ${conditions}
        ORDER BY source_name
    `;
    
    const [stocksData] = await cursor.execute(getStocksWithPricesSql);
    
    // 如果需要排除已收藏的股票
    if (excludeCollected && user_id) {
        const collectedStockNames = await getUserCollectedStocks(user_id);
        return stocksData.filter(stock => !collectedStockNames.includes(stock.source_name));
    }
    
    return stocksData;
}

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
        
        // 获取用户已收藏的股票名称
        const collectedStockNames = await getUserCollectedStocks(user_id);
        
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

// 获取收藏列表，包含最新价格和变化率信息
async function GetCollectWithPrices(req, res) {
    try {
        const { user_id } = req.query;
        
        // 验证user_id参数
        if (!user_id) {
            return res.status(400).json({ error: 'user_id parameter is required' });
        }
        
        // 首先获取用户的收藏列表
        const getCollectionsSql = 'SELECT DISTINCT stock_name FROM collections WHERE user_id = ?';
        const [collections] = await cursor.execute(getCollectionsSql, [user_id]);
        
        if (collections.length === 0) {
            return res.json({ collections: [] });
        }
        
        // 获取收藏股票的名称列表
        const stockNames = collections.map(row => row.stock_name);
        
        // 使用辅助函数获取股票价格数据
        const stocksData = await getStocksWithLatestPrices(stockNames);
        
        // 格式化结果
        const collectionsWithPrices = stocksData.map(stock => ({
            stock_name: stock.source_name,
            close_price: stock.close,
            price_change: stock.price_change,
            last_updated: stock.date
        }));
        
        res.json({ collections: collectionsWithPrices });
    } catch (err) {
        console.error('Error getting collections with prices:', err);
        res.status(500).send('Error getting collections with prices: ' + err.message);
    }
}

// 获取可用股票列表，包含最新价格和变化率信息
async function GetAllStocksWithPrices(req, res) {
    try {
        const { user_id } = req.query;
        
        // 验证user_id参数
        if (!user_id) {
            return res.status(400).json({ error: 'user_id parameter is required' });
        }
        
        // 使用辅助函数获取所有股票的价格数据，并排除已收藏的股票
        const stocksData = await getStocksWithLatestPrices(null, true, user_id);
        
        // 格式化结果
        const availableStocks = stocksData.map(stock => ({
            name: stock.source_name,
            displayName: stock.source_name,
            close_price: stock.close,
            price_change: stock.price_change,
            last_updated: stock.date
        }));
        
        res.json({ stocks: availableStocks });
    } catch (err) {
        console.error('Error getting stocks with prices:', err);
        res.status(500).send('Error getting stocks with prices: ' + err.message);
    }
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
    GetCollectWithPrices,
    DeleteCollect,
    GetAllStocks,
    GetAllStocksWithPrices
};
