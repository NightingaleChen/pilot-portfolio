// 根据股票代码获取股票名称
function getStockNameBySymbol(symbol) {
    const nameMap = {
        'AAPL': '苹果 (AAPL)',
        'apple': '苹果 (AAPL)',
        'TSLA': '特斯拉 (TSLA)',
        'tesla': '特斯拉 (TSLA)',
        'MSFT': '微软 (MSFT)', 
        'microsoft': '微软 (MSFT)',
        'NVDA': '英伟达 (NVDA)',
        'GOOG': '谷歌 (GOOG)',
        'google': '谷歌 (GOOG)',
        'AMZN': '亚马逊 (AMZN)',
        'amazon': '亚马逊 (AMZN)'
    };
    return nameMap[symbol] || nameMap[symbol.toLowerCase()] || `${symbol} (${symbol})`;
}

// 从URL参数获取股票ID和代码
function getStockInfoFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id'),
        symbol: urlParams.get('symbol')
    };
}

// 获取股票当前价格
async function getCurrentPrice(symbol) {
    try {
        const response = await fetch(`/api/data/stocks/${symbol}/current`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取股票价格失败:', error);
        return null;
    }
}

// 获取股票持有数量
async function getHoldingAmount(symbol) {
    try {
        // 修改API调用路径，使用正确的用户ID和端点
        const response = await fetch(`/api/data/users/1/stocks/${symbol}/quantity`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取持有数量失败:', error);
        return null;
    }
}

// 获取股票30天历史数据
async function getHistory30Data(symbol) {
    try {
        const response = await fetch(`/api/data/stocks/${symbol}/history30`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取历史数据失败:', error);
        return null;
    }
}

// 根据股票ID获取股票代码
function getStockSymbolById(id) {
    const symbolMap = {
        '1': 'AAPL',
        '2': 'TSLA',
        '3': 'MSFT',
        '4': 'NVDA'
    };
    
    return symbolMap[id] || 'AAPL';
}

// 初始化页面
async function initPage() {
    const stockInfo = getStockInfoFromURL();
    const stockId = stockInfo.id;
    const stockSymbol = stockInfo.symbol || getStockSymbolById(stockId);
    const stockName = getStockNameBySymbol(stockSymbol);
    
    // 更新页面标题信息
    document.getElementById('stock-name').textContent = stockName;
    document.getElementById('stock-symbol').textContent = '代码: ' + stockSymbol;
    
    console.log('正在获取股票数据:', { stockId, stockSymbol, stockName });
    
    // 获取并更新当前价格
    const priceData = await getCurrentPrice(stockSymbol);
    console.log('价格数据:', priceData);
    if (priceData && priceData.price) {
        document.getElementById('current-price').textContent = '$' + priceData.price.toFixed(2);
    } else {
        document.getElementById('current-price').textContent = '$0.00';
    }
    
    // 获取并更新持有数量
    const amountData = await getHoldingAmount(stockSymbol);
    console.log('持有数量数据:', amountData);
    if (amountData && amountData.quantity !== undefined) {
        document.getElementById('holding-amount').textContent = amountData.quantity + ' 股';
    } else {
        document.getElementById('holding-amount').textContent = '0 股';
    }
    
    // 获取并更新收益信息
    try {
        const profitResponse = await fetch(`/api/data/users/1/stocks/${stockSymbol}/profit`);
        const profitData = await profitResponse.json();
        console.log('收益数据:', profitData);
        
        if (profitData && profitData.profit !== undefined) {
            const profit = profitData.profit;
            const profitText = profit >= 0 ? `+$${Math.abs(profit).toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`;
            const profitClass = 'value ' + (profit >= 0 ? 'positive' : 'negative');
            
            document.getElementById('current-profit').textContent = profitText;
            document.getElementById('current-profit').className = profitClass;
        } else {
            document.getElementById('current-profit').textContent = '$0.00';
            document.getElementById('current-profit').className = 'value positive';
        }
    } catch (error) {
        console.error('获取收益数据失败:', error);
        document.getElementById('current-profit').textContent = '$0.00';
        document.getElementById('current-profit').className = 'value positive';
    }
    
    // 获取并绘制价格走势图
    const historyData = await getHistory30Data(stockSymbol);
    console.log('历史数据:', historyData);
    if (historyData && historyData.data && historyData.data.length > 0) {
        console.log('使用真实数据绘制图表，数据条数:', historyData.data.length);
        // 存储数据以供resize使用
        const canvas = document.getElementById('price-chart');
        canvas.setAttribute('data-has-real-data', 'true');
        canvas.setAttribute('data-chart-data', JSON.stringify(historyData.data));
        drawChart(historyData.data);
    } else {
        console.log('没有获取到历史数据，使用模拟图表');
        const canvas = document.getElementById('price-chart');
        canvas.removeAttribute('data-has-real-data');
        canvas.removeAttribute('data-chart-data');
        initChart(); // 如果获取失败，使用模拟图表
    }
}

// 绘制真实数据图表
function drawChart(data) {
    console.log('开始绘制图表，数据:', data);
    const canvas = document.getElementById('price-chart');
    if (!canvas) {
        console.error('找不到canvas元素');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('无法获取canvas上下文');
        return;
    }
    
    // 设置画布尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log('画布尺寸:', canvas.width, 'x', canvas.height);
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置样式
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    ctx.font = '12px Poppins, sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'center';
    
    // 绘制坐标轴
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, canvas.height - 50);
    ctx.lineTo(canvas.width - 20, canvas.height - 50);
    ctx.stroke();
    
    // 确保数据按日期排序
    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 计算价格范围
    const prices = sortedData.map(item => parseFloat(item.close));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1; // 防止除零错误
    
    // 绘制纵轴价格标签
    const priceTicks = 5;
    for (let i = 0; i <= priceTicks; i++) {
        const priceValue = minPrice + (priceRange * i / priceTicks);
        const y = canvas.height - 50 - ((priceValue - minPrice) / priceRange) * (canvas.height - 70);
        
        // 绘制水平网格线
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.moveTo(50, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
        
        // 绘制价格标签
        ctx.strokeStyle = '#CCCCCC';
        ctx.fillStyle = '#CCCCCC';
        ctx.textAlign = 'right';
        ctx.fillText('$' + priceValue.toFixed(2), 45, y + 4);
    }
    
    // 绘制折线图
    ctx.beginPath();
    ctx.strokeStyle = '#D4AF37';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    
    const dataPoints = [];
    const width = canvas.width - 70;
    const height = canvas.height - 70;
    
    sortedData.forEach((item, index) => {
        const x = 50 + (index / (sortedData.length - 1)) * width;
        const y = canvas.height - 50 - ((parseFloat(item.close) - minPrice) / priceRange) * height;
        dataPoints.push({x, y, price: item.close, timestamp: item.date});
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // 填充区域
    ctx.stroke();
    if (dataPoints.length > 0) {
        ctx.lineTo(dataPoints[dataPoints.length - 1].x, canvas.height - 50);
        ctx.lineTo(dataPoints[0].x, canvas.height - 50);
        ctx.closePath();
        ctx.fill();
        
        // 绘制数据点
        ctx.fillStyle = '#D4AF37';
        dataPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // 绘制横轴时间标签
    const dateTicks = Math.min(5, sortedData.length); // 最多显示5个时间标签
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < dateTicks; i++) {
        const index = Math.floor(i * (sortedData.length - 1) / (dateTicks - 1));
        const point = dataPoints[index];
        if (point) {
            const date = new Date(point.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            ctx.fillText(dateStr, point.x, canvas.height - 30);
            
            // 绘制垂直网格线
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.moveTo(point.x, 20);
            ctx.lineTo(point.x, canvas.height - 50);
            ctx.stroke();
        }
    }
    
    // 添加坐标轴标签
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px Poppins, sans-serif';
    ctx.fillText('价格 (USD)', 15, canvas.height / 2);
    ctx.fillText('时间', canvas.width / 2, canvas.height - 5);
}

// 初始化模拟图表
function initChart() {
    const canvas = document.getElementById('price-chart');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // 绘制模拟图表
    drawMockChart(ctx, canvas.width, canvas.height);
}

// 绘制模拟图表
function drawMockChart(ctx, width, height) {
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置样式
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    
    // 绘制坐标轴
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.stroke();
    
    // 绘制模拟折线图
    ctx.beginPath();
    ctx.moveTo(50, height - 100);
    
    // 生成模拟数据点
    const dataPoints = [];
    let y = height - 100;
    for (let x = 50; x < width - 20; x += (width - 70) / 10) {
        y += (Math.random() - 0.5) * 50;
        y = Math.max(50, Math.min(height - 70, y)); // 限制y值范围
        dataPoints.push({x, y});
        ctx.lineTo(x, y);
    }
    
    // 填充区域
    ctx.stroke();
    ctx.lineTo(dataPoints[dataPoints.length - 1].x, height - 50);
    ctx.lineTo(50, height - 50);
    ctx.closePath();
    ctx.fill();
    
    // 绘制数据点
    ctx.fillStyle = '#D4AF37';
    dataPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 买入按钮事件
function handleBuyClick() {
    const stockName = document.getElementById('stock-name').textContent;
    alert(`买入功能：您将买入 ${stockName}\n此功能将在后续版本中实现。`);
}

// 卖出按钮事件
function handleSellClick() {
    const stockName = document.getElementById('stock-name').textContent;
    alert(`卖出功能：您将卖出 ${stockName}\n此功能将在后续版本中实现。`);
}

// 页面加载完成后初始化
function initializeStockDetailPage() {
    // 添加事件监听器
    document.getElementById('buy-button').addEventListener('click', handleBuyClick);
    document.getElementById('sell-button').addEventListener('click', handleSellClick);
    
    // 初始化页面
    initPage();
}

// 窗口大小改变时重绘图表
function handleResize() {
    const canvas = document.getElementById('price-chart');
    if (canvas && canvas.hasAttribute('data-has-real-data')) {
        // 如果有真实数据，重新绘制真实数据图表
        const data = JSON.parse(canvas.getAttribute('data-chart-data') || '[]');
        if (data.length > 0) {
            drawChart(data);
        } else {
            initChart();
        }
    } else {
        // 否则绘制模拟图表
        initChart();
    }
}

// 页面加载完成后执行
window.addEventListener('load', initializeStockDetailPage);

// 窗口大小改变时重绘图表
window.addEventListener('resize', handleResize);
