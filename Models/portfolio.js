// 投资组合相关的JavaScript代码
function initializePortfolio() {
  loadPortfolioData();
}

// 检查文档是否已经加载完成
if (document.readyState === 'loading') {
  // 文档仍在加载中，添加事件监听器
  document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
  // 文档已经加载完成，直接执行
  initializePortfolio();
}

// 加载投资组合数据
async function loadPortfolioData() {
  const userId = 1; // 默认用户ID为1
  const portfolioGrid = document.getElementById('portfolio-grid');
  
  try {
    // 显示加载状态
    portfolioGrid.innerHTML = '<div class="loading-message">Loading...</div>';
    
    // 获取用户持有的所有股票代码
    const symbolsResponse = await fetch(`/api/data/users/${userId}/stocks`);
    if (!symbolsResponse.ok) {
      throw new Error(`HTTP error! status: ${symbolsResponse.status}`);
    }
    const symbols = await symbolsResponse.json();
    
    // 清空现有内容
    portfolioGrid.innerHTML = '';
    
    // 为每个股票代码创建portfolio-item
    for (const symbol of symbols) {
      // 获取股票持有数量
      const quantityResponse = await fetch(`/api/data/users/${userId}/stocks/${symbol}/quantity`);
      if (!quantityResponse.ok) {
        throw new Error(`HTTP error! status: ${quantityResponse.status}`);
      }
      const quantityData = await quantityResponse.json();
      const quantity = quantityData.quantity;
      
      // 获取股票总市值
      const valueResponse = await fetch(`/api/data/users/${userId}/stocks/${symbol}/value`);
      if (!valueResponse.ok) {
        throw new Error(`HTTP error! status: ${valueResponse.status}`);
      }
      const valueData = await valueResponse.json();
      const value = valueData.value;
      
      // 获取股票收益
      const profitResponse = await fetch(`/api/data/users/${userId}/stocks/${symbol}/profit`);
      if (!profitResponse.ok) {
        throw new Error(`HTTP error! status: ${profitResponse.status}`);
      }
      const profitData = await profitResponse.json();
      const profit = profitData.profit;
      
      // 创建portfolio-item元素
      const portfolioItem = document.createElement('div');
      portfolioItem.className = 'portfolio-item';
      portfolioItem.dataset.symbol = symbol;
      
      // 计算百分比变化
      const percentageChange = value !== 0 ? Math.abs((profit / value) * 100).toFixed(2) : 0;
      const changeClass = profit >= 0 ? 'change positive' : 'change negative';
      const formattedProfit = profit >= 0 ? `+$${Math.abs(profit).toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`;
      const formattedValue = `$${Math.abs(value).toFixed(2)}`;
      const formattedQuantity = `${quantity} shares`;
      
      portfolioItem.innerHTML = `
        <div class="portfolio-header">
          <h3>${symbol}</h3>
          <span class="allocation"></span>
        </div>
        <div class="portfolio-details">
          <p class="shares">Holdings: ${formattedQuantity}</p>
          <p class="value">${formattedValue}</p>
          <p class="${changeClass}">${formattedProfit} (${percentageChange}%)</p>
        </div>
      `;
      
      portfolioGrid.appendChild(portfolioItem);
    }
    
    // 添加"添加新产品"按钮
    const addNewItem = document.createElement('div');
    addNewItem.className = 'portfolio-item add-new-item';
    addNewItem.innerHTML = `
      <div class="add-icon">+</div>
      <div class="add-text">Add New Product</div>
    `;
    portfolioGrid.appendChild(addNewItem);
    
    // 添加事件监听器
    addNewItem.addEventListener('click', () => {
      // 调用newprojects.js中的添加项目浮窗功能
      if (typeof showAddItemOverlay === 'function') {
        showAddItemOverlay();
      } else {
        console.error('showAddItemOverlay function not found. Please ensure newprojects.js is loaded.');
      }
    });
    
    // 为每个股票项目添加点击事件，跳转到详情页面
    const portfolioItems = document.querySelectorAll('.portfolio-item:not(.add-new-item)');
    portfolioItems.forEach(item => {
      item.addEventListener('click', () => {
        const symbol = item.dataset.symbol;
        // 跳转到股票详情页面
        window.location.href = `stock_detail.html?symbol=${symbol}`;
      });
    });
    
  } catch (error) {
    console.error('获取投资组合数据失败:', error);
    portfolioGrid.innerHTML = '<div class="error-message">加载数据时出错，请稍后重试。</div>';
  }
}

// 根据ID获取股票名称
function getStockNameById(id) {
  // 这里使用映射表，实际项目中可能需要从后端获取
  const stockMap = {
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
  return stockMap[id] || null;
}