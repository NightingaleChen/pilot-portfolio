// Stock Detail Model - Data management functions
class StockDetailModel {
    // Get stock name by symbol
    getStockNameBySymbol(symbol) {
        const nameMap = {
            'Apple Inc.': '苹果 (AAPL)',
            'Tesla Inc.': '特斯拉 (TSLA)',
            'Microsoft Corp.': '微软 (MSFT)',
            'NVIDIA Corp.': '英伟达 (NVDA)',
            'Alphabet Inc.': '谷歌 (GOOG)',
            'Amazon': '亚马逊 (AMZN)',
            'Meta Platforms': '脸书 (META)',
            'Alibaba Group': '阿里巴巴 (BABA)',
            'Tencent Holdings': '腾讯 (TCEHY)',
            'TSMC': '台积电 (TSM)',
            'Samsung Electronics': '三星 (005930)',
            'Baidu Inc.': '百度 (BIDU)'
        };
        return nameMap[symbol] || symbol;
    }

    // Get stock symbol by ID - map to actual database names
    getStockSymbolById(id) {
        const symbolMap = {
            '1': 'Apple Inc.',
            '2': 'Tesla Inc.',
            '3': 'Microsoft Corp.',
            '4': 'NVIDIA Corp.',
            '5': 'Alphabet Inc.',
            '6': 'Amazon'
        };
        return symbolMap[id] || 'Apple Inc.';
    }

    // API calls
    async getCurrentPrice(symbol) {
        try {
            const response = await fetch(`/api/data/stocks/${symbol}/current`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取股票价格失败:', error);
            return null;
        }
    }

    async getHoldingAmount(symbol) {
        try {
            const response = await fetch(`/api/data/users/1/stocks/${symbol}/quantity`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取持有数量失败:', error);
            return null;
        }
    }

    async getHistory30Data(symbol) {
        try {
            const response = await fetch(`/api/data/stocks/${symbol}/history30`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取历史数据失败:', error);
            return null;
        }
    }

    async getProfitData(symbol) {
        try {
            const response = await fetch(`/api/data/users/1/stocks/${symbol}/profit`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取收益数据失败:', error);
            return null;
        }
    }
}

// Stock Detail Controller Class for browser
class StockDetailController {
    constructor() {
        this.model = new StockDetailModel();
        this.chart = null;
        this.currentSymbol = null;
    }

    // Initialize the page
    async init() {
        // Get stock symbol from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const stockId = urlParams.get('stock');
        
        if (stockId) {
            this.currentSymbol = this.model.getStockSymbolById(stockId);
        } else {
            // Fallback to URL hash or default
            const hash = window.location.hash.substring(1);
            this.currentSymbol = hash || 'Apple Inc.';
        }

        console.log('Loading stock detail for:', this.currentSymbol);
        
        // Load stock data
        await this.loadStockData();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    async loadStockData() {
        try {
            // Update stock name and symbol
            const stockName = this.model.getStockNameBySymbol(this.currentSymbol);
            document.getElementById('stock-name').textContent = stockName;
            document.getElementById('stock-symbol').textContent = `代码: ${this.currentSymbol.toUpperCase()}`;

            // Load current price
            const priceData = await this.model.getCurrentPrice(this.currentSymbol);
            if (priceData && priceData.price) {
                document.getElementById('current-price').textContent = `$${parseFloat(priceData.price).toFixed(2)}`;
            }

            // Load holding amount
            const holdingData = await this.model.getHoldingAmount(this.currentSymbol);
            if (holdingData && holdingData.quantity !== undefined) {
                document.getElementById('holding-amount').textContent = `${holdingData.quantity} 股`;
            }

            // Load profit data
            const profitData = await this.model.getProfitData(this.currentSymbol);
            if (profitData && profitData.profit !== undefined) {
                const profit = parseFloat(profitData.profit);
                const profitElement = document.getElementById('current-profit');
                profitElement.textContent = `$${profit.toFixed(2)}`;
                profitElement.className = `value ${profit >= 0 ? 'positive' : 'negative'}`;
            }

            // Load and display chart
            await this.loadChart();

        } catch (error) {
            console.error('加载股票数据时出错:', error);
        }
    }

    async loadChart() {
        try {
            const response = await this.model.getHistory30Data(this.currentSymbol);
            
            if (response && response.data && response.data.length > 0) {
                this.renderChart(response.data);
            } else {
                console.warn('没有找到历史数据');
            }
        } catch (error) {
            console.error('加载图表数据时出错:', error);
        }
    }

    renderChart(data) {
        const canvas = document.getElementById('price-chart');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;
        
        if (data.length === 0) return;
        
        // Prepare data
        const prices = data.map(item => parseFloat(item.price || item.close || 0));
        const dates = data.map(item => {
            const date = new Date(item.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        // Find min and max prices for scaling
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Price labels
            const price = maxPrice - (priceRange / 5) * i;
            ctx.fillStyle = '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(price.toFixed(2), padding - 5, y + 3);
        }
        
        // Draw price line
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        prices.forEach((price, index) => {
            const x = padding + (chartWidth / (prices.length - 1)) * index;
            const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = '#4CAF50';
        prices.forEach((price, index) => {
            const x = padding + (chartWidth / (prices.length - 1)) * index;
            const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw date labels (show every few dates to avoid crowding)
        ctx.fillStyle = '#999';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const dateStep = Math.max(1, Math.floor(dates.length / 6));
        
        for (let i = 0; i < dates.length; i += dateStep) {
            const x = padding + (chartWidth / (prices.length - 1)) * i;
            const y = canvas.height - 10;
            ctx.fillText(dates[i], x, y);
        }
    }

    setupEventListeners() {
        // Buy button
        document.getElementById('buy-button').addEventListener('click', () => {
            this.handleBuy();
        });

        // Sell button
        document.getElementById('sell-button').addEventListener('click', () => {
            this.handleSell();
        });
    }

    handleBuy() {
        // TODO: Implement buy functionality
        alert('买入功能待实现');
    }

    handleSell() {
        // TODO: Implement sell functionality
        alert('卖出功能待实现');
    }
}

// Initialize when page loads (browser environment)
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const controller = new StockDetailController();
        controller.init();
    });
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new StockDetailModel();
}
