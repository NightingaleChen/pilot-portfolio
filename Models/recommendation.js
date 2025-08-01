// 推荐功能相关的JavaScript代码

// 初始化函数
function initRecommendation() {
  // 获取DOM元素
  const recommendationList = document.getElementById('todays-picks-list');
  
  // 如果元素不存在，直接返回
  if (!recommendationList) {
    console.log("todays-picks-list元素不存在，推荐功能未初始化");
    return;
  }
  
  // 防止重复初始化
  if (recommendationList.dataset.initialized === 'true') {
    console.log("推荐列表已经初始化过，跳过");
    return;
  }
  recommendationList.dataset.initialized = 'true';
  
  console.log("recommend list start");
  
  // 从API获取推荐股票数据
  async function fetchTopStocks() {
    try {
      const response = await fetch('/api/recommend/top');
      if (!response.ok) {
        throw new Error('Failed to get recommended stocks');
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('获取推荐股票失败:', error);
      return [];
    }
  }
  
  // 初始化今日推荐列表
  async function initTodaysPicks() {
    // 清空现有列表
    recommendationList.innerHTML = '';
    
    // 显示加载中
    const loadingItem = document.createElement('li');
    loadingItem.textContent = 'Loading...';
    recommendationList.appendChild(loadingItem);
    
    // 获取数据
    const stocks = await fetchTopStocks();
    
    // 清空加载提示
    recommendationList.innerHTML = '';
    
    // 检查是否有数据
    if (!stocks || stocks.length === 0) {
      const noDataItem = document.createElement('li');
      noDataItem.textContent = 'No recommendation data available';
      recommendationList.appendChild(noDataItem);
      return;
    }
    
    // 创建列表项
    stocks.forEach((stock, index) => {
      // 计算price_change百分比并格式化
      const priceChangePercent = (stock.price_change * 100).toFixed(2);
      const formattedPriceChange = priceChangePercent > 0 ? 
        `+${priceChangePercent}%` : `${priceChangePercent}%`;
      
      // 创建列表项
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#';
      link.dataset.id = index;
      link.dataset.source = stock.source;
      link.textContent = `${stock.source} ${formattedPriceChange}`;
      link.dataset.source = stock.source_name;
      
      // 创建股票名称和百分比的HTML结构
      const isPositive = priceChangePercent > 0;
      const changeClass = isPositive ? 'positive' : 'negative';
      link.innerHTML = `
        <span class="stock-name">${stock.source_name}</span>
        <span class="change ${changeClass}">${formattedPriceChange}</span>
      `;
      
      // 添加点击事件
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 调试输出
        console.log('点击推荐项:', stock);
        console.log('source_name:', stock.source_name);
        
        // 确保 source_name 存在
        const stockName = stock.source_name || stock.stock_name || `stock_${index}`;
        
        // 使用自定义事件通知图表模块绘制图表
        const event = new CustomEvent('drawChart', { 
          detail: { 
            productId: index,
            stock_name: stock.source_name, // 修改为使用source_name
            source: stock.source_name,
            priceChange: formattedPriceChange
          } 
        });
        document.dispatchEvent(event);
      });
      
      listItem.appendChild(link);
      recommendationList.appendChild(listItem);
    });
    
    console.log("推荐列表加载完成");
  }
  
  // 初始化推荐列表
  initTodaysPicks();
}

// DOMContentLoaded事件监听器
document.addEventListener('DOMContentLoaded', () => {
  // 尝试初始化，但可能此时元素还不存在
  initRecommendation();
});

// 组件加载完成事件监听器
document.addEventListener('componentsLoaded', () => {
  // 组件加载完成后再次尝试初始化
  console.log("组件加载完成，尝试初始化推荐功能");
  initRecommendation();
});

// 用户登录事件监听器
document.addEventListener('userLoggedIn', () => {
  // 用户登录后再次尝试初始化
  console.log("用户登录完成，尝试初始化推荐功能");
  setTimeout(initRecommendation, 1000); // 延迟1秒，确保组件已加载
});