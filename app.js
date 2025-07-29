const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./Routes/authRoutes'); // 添加这一行

// 创建Express应用
const app = express();

// 设置端口
const PORT = process.env.PORT || 3000;

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 设置MIME类型
app.use((req, res, next) => {
  const ext = path.extname(req.url);
  if (ext === '.js') {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'Views')));
// 添加Models目录的静态文件服务
app.use('/Models', express.static(path.join(__dirname, 'Models')));

// API路由
app.use('/api/auth', authRoutes); // 添加这一行

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Views', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});