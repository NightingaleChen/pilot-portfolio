// 导入数据库连接模块
const db = require('../Models/db');

// 获取数据库游标
const cursor = db.getCursor();

// 获取所有股票列表
function GetStocks(req, res) {
  const sql = 'SELECT DISTINCT source FROM stocks WHERE source IS NOT NULL';
  cursor.execute(sql)
    .then(([rows]) => {
      const stocks = rows.map(row => ({
        name: row.source,
        displayName: row.source.charAt(0).toUpperCase() + row.source.slice(1) // 首字母大写
      }));
      res.json({ stocks });
    })
    .catch(err => {
      console.error('获取股票列表失败:', err);
      res.status(500).send('Error getting stocks: ' + err.message);
    });
}

// 获取特定股票的K线数据（近一个月）
function GetStockData(req, res) {
  const { stock_name, timeframe } = req.query;
  if (!stock_name) {
    return res.status(400).json({ error: 'stock_name parameter is required' });
  }
  
  // 根据timeframe参数确定查询的时间范围
  let dateLimit;
  switch(timeframe) {
    case '1w': // 一周
      dateLimit = 'DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      break;
    case '3m': // 三个月
      dateLimit = 'DATE_SUB(NOW(), INTERVAL 3 MONTH)';
      break;
    case '6m': // 六个月
      dateLimit = 'DATE_SUB(NOW(), INTERVAL 6 MONTH)';
      break;
    case '1y': // 一年
      dateLimit = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      break;
    case '1m': // 一个月（默认）
    default:
      dateLimit = 'DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      break;
  }
  
  // 构建SQL查询，获取指定股票近一个月的数据，按日期排序
  const sql = `
    SELECT date, open, high, low, close, volume 
    FROM stocks 
    WHERE source = ? AND date >= ${dateLimit} 
    ORDER BY date ASC
  `;
  
  // 打印SQL查询语句
  // console.log('执行SQL查询:', sql.replace('?', `'${stock_name}'`));
  // console.log('查询参数:', { stock_name, timeframe });
  
  cursor.execute(sql, [stock_name])
    .then(([rows]) => {
      // 打印查询结果
      // console.log(`查询结果: 获取到${rows.length}条记录`);
      // console.log('查询结果示例:', rows.length > 0 ? rows[0] : '无数据');
      
      // 格式化日期并返回数据
      const formattedData = rows.map(row => ({
        date: row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume
      }));
      // console.log(formattedData);
      res.json(formattedData);
    })
    .catch(err => {
      console.error('获取股票K线数据失败:', err);
      res.status(500).send('Error getting stock data: ' + err.message);
    });
}

// 获取股票详细信息
function GetStockDetails(req, res) {
  const { stock_name } = req.query;
  
  if (!stock_name) {
    return res.status(400).json({ error: 'stock_name parameter is required' });
  }
  
  // 获取最新的股票数据
  const sql = `
    SELECT * FROM stocks 
    WHERE source = ? 
    ORDER BY date DESC 
    LIMIT 1
  `;
  
  cursor.execute(sql, [stock_name])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Stock not found' });
      }
      
      const stock = rows[0];
      
      // 计算涨跌幅
      const change = ((stock.close - stock.open) / stock.open * 100).toFixed(2);
      const changeSign = change >= 0 ? '+' : '';
      
      // 构建详细信息对象
      const details = {
        name: stock_name.toUpperCase(),
        price: stock.close.toFixed(2),
        change: `${changeSign}${change}%`,
        openPrice: stock.open.toFixed(2),
        highPrice: stock.high.toFixed(2),
        lowPrice: stock.low.toFixed(2),
        volume: stock.volume.toLocaleString(),
        marketCap: '计算中...',  // 实际项目中可能需要从其他表获取
        high52w: (stock.high * 1.1).toFixed(2),  // 模拟数据
        low52w: (stock.low * 0.9).toFixed(2)     // 模拟数据
      };
      
      res.json(details);
    })
    .catch(err => {
      console.error('获取股票详情失败:', err);
      res.status(500).send('Error getting stock details: ' + err.message);
    });
}

module.exports = {
  GetStocks,
  GetStockData,
  GetStockDetails
};