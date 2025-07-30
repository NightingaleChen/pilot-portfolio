// 资产饼图相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const assetsButton = document.getElementById('assets-button');
  const assetsChartOverlay = document.getElementById('assets-chart-overlay');
  const closeAssetsChartBtn = document.querySelector('.close-assets-chart-btn');
  const summaryTotalAssets = document.getElementById('summary-total-assets');
  const summaryBalance = document.getElementById('summary-balance');
  const assetsList = document.getElementById('assets-list');
  const userTotalAssets = document.getElementById('user-total-assets');
  
  // 饼图实例
  let pieChart = null;
  
  // 点击资产按钮显示浮窗
  if (assetsButton) {
    assetsButton.addEventListener('click', () => {
      showAssetsChart();
    });
  }
  
  // 关闭浮窗
  if (closeAssetsChartBtn) {
    closeAssetsChartBtn.addEventListener('click', () => {
      closeAssetsChart();
    });
  }
  
  // 点击浮窗外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === assetsChartOverlay) {
      closeAssetsChart();
    }
  });
  
  // 关闭资产图表浮窗
  function closeAssetsChart() {
    assetsChartOverlay.style.display = 'none';
    
    // 重置状态
    const assetsChartMain = document.querySelector('.assets-chart-main');
    const assetsListSection = document.querySelector('.assets-list-section');
    
    if (assetsChartMain) {
      assetsChartMain.classList.remove('collapsed');
    }
    if (assetsListSection) {
      assetsListSection.classList.remove('expanded');
    }
  }
  
  // 显示资产饼图
  function showAssetsChart() {
    // 获取用户数据
    const userData = localStorage.getItem('userData');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const balance = parseFloat(user.balance.replace(/[^0-9.-]+/g, ''));
    
    // 获取投资组合数据
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const holdings = [];
    let totalStockValue = 0;
    
    console.log('找到投资组合项目数量:', portfolioItems.length);
    
    // 检查是否有投资组合项目
    if (portfolioItems.length === 0 || portfolioItems.length === 1 && portfolioItems[0].classList.contains('add-new-item')) {
      console.log('未找到有效的投资组合项目');
      // 即使没有投资组合项目，也至少显示现金余额
      const pieData = [
        {
          name: 'Cash Balance',
          value: balance,
          color: '#34C759' // 使用现代化的绿色
        }
      ];
      
      // 更新所有资产相关显示
      const formattedBalance = `$${balance.toFixed(2)}`;
      [summaryTotalAssets, summaryBalance, userTotalAssets].forEach(element => {
        if (element) element.textContent = formattedBalance;
      });
      
      // 更新用户数据
      user.totalAssets = balance.toFixed(2);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // 绘制饼图
      drawPieChart(pieData);
      
      // 生成资产列表
      generateAssetsList(pieData);
      
      // 显示浮窗
      assetsChartOverlay.style.display = 'flex';
      return;
    }
    
    portfolioItems.forEach(item => {
      if (!item.classList.contains('add-new-item')) {
        try {
          const id = item.dataset.id;
          const name = item.querySelector('h3').textContent;
          const sharesText = item.querySelector('.shares').textContent;
          const valueText = item.querySelector('.value').textContent;
          const changeText = item.querySelector('.change').textContent;
          
          // 提取数字
          const shares = parseInt(sharesText.match(/\d+/)[0]);
          const value = parseFloat(valueText.replace(/[^0-9.-]+/g, ''));
          const changeMatch = changeText.match(/\(([^)]+)\)/);
          const changePercent = changeMatch ? parseFloat(changeMatch[1]) : 0;
          const isPositive = changeText.includes('+');
          
          // 累加股票总价值
          totalStockValue += value;
          
          holdings.push({
            id,
            name,
            shares,
            value,
            changePercent,
            isPositive
          });
        } catch (error) {
          console.error('处理投资组合项目时出错:', error);
        }
      }
    });
    
    // 计算真实总资产 = 现金余额 + 所有股票价值
    const totalAssets = balance + totalStockValue;
    
    // 更新摘要信息
    summaryTotalAssets.textContent = `$${totalAssets.toFixed(2)}`;
    summaryBalance.textContent = `$${balance.toFixed(2)}`;
    
    // 更新用户数据中的总资产
    user.totalAssets = totalAssets.toFixed(2);
    localStorage.setItem('userData', JSON.stringify(user));
    
    // 更新页面上显示的总资产
    if (userTotalAssets) {
      userTotalAssets.textContent = `$${totalAssets.toFixed(2)}`;
    }
    
    // 生成饼图数据
    const pieData = [
      {
        name: 'Cash Balance',
        value: balance,
        color: '#34C759' // 更现代的绿色
      }
    ];
    
    // 添加持股数据 - 使用更现代的配色方案
    const modernColors = [
      '#007AFF', // 系统蓝色
      '#FF9500', // 系统橙色
      '#AF52DE', // 系统紫色
      '#FF3B30', // 系统红色
      '#5856D6', // 系统靛蓝色
      '#FF2D92', // 系统粉色
      '#00C7BE', // 系统青色
      '#30D158'  // 系统薄荷绿
    ];
    holdings.forEach((holding, index) => {
      pieData.push({
        name: holding.name,
        value: holding.value,
        color: modernColors[index % modernColors.length],
        changePercent: holding.changePercent,
        isPositive: holding.isPositive
      });
    });
    
    // 绘制饼图
    drawPieChart(pieData);
    
    // 生成资产列表
    generateAssetsList(pieData);
    
    // 显示浮窗
    assetsChartOverlay.style.display = 'flex';
    
    // 添加滚动监听器
    setTimeout(() => {
      setupScrollBehavior();
    }, 100);
  }
  
  // 设置滚动行为
  function setupScrollBehavior() {
    const assetsListElement = document.getElementById('assets-list');
    const assetsChartMain = document.querySelector('.assets-chart-main');
    const assetsListSection = document.querySelector('.assets-list-section');
    
    if (!assetsListElement || !assetsChartMain || !assetsListSection) return;
    
    let scrollTimeout;
    let isExpanded = false;
    
    assetsListElement.addEventListener('scroll', () => {
      const scrollTop = assetsListElement.scrollTop;
      const scrollHeight = assetsListElement.scrollHeight;
      const clientHeight = assetsListElement.clientHeight;
      const scrollThreshold = 30; // Pixels to scroll before triggering
      const maxScroll = scrollHeight - clientHeight;
      
      // Clear any existing timeout
      clearTimeout(scrollTimeout);
      
      // Calculate scroll progress (0 to 1)
      const scrollProgress = Math.min(scrollTop / Math.max(scrollThreshold, 1), 1);
      
      // Determine if we should expand or collapse
      const shouldExpand = scrollTop > scrollThreshold;
      
      if (shouldExpand && !isExpanded) {
        // Scrolling down - collapse top section and expand list
        assetsChartMain.classList.add('collapsed');
        assetsListSection.classList.add('expanded');
        isExpanded = true;
      } else if (!shouldExpand && isExpanded) {
        // At top or scrolling up - restore original state
        assetsChartMain.classList.remove('collapsed');
        assetsListSection.classList.remove('expanded');
        isExpanded = false;
      }
      
      // Update chart on scroll end to maintain responsiveness
      scrollTimeout = setTimeout(() => {
        if (pieChart) {
          pieChart.resize();
        }
      }, 100);
    });
    
    // Also handle mouse wheel for smoother experience
    assetsListElement.addEventListener('wheel', (e) => {
      // Allow natural scrolling behavior
      e.stopPropagation();
    }, { passive: true });
  }
  
  // 绘制饼图
  function drawPieChart(data) {
    const ctx = document.getElementById('assets-pie-chart').getContext('2d');
    
    // 如果已经有饼图实例，销毁它
    if (pieChart) {
      pieChart.destroy();
    }
    
    // 准备Chart.js数据
    const chartData = {
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderWidth: 0, // Remove border for clean look
        hoverBorderWidth: 0,
        hoverOffset: 20, // 增大悬停偏移
        borderRadius: 8, // 增大圆角
        spacing: 3,
        hoverBackgroundColor: data.map(item => {
          // 悬停时略微变亮
          const hex = item.color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          return `rgba(${r}, ${g}, ${b}, 0.9)`;
        })
      }]
    };
    
    // 创建饼图
    pieChart = new Chart(ctx, {
      type: 'doughnut', // 改为环形图，更美观
      data: chartData,
      options: {
        cutout: '70%', // 增大环形图中间空白，更现代
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 30
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1200,
          easing: 'easeInOutCubic'
        },
        interaction: {
          intersect: false,
          mode: 'nearest'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(18, 18, 18, 0.95)',
            titleColor: '#fff',
            bodyColor: '#e0e0e0',
            borderColor: '#333',
            borderWidth: 1,
            titleFont: {
              size: 15,
              weight: '600',
              family: 'system-ui, -apple-system, sans-serif'
            },
            bodyFont: {
              size: 14,
              family: 'system-ui, -apple-system, sans-serif'
            },
            padding: 16,
            cornerRadius: 12,
            displayColors: true,
            boxWidth: 12,
            boxHeight: 12,
            boxPadding: 6,
            usePointStyle: true,
            caretSize: 8,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = context.raw || 0;
                const percentage = (value / data.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1);
                return `$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${percentage}%)`;
              }
            }
          }
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: function(chart) {
          const width = chart.width;
          const height = chart.height;
          const ctx = chart.ctx;
          
          ctx.restore();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const totalValue = data.reduce((sum, item) => sum + item.value, 0);
          const centerX = width / 2;
          const centerY = height / 2;
          
          // 主要数值 - 更大更醒目
          const mainFontSize = Math.min(width, height) / 12;
          ctx.font = `600 ${mainFontSize}px 'SF Pro Display', system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          const text = `$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
          ctx.fillText(text, centerX, centerY - 10);
          
          // 副标题 - 更精致的样式
          const subFontSize = Math.min(width, height) / 25;
          ctx.font = `400 ${subFontSize}px 'SF Pro Display', system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = '#8E8E93';
          const subText = 'Total Assets';
          ctx.fillText(subText, centerX, centerY + 25);
          
          // 添加微妙的阴影效果
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 1;
          
          ctx.save();
        }
      }]
    });
  }
  
  // 生成资产列表 - 更现代的设计，不包含现金余额
  function generateAssetsList(data) {
    assetsList.innerHTML = '';
    
    // 过滤掉现金余额，只显示股票投资
    const stockData = data.filter(asset => asset.name !== 'Cash Balance');
    
    // 如果没有股票投资，显示提示信息
    if (stockData.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-portfolio-message';
      emptyMessage.innerHTML = `
        <div class="empty-icon">📊</div>
        <div class="empty-text">No stock investments yet</div>
        <div class="empty-subtext">Start building your portfolio to see detailed breakdown here</div>
      `;
      assetsList.appendChild(emptyMessage);
      return;
    }
    
    // 计算股票总价值用于百分比计算
    const totalStockValue = stockData.reduce((sum, item) => sum + item.value, 0);
    
    stockData.forEach((asset, index) => {
      const assetItem = document.createElement('div');
      assetItem.className = 'asset-item';
      assetItem.style.animationDelay = `${index * 0.1}s`; // 添加渐入动画延迟
      
      const assetLeft = document.createElement('div');
      assetLeft.className = 'asset-left';
      
      const assetColor = document.createElement('div');
      assetColor.className = 'asset-color';
      assetColor.style.backgroundColor = asset.color;
      assetColor.style.boxShadow = `0 0 0 2px ${asset.color}20`; // 添加光晕效果
      
      const assetInfo = document.createElement('div');
      assetInfo.className = 'asset-info';
      
      const assetNameText = document.createElement('div');
      assetNameText.className = 'asset-name-text';
      assetNameText.textContent = asset.name;
      
      const assetPercentage = document.createElement('div');
      assetPercentage.className = 'asset-percentage';
      const percentage = ((asset.value / totalStockValue) * 100).toFixed(1);
      assetPercentage.textContent = `${percentage}% of stocks`;
      
      assetInfo.appendChild(assetNameText);
      assetInfo.appendChild(assetPercentage);
      
      assetLeft.appendChild(assetColor);
      assetLeft.appendChild(assetInfo);
      
      const assetRight = document.createElement('div');
      assetRight.className = 'asset-right';
      
      const assetValue = document.createElement('div');
      assetValue.className = 'asset-value';
      assetValue.textContent = `$${asset.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      
      assetRight.appendChild(assetValue);
      
      // 如果有涨跌幅，添加涨跌幅信息
      if (asset.changePercent !== undefined) {
        const assetChange = document.createElement('div');
        assetChange.className = `asset-change ${asset.isPositive ? 'positive' : 'negative'}`;
        assetChange.innerHTML = `
          <span class="change-icon">${asset.isPositive ? '▲' : '▼'}</span>
          ${Math.abs(asset.changePercent)}%
        `;
        assetRight.appendChild(assetChange);
      }
      
      assetItem.appendChild(assetLeft);
      assetItem.appendChild(assetRight);
      
      assetsList.appendChild(assetItem);
    });
  }
});

// 添加基础调试信息
console.log('资产饼图初始化完成');