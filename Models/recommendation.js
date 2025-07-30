// 推荐功能相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const recommendationItems = document.querySelectorAll('#todays-picks-list li');
  
  // 点击推荐项目 - 将来从后端API获取详细数据
  recommendationItems.forEach(item => {
    item.addEventListener('click', () => {
      const productId = item.querySelector('a').dataset.id;
      // 使用自定义事件通知图表模块绘制图表
      const event = new CustomEvent('drawChart', { detail: { productId } });
      document.dispatchEvent(event);
    });
  });
  
  // 注意：不要在这里定义或调用initTodaysPicks函数，它已在main.js中定义
});