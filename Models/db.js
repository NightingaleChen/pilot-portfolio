const mysql = require('mysql2');

// 使用单例模式创建数据库连接
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    // 创建数据库连接
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234567890',
      database: 'pilot'
    });
    
    // 创建并保存 promise 版本的连接
    this.cursor = this.connection.promise();
    
    Database.instance = this;
  }
  
  // 获取 promise 版本的连接
  getCursor() {
    return this.cursor;
  }
  
  // 获取原始连接
  getConnection() {
    return this.connection;
  }
}

// 导出单例实例
module.exports = new Database();