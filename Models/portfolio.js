// 投资组合相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  // 点击投资组合项目 - 将来从后端API获取详细数据
  portfolioItems.forEach(item => {
    if (!item.classList.contains('add-new-item')) {
      item.addEventListener('click', () => {
        const productId = item.dataset.id;
        // 使用自定义事件通知图表模块绘制图表
        const event = new CustomEvent('drawChart', { detail: { productId } });
        document.dispatchEvent(event);
      });
    }
  });
  
  // 添加新项目按钮点击事件 - 将来与后端API交互添加新项目
  const addNewItemButton = document.querySelector('.add-new-item');
  if (addNewItemButton) {
    addNewItemButton.addEventListener('click', () => {
      // 这里可以添加打开添加新项目表单或对话框的逻辑
      alert('添加新项目功能即将上线！');
    });
  }
  
  // 刷新投资组合按钮点击事件
  const refreshPortfolioBtn = document.getElementById('refresh-portfolio');
  if (refreshPortfolioBtn) {
    refreshPortfolioBtn.addEventListener('click', () => {
      alert('刷新投资组合功能即将上线！');
    });
  }
});