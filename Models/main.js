// 等待所有组件加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
  // 首先检查登录状态
  const userData = localStorage.getItem('userData');
  if (!userData) {
    // 未登录，不需要等待组件加载
    return;
  }
  
  // 已登录，主动加载组件
  if (typeof ComponentLoader !== 'undefined') {
    try {
      ComponentLoader.loadAllComponents();
    } catch (error) {
      console.error('加载组件时出错:', error);
      // 如果ComponentLoader加载失败，尝试手动加载
      loadComponents();
    }
  } else {
    // 如果ComponentLoader不可用，则手动加载组件
    loadComponents();
  }
  
  // 已登录，等待组件加载
  // 检查所有组件是否已加载
  const checkComponentsLoaded = setInterval(() => {
    const collectionLoaded = document.querySelector('#collection-list');
    const recommendationLoaded = document.querySelector('#todays-picks-list');
    const portfolioLoaded = document.querySelector('.portfolio-grid');
    
    if (collectionLoaded && recommendationLoaded && portfolioLoaded) {
      clearInterval(checkComponentsLoaded);
      initializeApp();
    }
  }, 100);
  
  // 如果5秒后组件仍未加载完成，也初始化应用
  setTimeout(() => {
    clearInterval(checkComponentsLoaded);
    initializeApp();
  }, 5000);
});

// 添加组件加载完成的事件监听器
document.addEventListener('componentsLoaded', () => {
  initializeApp();
});

// 初始化应用
function initializeApp() {
  // 获取DOM元素
  const collectionList = document.getElementById('collection-list');
  // 移除这行，避免与collection.js中的事件绑定冲突
  // const collectionItems = document.querySelectorAll('#collection-list li');
  const priorityButtons = document.querySelectorAll('.priority-btn');
  const chartContainer = document.getElementById('chart-container');
  const searchInput = document.getElementById('product-search');
  const productModal = document.getElementById('product-modal');
  const closeModalBtn = document.querySelector('.close-modal-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  // 模拟产品数据 - 将来从后端API获取
  const productData = {
    1: {
      name: 'Tesla (TSLA)',
      price: '$248.50',
      change: '+5.2%',
      openPrice: '$236.10',
      highPrice: '$249.55',
      lowPrice: '$235.40',
      volume: '28.5M',
      marketCap: '$789.2B',
      high52w: '$299.29',
      low52w: '$152.37',
      kLineData: generateKLineData(100, 200, 250)
    },
    2: {
      name: 'NVIDIA (NVDA)',
      price: '$485.09',
      change: '+4.8%',
      openPrice: '$465.30',
      highPrice: '$487.21',
      lowPrice: '$464.55',
      volume: '35.2M',
      marketCap: '$1.2T',
      high52w: '$502.66',
      low52w: '$138.84',
      kLineData: generateKLineData(400, 450, 500)
    },
    3: {
      name: 'Apple (AAPL)',
      price: '$189.84',
      change: '+3.5%',
      openPrice: '$183.50',
      highPrice: '$190.25',
      lowPrice: '$183.10',
      volume: '42.1M',
      marketCap: '$2.97T',
      high52w: '$198.23',
      low52w: '$124.17',
      kLineData: generateKLineData(150, 180, 200)
    },
    4: {
      name: 'Microsoft (MSFT)',
      price: '$378.85',
      change: '+2.9%',
      openPrice: '$368.20',
      highPrice: '$379.50',
      lowPrice: '$367.80',
      volume: '25.3M',
      marketCap: '$2.82T',
      high52w: '$384.12',
      low52w: '$219.35',
      kLineData: generateKLineData(350, 370, 390)
    },
    5: {
      name: 'Amazon (AMZN)',
      price: '$178.75',
      change: '+2.1%',
      openPrice: '$175.10',
      highPrice: '$179.20',
      lowPrice: '$174.90',
      volume: '31.8M',
      marketCap: '$1.85T',
      high52w: '$185.10',
      low52w: '$101.26',
      kLineData: generateKLineData(160, 175, 185)
    }
  };
  
  // 生成K线图数据
  function generateKLineData(min, avg, max) {
    const data = [];
    const days = 30;
    let price = avg;
    
    for (let i = 0; i < days; i++) {
      // 随机波动
      const change = (Math.random() - 0.5) * 10;
      price = Math.max(min, Math.min(max, price + change));
      
      // 生成当天的开盘、最高、最低、收盘价
      const open = price - (Math.random() * 5);
      const close = price + (Math.random() * 5);
      const high = Math.max(open, close) + (Math.random() * 3);
      const low = Math.min(open, close) - (Math.random() * 3);
      
      data.push({
        date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        volume: Math.floor(Math.random() * 10000000)
      });
    }
    
    return data;
  }
  
  // 更新产品名称
  function updateProductNames() {
    // 更新收藏列表 - 将来从后端API获取数据
    const collectionItems = document.querySelectorAll('#collection-list li a');
    collectionItems.forEach(item => {
      const id = item.dataset.id;
      if (productData[id]) {
        item.textContent = productData[id].name;
      }
    });
    
    // 更新今日推荐列表 - 将来从后端API获取数据
    const recommendationItems = document.querySelectorAll('#todays-picks-list li a');
    recommendationItems.forEach(item => {
      const id = item.dataset.id;
      if (productData[id]) {
        const change = productData[id].change;
        item.textContent = `${productData[id].name} ${change}`;
      }
    });
    
    // 更新投资组合项 - 将来从后端API获取数据
    const portfolioItems = document.querySelectorAll('.portfolio-item h3');
    portfolioItems.forEach(item => {
      const id = item.closest('.portfolio-item').dataset.id;
      if (productData[id]) {
        item.textContent = productData[id].name;
      }
    });
    
    // 更新持有文本
    const sharesTexts = document.querySelectorAll('.shares');
    sharesTexts.forEach(item => {
      const shares = item.textContent.split(': ')[1];
      item.textContent = `Shares: ${shares}`;
    });
  }
  
  // 设置优先级并重新排序 - 将来与后端API交互保存优先级设置
  function togglePriority(button, listItem) {
  // 如果按钮已经激活，则取消激活
  if (button.classList.contains('active')) {
    button.classList.remove('active');
    button.innerHTML = '★'; // 空心星星
    // 将项目移到列表底部
    collectionList.appendChild(listItem);
  } else {
    // 激活按钮
    button.classList.add('active');
    button.innerHTML = '★'; // 实心星星（通过CSS控制颜色）
    // 将项目移到列表顶部
    collectionList.prepend(listItem);
  }
}

// 修改绘制K线图函数 - 将来从后端API获取图表数据
function drawKLineChart(productId) {
  const product = productData[productId];
  if (!product || !product.kLineData) return;
  
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
  chartTitle.textContent = `${product.name} Trends`;
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
  
  // 创建SVG元素
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 1000 300');
  
  // 绘制K线
  const kLineData = product.kLineData;
  const svgContent = drawKLines(kLineData);
  svg.innerHTML = svgContent;
  
  chartElement.appendChild(svg);
  
  // 添加到图表内容容器
  newChartContent.appendChild(chartTitle);
  newChartContent.appendChild(chartElement);
  
  // 添加到图表容器
  chartContainer.querySelector('.chart-header').after(newChartContent);
  
  // 高亮当前选中的产品
  document.querySelectorAll('#collection-list li a').forEach(item => {
    if (item.dataset.id === productId) {
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
      
      gridLines += `
        <line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="#333" stroke-width="1" stroke-dasharray="5,5" />
        <text x="${x}" y="${height - padding + 15}" text-anchor="middle" fill="#CCC" font-size="12">${data[index].date}</text>
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
      const color = parseFloat(day.close) >= parseFloat(day.open) ? '#D4AF37' : '#FF3D00';
      
      // 绘制K线实体
      const rectHeight = Math.abs(close - open);
      const rectY = Math.min(close, open);
      
      kLines += `
        <rect x="${x - 4}" y="${rectY}" width="8" height="${rectHeight}" fill="${color}" />
        <line x1="${x}" y1="${high}" x2="${x}" y2="${low}" stroke="${color}" stroke-width="1" />
      `;
    });
    
    return `${gridLines}${kLines}`;
  }
  
  // 添加事件监听器
  priorityButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      const listItem = button.closest('li');
      togglePriority(button, listItem);
    });
  });
  
  // 语言切换按钮 - 已移除
  // 原语言切换功能已移除
  
  // Create new project button click event - Future backend API integration for adding new projects
  const addNewItemButton = document.querySelector('.add-new-item');
  if (addNewItemButton) {
    addNewItemButton.addEventListener('click', () => {
      // Add logic for opening new project form or dialog here
      alert('Add new project feature coming soon!');
    });
  }
  
  
  // Refresh portfolio button click event
  const refreshPortfolioBtn = document.getElementById('refresh-portfolio');
  if (refreshPortfolioBtn) {
    refreshPortfolioBtn.addEventListener('click', () => {
      alert('Refresh portfolio feature coming soon!');
    });
  }
  
  // 点击推荐项目 - 将来从后端API获取详细数据
  document.querySelectorAll('#todays-picks-list li').forEach(item => {
    item.addEventListener('click', () => {
      const productId = item.querySelector('a').dataset.id;
      drawKLineChart(productId);
    });
  });
  
  // 点击投资组合项目 - 将来从后端API获取详细数据
  portfolioItems.forEach(item => {
    if (!item.classList.contains('add-new-item')) {
      item.addEventListener('click', () => {
        const productId = item.dataset.id;
        drawKLineChart(productId);
      });
    }
  });
  
  closeModalBtn.addEventListener('click', closeProductModal);
  
  // 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === productModal) {
      closeProductModal();
    }
  });
  
  // 搜索功能 - 将来与后端API交互进行搜索
  searchInput.addEventListener('input', () => {
    searchProducts(searchInput.value);
  });
  
  // 初始化今日推荐卡片
  initTodaysPicks();
  
  // 初始化今日推荐卡片
  function initTodaysPicks() {
    const container = document.getElementById('todays-picks');
    // 检查元素是否存在
    if (!container) {
      console.error('找不到todays-picks元素，可能组件尚未加载完成');
      // 延迟重试
      setTimeout(initTodaysPicks, 500);
      return;
    }
    container.innerHTML = '';
    
    // 确保productData已定义
    if (typeof productData === 'undefined') {
      console.error('productData未定义');
      return;
    }
    
    // 按涨幅降序排序
    const sortedProducts = Object.keys(productData).sort((a, b) => {
      const changeA = parseFloat(productData[a].change.replace('%', '').replace('+', ''));
      const changeB = parseFloat(productData[b].change.replace('%', '').replace('+', ''));
      return changeB - changeA; // 已经是降序排列
    });
    
    // 创建卡片
    sortedProducts.forEach(id => {
      const product = productData[id];
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = id;
      
      card.innerHTML = `
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="price">${product.price}</p>
          <p class="change positive">${product.change}</p>
        </div>
        <div class="product-chart">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30L5 28L10 32L15 25L20 28L25 20L30 22L35 18L40 15L45 18L50 10L55 15L60 12L65 15L70 8L75 12L80 5L85 10L90 2L95 5L100 0" stroke="#D4AF37" stroke-width="2"/>
          </svg>
        </div>
      `;
      
      card.addEventListener('click', () => {
        drawKLineChart(id);
      });
      
      container.appendChild(card);
    });
  }
};
  collectionItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        const productId = item.querySelector('a').dataset.id;
        drawKLineChart(productId);
      }
    });
  });
  
  // 点击推荐项目 - 将来从后端API获取详细数据
  document.querySelectorAll('#todays-picks-list li').forEach(item => {
    item.addEventListener('click', () => {
      const productId = item.querySelector('a').dataset.id;
      drawKLineChart(productId);
    });
  });
  
  // 点击投资组合项目 - 将来从后端API获取详细数据
  portfolioItems.forEach(item => {
    if (!item.classList.contains('add-new-item')) {
      item.addEventListener('click', () => {
        const productId = item.dataset.id;
        drawKLineChart(productId);
      });
    }
  });
  
  closeModalBtn.addEventListener('click', closeProductModal);
  
  // 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === productModal) {
      closeProductModal();
    }
  });
  
  // 搜索功能 - 将来与后端API交互进行搜索
  searchInput.addEventListener('input', () => {
    searchProducts(searchInput.value);
  });
  
  // 初始化今日推荐卡片
  initTodaysPicks();
  
  // 初始化今日推荐卡片
  // 初始化今日推荐卡片
  function initTodaysPicks() {
    const container = document.getElementById('todays-picks');
    // 检查元素是否存在
    if (!container) {
      console.error('找不到todays-picks元素');
      return;
    }
    container.innerHTML = '';
    
    // 按涨幅降序排序
    const sortedProducts = Object.keys(productData).sort((a, b) => {
      const changeA = parseFloat(productData[a].change.replace('%', '').replace('+', ''));
      const changeB = parseFloat(productData[b].change.replace('%', '').replace('+', ''));
      return changeB - changeA; // 已经是降序排列
    });
    
    // 创建卡片
    sortedProducts.forEach(id => {
      const product = productData[id];
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = id;
      
      card.innerHTML = `
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="price">${product.price}</p>
          <p class="change positive">${product.change}</p>
        </div>
        <div class="product-chart">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30L5 28L10 32L15 25L20 28L25 20L30 22L35 18L40 15L45 18L50 10L55 15L60 12L65 15L70 8L75 12L80 5L85 10L90 2L95 5L100 0" stroke="#D4AF37" stroke-width="2"/>
          </svg>
        </div>
      `;
      
      card.addEventListener('click', () => {
        drawKLineChart(id);
      });
      
      container.appendChild(card);
    });
  };

// 如果ComponentLoader不可用，则手动加载组件
function loadComponents() {
  const components = [
    {
      container: 'collection-container',
      htmlPath: '/collection.html'
    },
    {
      container: 'recommendation-container',
      htmlPath: '/recommendation.html'
    },
    {
      container: 'portfolio-container',
      htmlPath: '/portfolio.html'
    },
    {
      container: 'chart-container-wrapper',
      htmlPath: '/chart.html'
    }
  ];
  
  components.forEach(component => {
    const container = document.getElementById(component.container);
    if (container) {
      fetch(component.htmlPath)
        .then(response => response.text())
        .then(html => {
          container.innerHTML = html;
        })
        .catch(error => {
          console.error(`加载组件 ${component.htmlPath} 失败:`, error);
        });
    }
  });
}

