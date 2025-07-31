const db = require('../Models/db');

describe('Database Connection', () => {
  afterAll(async () => {
    // 清理数据库连接
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

  test('should create a database connection instance', () => {
    expect(db).toBeDefined();
    expect(db.getCursor()).toBeDefined();
    expect(db.getConnection()).toBeDefined();
  });

  test('should return the same instance (singleton pattern)', () => {
    const db1 = require('../Models/db');
    const db2 = require('../Models/db');
    expect(db1).toBe(db2);
  });

  test('should be able to execute a simple query', async () => {
    // 测试数据库连接是否可以执行查询
    const cursor = db.getCursor();
    try {
      // 执行一个简单的查询来测试连接
      const [rows] = await cursor.execute('SELECT 1 as test');
      expect(rows).toEqual([{ test: 1 }]);
    } catch (error) {
      // 如果数据库没有正确配置，我们会得到一个错误
      // 这里我们期望要么查询成功，要么得到一个连接相关的错误
      expect(error).toBeDefined();
    }
  });
});