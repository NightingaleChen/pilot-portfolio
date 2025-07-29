// 推荐功能相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const recommendationItems = document.querySelectorAll('#todays-picks-list li');
  
  // 模拟产品数据 - 将来从后端API获取
  const productData = {
    1: {
      name: {
        zh: '特斯拉 (TSLA)',
        en: 'Tesla (TSLA)'
      },
      price: '$248.50',
      change: '+5.2%',
      // ... 其他数据
    },
    // ... 其他产品
  };
  
  // 点击推荐项目 - 将来从后端API获取详细数据
  recommendationItems.forEach(item => {
    item.addEventListener('click', () => {
      const productId = item.querySelector('a').dataset.id;
      // 使用自定义事件通知图表模块绘制图表
      const event = new CustomEvent('drawChart', { detail: { productId } });
      document.dispatchEvent(event);
    });
  });
  
  // 初始化今日推荐卡片 - 将来从后端API获取推荐数据
  function initTodaysPicks() {
    const container = document.getElementById('todays-picks');
    if (!container) return;
    
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
          <h3>${product.name['zh']}</h3>
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
        // 使用自定义事件通知图表模块绘制图表
        const event = new CustomEvent('drawChart', { detail: { productId: id } });
        document.dispatchEvent(event);
      });
      
      container.appendChild(card);
    });
  }
  
  // 初始化推荐卡片
  initTodaysPicks();
});