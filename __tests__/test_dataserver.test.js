const request = require('supertest');
const express = require('express');
const dataserver = require('../Models/dataserver');
const stockData = require('../Models/stockdata');
const db = require('../Models/db');

// 创建一个 Express 应用并使用 dataserver 路由
const app = express();
app.use('/api', dataserver);

// 不再模拟 stockData 模块，使用真实数据进行测试
// jest.mock('../Models/stockdata');

describe('Dataserver API Tests with Real Data', () => {
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

  describe('GET /stocks/:symbol/history/:days', () => {
    test('should return stock history data for TSMC with 2 days', async () => {
      const response = await request(app)
        .get('/api/stocks/TSMC/history/2')
        .expect(200);

      expect(response.body).toEqual({
        symbol: "TSMC",
        days: 2,
        count: 2,
        data: [
          {
            id: 9097,
            date: "2025-07-24T04:00:00.000Z",
            open: 240.2100067138672,
            high: 241.9499969482422,
            low: 238.02999877929688,
            close: 241.60000610351562,
            volume: 9081900,
            dividends: 0,
            stock_splits: 0,
            source: "tsmc",
            source_name: "TSMC"
          },
          {
            id: 9098,
            date: "2025-07-25T04:00:00.000Z",
            open: 241.32000732421875,
            high: 246.24000549316406,
            low: 240.94000244140625,
            close: 245.60000610351562,
            volume: 11586400,
            dividends: 0,
            stock_splits: 0,
            source: "tsmc",
            source_name: "TSMC"
          }
        ]
      });
    });

    test('should return 400 for invalid days', async () => {
      const response = await request(app)
        .get('/api/stocks/TSMC/history/0')
        .expect(400);

      expect(response.body.error).toBe('天数参数无效');
    });
  });

  describe('GET /users/:user_id/stocks', () => {
    test('should return stock symbols for user 1', async () => {
      const response = await request(app)
        .get('/api/users/1/stocks')
        .expect(200);

      expect(response.body).toEqual([
        "Alibaba Group",
        "Alphabet Inc.",
        "Amazon",
        "Apple Inc.",
        "Baidu Inc.",
        "CSI 300",
        "Dow Jones",
        "Hang Seng Index",
        "Meta Platforms",
        "Microsoft Corp.",
        "NASDAQ Composite",
        "NVIDIA Corp.",
        "Russell 2000",
        "S&P 500",
        "Samsung Electronics",
        "Tencent Holdings",
        "Tesla Inc.",
        "TSMC"
      ]);
    });

    test('should return 400 for invalid user_id', async () => {
      const response = await request(app)
        .get('/api/users/abc/stocks')
        .expect(400);

      expect(response.body.error).toBe('用户ID无效');
    });
  });

  describe('GET /stocks/:symbol/current', () => {
    test('should return current stock price for TSMC', async () => {
      const response = await request(app)
        .get('/api/stocks/TSMC/current')
        .expect(200);

      expect(response.body).toEqual({
        symbol: "TSMC",
        price: 245.60000610351562,
        timestamp: "2025-07-25T04:00:00.000Z"
      });
    });
  });

  describe('GET /users/:user_id/stocks/:symbol/quantity', () => {
    test('should return stock quantity for user 1 and Amazon', async () => {
      const response = await request(app)
        .get('/api/users/1/stocks/Amazon/quantity')
        .expect(200);

      expect(response.body).toEqual({
        user_id: 1,
        symbol: "Amazon",
        quantity: -10
      });
    });

    test('should return 400 for invalid user_id', async () => {
      const response = await request(app)
        .get('/api/users/abc/stocks/Amazon/quantity')
        .expect(400);

      expect(response.body.error).toBe('用户ID无效');
    });
  });

  describe('GET /users/:user_id/stocks/:symbol/value', () => {
    test('should return stock value for user 1 and Amazon', async () => {
      const response = await request(app)
        .get('/api/users/1/stocks/Amazon/value')
        .expect(200);

      expect(response.body).toEqual({
        user_id: 1,
        symbol: "Amazon",
        value: 7223.232849121094
      });
    });

    test('should return 400 for invalid user_id', async () => {
      const response = await request(app)
        .get('/api/users/abc/stocks/Amazon/value')
        .expect(400);

      expect(response.body.error).toBe('用户ID无效');
    });
  });

  describe('GET /users/:user_id/stocks/:symbol/profit', () => {
    test('should return stock profit for user 1 and Amazon', async () => {
      const response = await request(app)
        .get('/api/users/1/stocks/Amazon/profit')
        .expect(200);

      expect(response.body).toEqual({
        user_id: 1,
        symbol: "Amazon",
        quantity: -10,
        value: 7223.232849121094,
        current_price: 231.44000244140625,
        profit: -9537.632873535156
      });
    });

    test('should return 400 for invalid user_id', async () => {
      const response = await request(app)
        .get('/api/users/abc/stocks/Amazon/profit')
        .expect(400);

      expect(response.body.error).toBe('用户ID无效');
    });
  });
});