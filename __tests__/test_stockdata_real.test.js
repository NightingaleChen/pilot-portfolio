const stockData = require('../Models/stockdata');
const db = require('../Models/db');

// 真实数据测试
describe('StockData with Real Data', () => {
  // 在所有测试完成后关闭数据库连接
  afterAll(async () => {
    const connection = db.getConnection();
    if (connection && typeof connection.end === 'function') {
      // 使用 promise 包装以确保正确等待连接关闭
      await new Promise((resolve, reject) => {
        connection.end((err) => {
          if (err) {
            console.warn('Warning: Error closing database connection:', err);
            resolve(); // 即使出错也解析，避免测试挂起
          } else {
            resolve();
          }
        });
      });
    }
  });

  test('should get stock symbols by user id', async () => {
    const userId = 1;
    const symbols = await stockData.getStockSymbolsByUserId(userId);
    
    // 验证返回结果
    expect(symbols).toEqual([
      'Alibaba Group',       'Alphabet Inc.',
      'Amazon',              'Apple Inc.',
      'Baidu Inc.',          'CSI 300',
      'Dow Jones',           'Hang Seng Index',
      'Meta Platforms',      'Microsoft Corp.',
      'NASDAQ Composite',    'NVIDIA Corp.',
      'Russell 2000',        'S&P 500',
      'Samsung Electronics', 'Tencent Holdings',
      'Tesla Inc.',          'TSMC'
    ]);
  });

  test('should get price data by symbol and days', async () => {
    const symbol = 'TSMC';
    const days = 2;
    const data = await stockData.getPriceDataBySymbolAndDays(symbol, days);
    
    // 验证返回结果包含正确的数据结构和值
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      id: 9097,
      open: 240.2100067138672,
      high: 241.9499969482422,
      low: 238.02999877929688,
      close: 241.60000610351562,
      volume: 9081900,
      dividends: 0,
      stock_splits: 0,
      source: 'tsmc',
      source_name: 'TSMC'
    });
    
    expect(data[1]).toMatchObject({
      id: 9098,
      open: 241.32000732421875,
      high: 246.24000549316406,
      low: 240.94000244140625,
      close: 245.60000610351562,
      volume: 11586400,
      dividends: 0,
      stock_splits: 0,
      source: 'tsmc',
      source_name: 'TSMC'
    });
  });

  test('should get user stock trades', async () => {
    const userId = 1;
    const symbol = 'TSMC';
    const trades = await stockData.getUserStockTrades(userId, symbol);
    
    // 验证返回结果
    expect(trades).toHaveLength(7);
    
    // 验证第一条记录
    expect(trades[0]).toMatchObject({
      id: 363,
      user_id: 1,
      source_name: 'TSMC',
      action: 'sell',
      price: 106.73600006103516,
      quantity: 13,
      total_amount: 1387.5699462890625
    });
    
    // 验证最后一条记录
    expect(trades[6]).toMatchObject({
      id: 47,
      user_id: 1,
      source_name: 'TSMC',
      action: 'buy',
      price: 184.47300720214844,
      quantity: 72,
      total_amount: 13282.099609375
    });
  });
});