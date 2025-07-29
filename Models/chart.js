// 图表相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const chartContainer = document.getElementById('chart-container');
  
  // 模拟产品数据 - 将来从后端API获取
  const productData = {
    // ... 产品数据
  };
  
  // 生成K线图数据
  function generateKLineData(min, avg, max) {
    // ... 生成K线图数据的代码
  }
  
  // 绘制K线图函数 - 将来从后端API获取图表数据
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
    chartTitle.textContent = `${product.name['zh']} 价格走势`;
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
    // ... 绘制K线的代码
  }
  
  // 监听自定义事件，接收来自其他模块的绘制图表请求
  document.addEventListener('drawChart', (event) => {
    const { productId } = event.detail;
    drawKLineChart(productId);
  });
});