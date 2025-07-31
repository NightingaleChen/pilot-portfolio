const express = require('express');
const request = require('supertest');
const dataserver = require('./Models/dataserver');

// 创建一个 Express 应用并使用 dataserver 路由
const app = express();
app.use('/api', dataserver);

async function testDataserver() {
  try {
    console.log('测试 dataserver.js 的 API 路由:');
    console.log('=====================================');

    // 1. 测试 /stocks/:symbol/history/:days 路由
    console.log('1. 调用 /stocks/TSMC/history/2:');
    const historyResponse = await request(app).get('/api/stocks/TSMC/history/2');
    console.log('状态码:', historyResponse.status);
    console.log('结果:', JSON.stringify(historyResponse.body, null, 2));
    console.log('');

    // 2. 测试 /users/:user_id/stocks 路由
    console.log('2. 调用 /users/1/stocks:');
    const userStocksResponse = await request(app).get('/api/users/1/stocks');
    console.log('状态码:', userStocksResponse.status);
    console.log('结果:', JSON.stringify(userStocksResponse.body, null, 2));
    console.log('');

    // 3. 测试 /stocks/:symbol/current 路由
    console.log('3. 调用 /stocks/TSMC/current:');
    const currentResponse = await request(app).get('/api/stocks/TSMC/current');
    console.log('状态码:', currentResponse.status);
    console.log('结果:', JSON.stringify(currentResponse.body, null, 2));
    console.log('');

    // 4. 测试 /users/:user_id/stocks/:symbol/quantity 路由
    console.log('4. 调用 /users/1/stocks/Amazon/quantity:');
    const quantityResponse = await request(app).get('/api/users/1/stocks/Amazon/quantity');
    console.log('状态码:', quantityResponse.status);
    console.log('结果:', JSON.stringify(quantityResponse.body, null, 2));
    console.log('');

    // 5. 测试 /users/:user_id/stocks/:symbol/value 路由
    console.log('5. 调用 /users/1/stocks/Amazon/value:');
    const valueResponse = await request(app).get('/api/users/1/stocks/Amazon/value');
    console.log('状态码:', valueResponse.status);
    console.log('结果:', JSON.stringify(valueResponse.body, null, 2));
    console.log('');

    // 6. 测试 /stocks/:symbol/history30 路由
    console.log('6. 调用 /stocks/Amazon/history30:');
    const history30Response = await request(app).get('/api/stocks/Amazon/history30');
    console.log('状态码:', history30Response.status);
    console.log('结果:', JSON.stringify(history30Response.body, null, 2));
    console.log('');

    // 7. 测试 /users/:user_id/stocks/:symbol/profit 路由
    console.log('7. 调用 /users/1/stocks/Amazon/profit:');
    const profitResponse = await request(app).get('/api/users/1/stocks/Amazon/profit');
    console.log('状态码:', profitResponse.status);
    console.log('结果:', JSON.stringify(profitResponse.body, null, 2));
    console.log('');

    console.log('所有测试完成。');
  } catch (error) {
    console.error('执行过程中发生错误:', error);
  }
}

// 执行测试函数
testDataserver();