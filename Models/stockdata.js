// 导入数据库连接模块
const db = require('../Models/db');

class StockData {
  constructor() {
    // 获取数据库游标
    this.cursor = db.getCursor();
  }

  // 功能1：根据 user_id 从 trades 表获取该用户所有持有的股票代号 source_name
  async getStockSymbolsByUserId(user_id) {
    const [rows] = await this.cursor.execute(
      'SELECT DISTINCT source_name FROM trades WHERE user_id = ? ORDER BY source_name',
      [user_id]
    );
    return rows.map(row => row.source_name);
  }

  // 功能2：根据 source_name, days 从 stocks 表获取指定代号 source_name 股票的最近几天 days 的所有数据
  async getPriceDataBySymbolAndDays(source_name, days) {
    // 使用字符串拼接方式处理 LIMIT 参数，避免 MySQL 错误
    const sql = `SELECT * FROM stocks WHERE source_name = ? ORDER BY date DESC LIMIT ${parseInt(days, 10)}`;
    const [rows] = await this.cursor.execute(sql, [source_name]);
    return rows.reverse(); // 返回按时间正序排列的数据
  }

  // 新增功能：根据 user_id 和 source_name 获取用户指定股票的所有交易数据
  async getUserStockTrades(user_id, source_name) {
    const [rows] = await this.cursor.execute(
      'SELECT * FROM trades WHERE user_id = ? AND source_name = ? ORDER BY created_date',
      [user_id, source_name]
    );
    return rows;
  }
}

// 导出类实例
module.exports = new StockData();