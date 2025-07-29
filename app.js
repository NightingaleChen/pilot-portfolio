const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');


// 导入路由
const routes = require('./Routes/route');

// 创建Express应用
const app = express();

// 设置端口
const PORT = process.env.PORT || 3000;

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'Views')));

// 添加Models目录为静态目录
app.use('/Models', express.static(path.join(__dirname, 'Models')));
// 添加CSS目录为静态目录
app.use('/css', express.static(path.join(__dirname, 'Views/css')));

// 使用路由
app.use('/api', routes);


// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Views', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});