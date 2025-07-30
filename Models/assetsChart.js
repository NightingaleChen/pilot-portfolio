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
      assetsChartOverlay.style.display = 'none';
    });
  }
  
  // 点击浮窗外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === assetsChartOverlay) {
      assetsChartOverlay.style.display = 'none';
    }
  });
  
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
          color: '#4CAF50'
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
        color: '#4CAF50'
      }
    ];
    
    // 添加持股数据
    const colors = ['#FFC107', '#2196F3', '#9C27B0', '#F44336', '#3F51B5', '#E91E63', '#00BCD4'];
    holdings.forEach((holding, index) => {
      pieData.push({
        name: holding.name,
        value: holding.value,
        color: colors[index % colors.length],
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
        borderColor: '#1E1E1E',
        borderWidth: 2,
        hoverBorderWidth: 0,
        hoverOffset: 15,
        borderRadius: 5,
        spacing: 5
      }]
    };
    
    // 创建饼图
    pieChart = new Chart(ctx, {
      type: 'doughnut', // 改为环形图，更美观
      data: chartData,
      options: {
        cutout: '60%', // 环形图中间空白的大小
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 20
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            boxPadding: 3,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage = (value / data.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
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
          const fontSize = (height / 200).toFixed(2);
          ctx.font = `${fontSize}em sans-serif`;
          ctx.textBaseline = 'middle';
          
          const totalValue = data.reduce((sum, item) => sum + item.value, 0);
          const text = `$${totalValue.toFixed(2)}`;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2;
          
          ctx.fillStyle = '#D4AF37'; // 金色文字
          ctx.fillText(text, textX, textY);
          
          const subText = 'Total Assets';
          const subTextX = Math.round((width - ctx.measureText(subText).width) / 2);
          const subTextY = height / 2 + 20;
          
          ctx.font = `${fontSize * 0.7}em sans-serif`;
          ctx.fillStyle = '#AAAAAA';
          ctx.fillText(subText, subTextX, subTextY);
          
          ctx.save();
        }
      }]
    });
  }
  
  // 生成资产列表
  function generateAssetsList(data) {
    assetsList.innerHTML = '';
    
    data.forEach(asset => {
      const assetItem = document.createElement('div');
      assetItem.className = 'asset-item';
      
      const assetName = document.createElement('div');
      assetName.className = 'asset-name';
      
      const assetColor = document.createElement('div');
      assetColor.className = 'asset-color';
      assetColor.style.backgroundColor = asset.color;
      
      const assetNameText = document.createElement('span');
      assetNameText.textContent = asset.name;
      
      assetName.appendChild(assetColor);
      assetName.appendChild(assetNameText);
      
      const assetDetails = document.createElement('div');
      assetDetails.className = 'asset-details';
      
      const assetValue = document.createElement('div');
      assetValue.className = 'asset-value';
      assetValue.textContent = `$${asset.value.toFixed(2)}`;
      
      assetDetails.appendChild(assetValue);
      
      // 如果有涨跌幅，添加涨跌幅信息
      if (asset.changePercent !== undefined) {
        const assetChange = document.createElement('div');
        assetChange.className = `asset-change ${asset.isPositive ? 'positive' : 'negative'}`;
        assetChange.textContent = `${asset.isPositive ? '+' : '-'}${asset.changePercent}%`;
        assetDetails.appendChild(assetChange);
      }
      
      assetItem.appendChild(assetName);
      assetItem.appendChild(assetDetails);
      
      assetsList.appendChild(assetItem);
    });
  }
});

// 添加基础调试信息
console.log('资产饼图初始化完成');