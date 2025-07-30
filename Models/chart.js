// 图表相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 存储当前选中的产品ID和时间范围
  let currentProductId = null;
  let currentTimeframe = '1m';
  // 存储股票映射表
  let stocksMap = {};
  
  // 初始化加载股票列表
  loadStocksList();
  
  // 监听时间范围选择变化
  const timeframeSelect = document.getElementById('chart-timeframe');
  if (timeframeSelect) {
    timeframeSelect.addEventListener('change', () => {
      currentTimeframe = timeframeSelect.value;
      if (currentProductId) {
        fetchStockData(currentProductId, currentTimeframe);
      }
    });
  }
  
  // 从后端API获取股票列表
  async function loadStocksList() {
    try {
      const response = await fetch('/api/stocks/list');
      if (!response.ok) throw new Error('获取股票列表失败');
      
      const data = await response.json();
      
      // 构建股票映射表
      data.stocks.forEach((stock, index) => {
        stocksMap[index + 1] = stock.name; // 使用索引+1作为ID
      });
      
      console.log('股票列表加载成功:', stocksMap);
    } catch (error) {
      console.error('获取股票列表失败:', error);
    }
  }
  
  // 从后端API获取股票数据
  async function fetchStockData(stock_name, timeframe = '1m') {
    try {
      console.log("获取股票数据，参数:", { stock_name, timeframe });
      // 不再需要通过ID获取股票名称
      if (!stock_name) return;
      
      // 获取K线数据
      const response = await fetch(`/api/stocks/data?stock_name=${stock_name}&timeframe=${timeframe}`);
      console.log("K线数据响应状态:", response.status, response.statusText);
      if (!response.ok) throw new Error('获取数据失败');
      
      const data = await response.json();
      console.log("获取到的K线数据:", data);
      console.log("K线数据长度:", Array.isArray(data) ? data.length : '非数组');
      
      // 获取股票详情
      const detailsResponse = await fetch(`/api/stocks/details?stock_name=${stock_name}`);
      console.log("详情响应状态:", detailsResponse.status, detailsResponse.statusText);
      if (!detailsResponse.ok) throw new Error('获取详情失败');
      
      const details = await detailsResponse.json();
      console.log("获取到的详情数据:", details);
      
      // 绘制K线图 - 这里仍然需要一个ID用于UI交互，可以使用股票名称作为ID
      drawKLineChart(stock_name, data, details);
      
      return { data, details };
    } catch (error) {
      console.error('获取股票数据失败:', error);
      return null;
    }
  }
  
  // 根据ID获取股票名称
  function getStockNameById(id) {
    // 优先使用从后端获取的股票映射表
    if (stocksMap[id]) {
      return stocksMap[id];
    }
    
    // 如果映射表未加载完成，使用备用的硬编码映射表
    const fallbackStockMap = {
      '1': 'MSFT',    // 微软
      '2': 'TSLA',    // 特斯拉
      '3': 'AAPL',    // 苹果
      '4': 'NVDA',    // 英伟达
      '5': 'AMZN',    // 亚马逊
      '6': 'GOOGL',   // 谷歌
      '7': 'META',    // Facebook(Meta)
      '8': 'BIDU',    // 百度
      '9': 'BABA',    // 阿里巴巴
      '10': 'TCEHY',  // 腾讯
      '11': 'TSM',    // 台积电
      '12': 'SSNLF',  // 三星
      '13': 'SPY',    // 标普500指数
      '14': 'DIA',    // 道琼斯指数
      '15': 'QQQ',    // 纳斯达克指数
      '16': 'IWM',    // 罗素2000指数
      '17': 'FXI',    // 中证300指数
      '18': 'EWH'     // 恒生指数
    };
    return fallbackStockMap[id] || null;
  }
  
  // 绘制K线图函数
  function drawKLineChart(stock_name, kLineData, productDetails) {
    if (!kLineData || kLineData.length === 0) return;
    
    // 更新当前选中的产品ID
    currentProductId = stock_name;
    
    // 获取图表容器 - 在使用时获取而不是在脚本开始时
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) {
      console.error('找不到图表容器元素 #chart-container');
      return;
    }
    
    // 清空图表容器
    const chartContent = chartContainer.querySelector('.chart-content');
    if (chartContent) {
      chartContent.remove();
    }
    
    // 移除占位符
    const placeholder = chartContainer.querySelector('.chart-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
    
    // 创建图表内容容器
    const newChartContent = document.createElement('div');
    newChartContent.classList.add('chart-content');
    
    // 创建图表标题
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = `${productDetails.name} Trends`;
    chartTitle.style.marginBottom = '15px';
    chartTitle.style.color = 'var(--primary-color)';
    
    // 创建K线图容器
    const chartElement = document.createElement('div');
    chartElement.classList.add('k-line-chart');
    chartElement.style.height = 'calc(100% - 30px)';
    chartElement.style.minHeight = '300px';
    chartElement.style.backgroundColor = '#1E1E1E';
    chartElement.style.borderRadius = '8px';
    chartElement.style.padding = '15px';
    chartElement.style.position = 'relative'; // 添加相对定位，用于浮窗定位
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 1000 300');
          // 绘制K线
    const svgContent = drawKLines(kLineData);
    svg.innerHTML = svgContent;
    
    // 添加点击事件监听器，显示浮窗
    svg.addEventListener('click', (event) => {
      showDetailPopup(event, kLineData, productDetails, chartElement);
    });
    
    chartElement.appendChild(svg);
    
    // 添加到图表内容容器
    newChartContent.appendChild(chartTitle);
    newChartContent.appendChild(chartElement);
    
    // 添加到图表容器
    chartContainer.querySelector('.chart-header').after(newChartContent);
    
    // 高亮当前选中的产品
    document.querySelectorAll('#collection-list li a').forEach(item => {
      if (item.dataset.name === stock_name) { // 修改这里，使用data-name属性
        item.parentElement.classList.add('active');
      } else {
        item.parentElement.classList.remove('active');
      }
    });
  }
  
  // 绘制K线
  function drawKLines(data) {
    const width = 1000;
    const height = 300;
    const padding = 40;
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    // 找出最高价和最低价
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    
    data.forEach(day => {
      minPrice = Math.min(minPrice, parseFloat(day.low));
      maxPrice = Math.max(maxPrice, parseFloat(day.high));
    });
    
    // 添加一些边距
    const pricePadding = (maxPrice - minPrice) * 0.1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    
    // 计算比例
    const xScale = availableWidth / (data.length - 1);
    const yScale = availableHeight / (maxPrice - minPrice);
    
    // 绘制网格线和坐标轴
    let gridLines = `
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#444" stroke-width="1" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#444" stroke-width="1" />
    `;
    
    // 价格刻度
    const priceSteps = 5;
    for (let i = 0; i <= priceSteps; i++) {
      const price = minPrice + ((maxPrice - minPrice) * (i / priceSteps));
      const y = height - padding - (price - minPrice) * yScale;
      
      gridLines += `
        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#333" stroke-width="1" stroke-dasharray="5,5" />
        <text x="${padding - 5}" y="${y}" text-anchor="end" dominant-baseline="middle" fill="#CCC" font-size="12">${price.toFixed(2)}</text>
      `;
    }
    
    // 日期刻度（只显示部分）
    const dateSteps = Math.min(5, data.length);
    for (let i = 0; i < dateSteps; i++) {
      const index = Math.floor((data.length - 1) * (i / (dateSteps - 1)));
      const x = padding + (index * xScale);
      
      const date = new Date(data[index].date).toISOString().split('T')[0];
      
      gridLines += `
        <line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="#333" stroke-width="1" stroke-dasharray="5,5" />
        <text x="${x}" y="${height - padding + 15}" text-anchor="middle" fill="#CCC" font-size="12">${date}</text>
      `;
    }
    
    // 绘制K线
    let kLines = '';
    
    data.forEach((day, i) => {
      const x = padding + (i * xScale);
      const open = height - padding - (parseFloat(day.open) - minPrice) * yScale;
      const close = height - padding - (parseFloat(day.close) - minPrice) * yScale;
      const high = height - padding - (parseFloat(day.high) - minPrice) * yScale;
      const low = height - padding - (parseFloat(day.low) - minPrice) * yScale;
      
      // 确定颜色（涨或跌）
      const color = parseFloat(day.close) >= parseFloat(day.open) ? '#FF3D00' : '#4CAF50';
      
      // 绘制K线实体
      const rectHeight = Math.abs(close - open);
      const rectY = Math.min(close, open);
      
      // 添加data-index属性，用于点击时识别
      kLines += `
        <g class="k-line" data-index="${i}">
          <rect x="${x - 4}" y="${rectY}" width="8" height="${rectHeight}" fill="${color}" />
          <line x1="${x}" y1="${high}" x2="${x}" y2="${low}" stroke="${color}" stroke-width="1" />
        </g>
      `;
    });
    
    return `${gridLines}${kLines}`;
  }
  
  // 显示详细数据浮窗
  function showDetailPopup(event, kLineData, productDetails, chartElement) {
    // 移除已有的浮窗
    const existingPopup = document.querySelector('.chart-detail-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
    
    // 获取点击位置
    const rect = chartElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 创建浮窗
    const popup = document.createElement('div');
    popup.classList.add('chart-detail-popup');
    popup.style.position = 'absolute';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.transform = 'translate(-50%, -100%)';
    popup.style.backgroundColor = '#fff';
    popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    popup.style.borderRadius = '8px';
    popup.style.padding = '15px';
    popup.style.zIndex = '1000';
    popup.style.minWidth = '300px';
    popup.style.maxWidth = '500px';
    
    // 创建放大版图表
    // const enlargedChart = document.createElement('div');
    // enlargedChart.style.width = '100%';
    // enlargedChart.style.height = '200px';
    // enlargedChart.style.marginBottom = '15px';
    // enlargedChart.style.backgroundColor = '#1E1E1E';
    // enlargedChart.style.borderRadius = '4px';
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 1000 300');
    
    // 绘制K线
    const svgContent = drawKLines(kLineData);
    svg.innerHTML = svgContent;
    
    enlargedChart.appendChild(svg);
    
    // 创建详细数据表格
    const detailsTable = document.createElement('table');
    detailsTable.style.width = '100%';
    detailsTable.style.borderCollapse = 'collapse';
    detailsTable.style.fontSize = '0.9rem';
    
    // 添加表头
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="text-align: left; padding: 5px; border-bottom: 1px solid #eee;">指标</th>
        <th style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">数值</th>
      </tr>
    `;
    
    // 添加表体
    const tbody = document.createElement('tbody');
    tbody.innerHTML = `
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">股票名称</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">${productDetails.name}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">当前价格</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">$${productDetails.price}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">涨跌幅</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee; color: ${productDetails.change.includes('+') ? 'green' : 'red'};">${productDetails.change}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">开盘价</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">$${productDetails.openPrice}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">最高价</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">$${productDetails.highPrice}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">最低价</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">$${productDetails.lowPrice}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">成交量</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">${productDetails.volume}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">市值</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">${productDetails.marketCap}</td>
      </tr>
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">52周最高</td>
        <td style="text-align: right; padding: 5px; border-bottom: 1px solid #eee;">$${productDetails.high52w}</td>
      </tr>
      <tr>
        <td style="padding: 5px;">52周最低</td>
        <td style="text-align: right; padding: 5px;">$${productDetails.low52w}</td>
      </tr>
    `;
    
    detailsTable.appendChild(thead);
    detailsTable.appendChild(tbody);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#333';
    
    closeButton.addEventListener('click', () => {
      popup.remove();
    });
    
    // 组装浮窗
    popup.appendChild(closeButton);
    popup.appendChild(enlargedChart);
    popup.appendChild(detailsTable);
    
    // 添加到图表容器
    chartElement.appendChild(popup);
  }
  
  // 监听自定义事件，接收来自其他模块的绘制图表请求
  document.addEventListener('drawChart', (event) => {
    const { productId, stock_name, source } = event.detail;
    console.log(productId, stock_name, source);
    if (stock_name) {
      fetchStockData(stock_name, currentTimeframe);
    } else if (source) {  // 添加对 source 的处理
      fetchStockData(source, currentTimeframe);
    } else if (productId) {
      // 如果传递的是productId，需要先转换为stock_name
      const stockName = getStockNameById(productId);
      fetchStockData(stockName, currentTimeframe);
    }
  });
});