// Stock Detail Controller - Business logic and coordination
const stockDetailModel = require('../Models/stockDetail');

class StockDetailController {
    // Get stock info from URL parameters
    getStockInfoFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            id: urlParams.get('id'),
            symbol: urlParams.get('symbol')
        };
    }

    // Initialize page data
    async initPageData() {
        const stockInfo = this.getStockInfoFromURL();
        const stockId = stockInfo.id;
        const stockSymbol = stockInfo.symbol || stockDetailModel.getStockSymbolById(stockId);
        const stockName = stockDetailModel.getStockNameBySymbol(stockSymbol);
        
        console.log('正在获取股票数据:', { stockId, stockSymbol, stockName });
        
        // Get all data concurrently
        const [priceData, amountData, profitData, historyData] = await Promise.all([
            stockDetailModel.getCurrentPrice(stockSymbol),
            stockDetailModel.getHoldingAmount(stockSymbol),
            stockDetailModel.getProfitData(stockSymbol),
            stockDetailModel.getHistory30Data(stockSymbol)
        ]);
        
        console.log('获取到的数据:', { priceData, amountData, profitData, historyData });
        
        return {
            stockName,
            stockSymbol,
            priceData,
            amountData,
            profitData,
            historyData
        };
    }

    // Handle buy action
    handleBuyAction(stockName) {
        // In a real application, this would handle the buy logic
        console.log(`买入股票: ${stockName}`);
        alert(`买入功能：您将买入 ${stockName}\n此功能将在后续版本中实现。`);
    }

    // Handle sell action
    handleSellAction(stockName) {
        // In a real application, this would handle the sell logic
        console.log(`卖出股票: ${stockName}`);
        alert(`卖出功能：您将卖出 ${stockName}\n此功能将在后续版本中实现。`);
    }
}

// Export class instance for browser use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new StockDetailController();
} else {
    // Browser environment
    window.StockDetailController = new StockDetailController();
}
