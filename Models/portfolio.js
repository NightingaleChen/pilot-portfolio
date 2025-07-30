// 投资组合相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  // 点击投资组合项目 - 将来从后端API获取详细数据
  portfolioItems.forEach(item => {
    if (!item.classList.contains('add-new-item')) {
      item.addEventListener('click', () => {
        const stock_name = getStockNameById(item.dataset.id); // 需要添加这个函数
        const event = new CustomEvent('drawChart', { detail: { stock_name } });
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