// 导入数据库连接模块
const db = require('../Models/db');

// 获取数据库游标
const cursor = db.getCursor();

// 从stock表中获取每个source最新日期的记录，并计算(close-open)/close的前5个
function getTopStocks(req, res) {
  // 构建SQL查询语句获取每个source的最新日期记录
  const getLatestDatesSql = `
    SELECT source, MAX(date) as maxDate 
    FROM stocks 
    GROUP BY source
  `;

  // 执行查询获取最新日期
  cursor.execute(getLatestDatesSql)
    .then(([latestDates]) => {
      // 构建获取最新股票数据的查询条件
      const conditions = latestDates.map(record => {
        // 确保日期格式正确 - 将日期转换为MySQL DATETIME格式 (YYYY-MM-DD HH:MM:SS)
        let formattedDate;
        
        // 检查record.maxDate是否已经是字符串格式
        if (typeof record.maxDate === 'string') {
          // 如果已经是字符串，但可能不是正确的MySQL格式，尝试转换
          try {
            const date = new Date(record.maxDate);
            // 使用本地时区格式化日期，而不是UTC
            formattedDate = date.getFullYear() + '-' +
              String(date.getMonth() + 1).padStart(2, '0') + '-' +
              String(date.getDate()).padStart(2, '0') + ' ' +
              String(date.getHours()).padStart(2, '0') + ':' +
              String(date.getMinutes()).padStart(2, '0') + ':' +
              String(date.getSeconds()).padStart(2, '0');
          } catch (e) {
            // 如果转换失败，直接使用原始字符串
            formattedDate = record.maxDate;
          }
        } 
        // 如果是Date对象
        else if (record.maxDate instanceof Date) {
          // 使用本地时区格式化日期，而不是UTC
          formattedDate = record.maxDate.getFullYear() + '-' +
            String(record.maxDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(record.maxDate.getDate()).padStart(2, '0') + ' ' +
            String(record.maxDate.getHours()).padStart(2, '0') + ':' +
            String(record.maxDate.getMinutes()).padStart(2, '0') + ':' +
            String(record.maxDate.getSeconds()).padStart(2, '0');
        }
        // 其他情况，尝试转换为Date再格式化
        else {
          try {
            const date = new Date(record.maxDate);
            // 使用本地时区格式化日期，而不是UTC
            formattedDate = date.getFullYear() + '-' +
              String(date.getMonth() + 1).padStart(2, '0') + '-' +
              String(date.getDate()).padStart(2, '0') + ' ' +
              String(date.getHours()).padStart(2, '0') + ':' +
              String(date.getMinutes()).padStart(2, '0') + ':' +
              String(date.getSeconds()).padStart(2, '0');
          } catch (e) {
            // 如果转换失败，使用安全的默认值或抛出错误
            console.error('无法格式化日期:', record.maxDate);
            throw new Error('日期格式无效: ' + record.maxDate);
          }
        }
        
        return `(source = '${record.source}' AND date = '${formattedDate}')`;
      }).join(' OR ');

      // 查询最新的股票数据
      const getStocksSql = `
        SELECT *, (close - open) / close as price_change 
        FROM stocks 
        WHERE ${conditions}
        ORDER BY price_change DESC 
        LIMIT 5
      `;
      
      // 打印SQL查询语句以便调试
    //   console.log('SQL查询:', getStocksSql);
      
      return cursor.execute(getStocksSql);
    })
    .then(([stocks]) => {
      // 在这里打印查询结果
    //   console.log('查询结果:', stocks);
      res.json(stocks);
    })
    .catch(err => {
      console.error('获取推荐股票失败:', err);
      res.status(500).send('Error getting top stocks: ' + err.message);
    });
}

module.exports = {
  getTopStocks
};