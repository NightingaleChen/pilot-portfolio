// 收藏功能相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const collectionList = document.getElementById('collection-list');
  const collectionItems = document.querySelectorAll('#collection-list li');
  const priorityButtons = document.querySelectorAll('.priority-btn');
  
  // 设置优先级并重新排序 - 将来与后端API交互保存优先级设置
  function togglePriority(button, listItem) {
    // 如果按钮已经激活，则取消激活
    if (button.classList.contains('active')) {
      button.classList.remove('active');
      button.innerHTML = '☆'; // 改为空心星星
      // 将项目移到列表底部
      collectionList.appendChild(listItem);
    } else {
      // 激活按钮
      button.classList.add('active');
      button.innerHTML = '★'; // 实心星星
      // 将项目移到列表顶部
      collectionList.prepend(listItem);
    }
  }
  
  // 添加事件监听器
  priorityButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      const listItem = button.closest('li');
      togglePriority(button, listItem);
    });
  });
  
  // 点击收藏项目 - 将来从后端API获取详细数据
  collectionItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        const productId = item.querySelector('a').dataset.id;
        // 使用自定义事件通知图表模块绘制图表
        const event = new CustomEvent('drawChart', { detail: { productId } });
        document.dispatchEvent(event);
      }
    });
  });
  
  // 添加收藏按钮点击事件
  const addCollectionBtn = document.getElementById('add-collection');
  if (addCollectionBtn) {
    addCollectionBtn.addEventListener('click', () => {
      alert('添加收藏功能即将上线！');
    });
  }
});