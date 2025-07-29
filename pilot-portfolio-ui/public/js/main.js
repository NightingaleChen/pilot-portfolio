// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const productCards = document.querySelectorAll('.product-card');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const collectionItems = document.querySelectorAll('#collection-list li');
  const priorityButtons = document.querySelectorAll('.priority-btn');
  const productModal = document.getElementById('product-modal');
  const closeModalBtn = document.querySelector('.close-modal-btn');
  const chartContainer = document.getElementById('chart-container');
  const searchInput = document.getElementById('product-search');
  const languageSwitch = document.getElementById('language-switch');
  const collectionList = document.getElementById('collection-list');
  
  // 语言数据
  const translations = {
    zh: {
      search: "搜索产品名称...",
      collection: "收藏",
      recommendations: "今日推荐",
      sortedBy: "根据每日涨幅排序",
      portfolio: "我的投资组合",
      viewAll: "查看全部",
      shares: "持有",
      chartAnalysis: "图表分析",
      selectProduct: "请从左侧选择产品查看详细图表",
      settings: "设置",
      logout: "退出",
      productDetails: "产品详情",
      openPrice: "开盘价",
      highPrice: "最高价",
      lowPrice: "最低价",
      volume: "成交量",
      marketCap: "市值",
      weekHigh: "52周高",
      weekLow: "52周低",
      buy: "买入",
      sell: "卖出",
      addToCollection: "添加到收藏"
    },
    en: {
      search: "Search products...",
      collection: "Collection",
      recommendations: "Today's Picks",
      sortedBy: "Sorted by daily change",
      portfolio: "My Portfolio",
      viewAll: "View All",
      shares: "Shares",
      chartAnalysis: "Chart Analysis",
      selectProduct: "Please select a product from the left to view detailed chart",
      settings: "Settings",
      logout: "Logout",
      productDetails: "Product Details",
      openPrice: "Open Price",
      highPrice: "High Price",
      lowPrice: "Low Price",
      volume: "Volume",
      marketCap: "Market Cap",
      weekHigh: "52W High",
      weekLow: "52W Low",
      buy: "Buy",
      sell: "Sell",
      addToCollection: "Add to Collection"
    }
  };
  
  // 当前语言
  let currentLang = 'zh';
  
  // 模拟数据
  const productData = {
    1: {
      name: {
        zh: '特斯拉 (TSLA)',
        en: 'Tesla (TSLA)'
      },
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
      name: {
        zh: '英伟达 (NVDA)',
        en: 'NVIDIA (NVDA)'
      },
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
      name: {
        zh: '苹果 (AAPL)',
        en: 'Apple (AAPL)'
      },
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
      name: {
        zh: '微软 (MSFT)',
        en: 'Microsoft (MSFT)'
      },
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
      name: {
        zh: '亚马逊 (AMZN)',
        en: 'Amazon (AMZN)'
      },
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
  
  // 切换语言
  function switchLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    languageSwitch.textContent = currentLang === 'zh' ? 'EN' : '中';
    
    // 更新界面文本
    document.getElementById('product-search').placeholder = translations[currentLang].search;
    document.querySelector('.nav-section h3:first-child').textContent = translations[currentLang].collection;
    document.querySelector('.nav-section h3:nth-child(1)').textContent = translations[currentLang].recommendations;
    document.querySelector('.daily-recommendations .section-header h2').textContent = translations[currentLang].recommendations;
    document.querySelector('.daily-recommendations .section-header p').textContent = translations[currentLang].sortedBy;
    document.querySelector('.portfolio-section .section-header h2').textContent = translations[currentLang].portfolio;
    document.querySelector('.view-all-btn').textContent = translations[currentLang].viewAll;
    document.querySelector('.chart-section .chart-header h2').textContent = translations[currentLang].chartAnalysis;
    document.querySelector('.chart-placeholder p').textContent = translations[currentLang].selectProduct;
    document.querySelector('.settings-link').textContent = translations[currentLang].settings;
    document.querySelector('.logout-link').textContent = translations[currentLang].logout;
    
    // 更新产品名称
    updateProductNames();
  }
  
  // 更新产品名称
  function updateProductNames() {
    // 更新收藏列表
    const collectionItems = document.querySelectorAll('#collection-list li a');
    collectionItems.forEach(item => {
      const id = item.dataset.id;
      if (productData[id]) {
        item.textContent = productData[id].name[currentLang];
      }
    });
    
    // 更新今日推荐列表
    const recommendationItems = document.querySelectorAll('#todays-picks-list li a');
    recommendationItems.forEach(item => {
      const id = item.dataset.id;
      if (productData[id]) {
        const change = productData[id].change;
        item.textContent = `${productData[id].name[currentLang]} ${change}`;
      }
    });
    
    // 更新投资组合项
    const portfolioItems = document.querySelectorAll('.portfolio-item h3');
    portfolioItems.forEach(item => {
      const id = item.closest('.portfolio-item').dataset.id;
      if (productData[id]) {
        item.textContent = productData[id].name[currentLang];
      }
    });
    
    // 更新持有文本
    const sharesTexts = document.querySelectorAll('.shares');
    sharesTexts.forEach(item => {
      const shares = item.textContent.split(': ')[1];
      item.textContent = `${translations[currentLang].shares}: ${shares}`;
    });
  }
  
  // 设置优先级并重新排序
  function togglePriority(button, listItem) {
    button.classList.toggle('active');
    
    // 如果按钮被激活，将项目移到列表顶部
    if (button.classList.contains('active')) {
      collectionList.prepend(listItem);
    } else {
      // 如果取消激活，将项目移到所有激活项目之后
      const activeItems = collectionList.querySelectorAll('li .priority-btn.active');
      if (activeItems.length > 0) {
        const lastActiveItem = activeItems[activeItems.length - 1].closest('li');
        lastActiveItem.after(listItem);
      }
    }
  }
  
  // 绘制K线图
  function drawKLineChart(productId) {
    const product = productData[productId];
    if (!product || !product.kLineData) return;
    
    // 移除占位符
    const placeholder = chartContainer.querySelector('.chart-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
    
    // 创建图表标题
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = `${product.name[currentLang]} 价格走势`;
    
    // 创建K线图容器
    const chartElement = document.createElement('div');
    chartElement.classList.add('k-line-chart');
    chartElement.style.height = '300px';
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
    
    // 清空并添加新内容
    const chartContent = document.createElement('div');
    chartContent.appendChild(chartTitle);
    chartContent.appendChild(chartElement);
    
    // 添加到图表容器
    chartContainer.querySelector('.chart-header').after(chartContent);
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
  
  // 语言切换按钮
  languageSwitch.addEventListener('click', switchLanguage);
  
  // 点击收藏项目
  collectionItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        const productId = item.querySelector('a').dataset.id;
        drawKLineChart(productId);
      }
    });
  });
  
  // 点击今日推荐项目
  document.querySelectorAll('#todays-picks-list li').forEach(item => {
    item.addEventListener('click', () => {
      const productId = item.querySelector('a').dataset.id;
      drawKLineChart(productId);
    });
  });
  
  // 点击投资组合项目
  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const productId = item.dataset.id;
      drawKLineChart(productId);
    });
  });
  
  closeModalBtn.addEventListener('click', closeProductModal);
  
  // 点击模态框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === productModal) {
      closeProductModal();
    }
  });
  
  // 搜索功能
  searchInput.addEventListener('input', () => {
    searchProducts(searchInput.value);
  });
  
  // 初始化今日推荐卡片
  initTodaysPicks();
  
  // 初始化今日推荐卡片
  function initTodaysPicks() {
    const container = document.getElementById('todays-picks');
    container.innerHTML = '';
    
    // 按涨幅排序
    const sortedProducts = Object.keys(productData).sort((a, b) => {
      const changeA = parseFloat(productData[a].change.replace('%', '').replace('+', ''));
      const changeB = parseFloat(productData[b].change.replace('%', '').replace('+', ''));
      return changeB - changeA;
    });
    
    // 创建卡片
    sortedProducts.forEach(id => {
      const product = productData[id];
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = id;
      
      card.innerHTML = `
        <div class="product-info">
          <h3>${product.name[currentLang]}</h3>
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
});