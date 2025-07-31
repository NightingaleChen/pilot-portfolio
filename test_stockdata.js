const stockData = require('./Models/stockdata');

async function testStockData() {
  try {
    console.log('测试 stockdata.js 的功能函数:');
    console.log('=====================================');

    // 1. 调用 getStockSymbolsByUserId(1)
    console.log('1. 调用 getStockSymbolsByUserId(1):');
    const symbols = await stockData.getStockSymbolsByUserId(1);
    console.log('结果:', symbols);
    console.log('');

    // 2. 调用 getPriceDataBySymbolAndDays('TSMC', 2)
    console.log('2. 调用 getPriceDataBySymbolAndDays(\'TSMC\', 2):');
    const priceData = await stockData.getPriceDataBySymbolAndDays('TSMC', 2);
    console.log('结果:', priceData);
    console.log('');

    // 3. 调用 getUserStockTrades(1, 'TSMC')
    console.log('3. 调用 getUserStockTrades(1, \'TSMC\'):');
    const trades = await stockData.getUserStockTrades(1, 'TSMC');
    console.log('结果:', trades);
    console.log('');

    console.log('所有测试完成。');
  } catch (error) {
    console.error('执行过程中发生错误:', error);
  }
}

// 执行测试函数
testStockData();