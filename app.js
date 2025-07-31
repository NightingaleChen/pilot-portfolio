const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./Routes/authRoutes');


// Import routes
const routes = require('./Routes/route');
const dataserverRoutes = require('./Models/dataserver'); // 导入dataserver路由模块

// Create Express application
const app = express();


const PORT = process.env.PORT || 1012;


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set MIME type
app.use((req, res, next) => {
  const ext = path.extname(req.url);
  if (ext === '.js') {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// Static file service
app.use(express.static(path.join(__dirname, 'Views')));
// Add static file service for Models directory
app.use('/Models', express.static(path.join(__dirname, 'Models')));


// API routes
app.use('/api/auth', authRoutes);

// Add Models directory as static directory
app.use('/Models', express.static(path.join(__dirname, 'Models')));
// Add CSS directory as static directory
app.use('/css', express.static(path.join(__dirname, 'Views/css')));


// 使用路由
app.use('/api/data', dataserverRoutes); // 使用dataserver路由
app.use('/api', routes);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Views', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});