// 收藏功能相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 等待组件加载完成
  function initializeCollection() {
    const collectionList = document.getElementById('collection-list');
    const addCollectionBtn = document.getElementById('add-collection');
    
    
    if (!collectionList || !addCollectionBtn) {
      // 如果元素还不存在，等待100毫秒后再次尝试
      setTimeout(initializeCollection, 100);
      return;
    }
    
    // 从登录系统获取用户ID
    function getUserId() {
      // 首先检查全局变量
      if (window.currentLoggedInUserId) {
        console.log("Using global user ID:", window.currentLoggedInUserId);
        return window.currentLoggedInUserId;
      }
      
      // 如果全局变量不存在，从localStorage获取
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.id || user.username;
        console.log("Using localStorage user ID:", userId, "from user data:", user);
        return userId;
      }
      
      // 如果都没有，返回null
      console.error('No logged in user found');
      return null;
    }
    
    const userId = getUserId();
    
    // 如果没有用户ID，显示未登录状态
    if (!userId) {
      collectionList.innerHTML = '<li class="error-message">Please log in to view favorites</li>';
      return;
    }
    
    // 获取用户收藏列表
    function fetchCollections() {
      const userId = getUserId();
      if (!userId) {
        collectionList.innerHTML = '<li class="error-message">Please log in to view favorites</li>';
        return;
      }
      
      console.log("collection list start - fetching for user ID:", userId);
      fetch(`/api/collect/get-with-prices?user_id=${userId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to get favorites');
          }
          return response.json();
        })
        .then(data => {
          displayCollections(data.collections);
        })
        .catch(error => {
          console.error('Error:', error);
          collectionList.innerHTML = `<li class="error-message">Loading failed: ${error.message}</li>`;
        });
    }
    
        // 显示收藏列表
    function displayCollections(collections) {
      if (!collections || collections.length === 0) {
        collectionList.innerHTML = '<li>No favorites yet</li>';
        return;
      }
      
      collectionList.innerHTML = '';
      collections.forEach(collection => {
        // 使用通用的价格变化格式化函数
        const changeInfo = formatPriceChange(collection.price_change);
        
        // 格式化价格，保留两位小数
        const formattedPrice = collection.close_price ? collection.close_price.toFixed(2) : 'N/A';
        
        const listItem = document.createElement('li');
        listItem.className = 'collection-item';
        
        listItem.innerHTML = `
          <a href="#" data-name="${collection.stock_name}">
            <div class="stock-info">
              <span class="stock-name">${collection.stock_name}</span>
              <div class="price-info">
                <span class="close-price">$${formattedPrice}</span>
                <span class="change ${changeInfo.className}">${changeInfo.formatted}</span>
              </div>
            </div>
          </a>
          <div class="item-actions">
            <button class="priority-btn">☆</button>
            <button class="delete-btn" data-name="${collection.stock_name}">×</button>
          </div>
        `;
        collectionList.appendChild(listItem);
      });
      
      // 添加事件监听器
      addEventListeners();
    }
    
    // 删除收藏
    function deleteCollection(stockName) {
      const userId = getUserId();
      if (!userId) {
        alert('Please log in to delete favorites');
        return;
      }
      
      console.log("Deleting collection for user ID:", userId, "stock:", stockName);
      fetch('/api/collect/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          stock_name: stockName
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete favorite');
        }
        return response.text();
      })
      .then(() => {
        // 重新获取收藏列表
        fetchCollections();
      })
      .catch(error => {
        console.error('Error:', error);
        alert(`Failed to delete favorite: ${error.message}`);
      });
    }
    
    // 获取可添加的股票列表
    function fetchAvailableStocks() {
      const userId = getUserId();
      if (!userId) {
        alert('Please log in to add favorites');
        return;
      }
      
      console.log("Fetching available stocks for user ID:", userId);
      fetch(`/api/collect/stocks-with-prices?user_id=${userId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to get stock list');
          }
          return response.json();
        })
        .then(data => {
          showAddStockDialog(data.stocks);
        })
        .catch(error => {
          console.error('Error:', error);
          alert(`Failed to get stock list: ${error.message}`);
        });
    }
    
    // 格式化价格变化百分比的通用函数
    function formatPriceChange(priceChange) {
      if (priceChange === null || priceChange === undefined) {
        return { formatted: 'N/A', className: '' };
      }
      
      const priceChangePercent = (priceChange * 100).toFixed(2);
      const isPositive = priceChangePercent > 0;
      const formatted = isPositive ? `+${priceChangePercent}%` : `${priceChangePercent}%`;
      const className = isPositive ? 'positive' : 'negative';
      
      return { formatted, className };
    }

    // 显示添加股票对话框
    function showAddStockDialog(stocks) {
      // 显示添加股票对话框
      console.log("collection add start");
      const oldDialog = document.getElementById('add-stock-dialog');
      if (oldDialog) {
        oldDialog.remove();
      }
      
      // 创建对话框
      const dialog = document.createElement('div');
      dialog.id = 'add-stock-dialog';
      dialog.className = 'dialog';
      
      let dialogContent = `
        <div class="dialog-header">
          <h3>Add to Favorites</h3>
          <button id="close-dialog">×</button>
        </div>
        <div class="dialog-content">
      `;
      
      if (!stocks || stocks.length === 0) {
        dialogContent += '<p>No stocks available to add</p>';
      } else {
        dialogContent += '<div class="selection-info">Please select stocks to add.</div>';
        dialogContent += '<ul class="stock-list">';
        stocks.forEach(stock => {
          // 格式化价格和变化百分比
          const priceDisplay = stock.close_price ? `$${stock.close_price.toFixed(2)}` : 'N/A';
          const changeInfo = formatPriceChange(stock.price_change);
          
          dialogContent += `<li data-name="${stock.name}">
            <label class="stock-item">
              <input type="checkbox" class="stock-checkbox" data-name="${stock.name}">
              <span class="stock-name">${stock.displayName}</span>
              <span class="stock-price">${priceDisplay}</span>
              <span class="stock-change ${changeInfo.className}">${changeInfo.formatted}</span>
            </label>
          </li>`;
        });
        dialogContent += '</ul>';
      }
      
      dialogContent += `
        </div>
        <div class="dialog-footer">
          <button id="cancel-selection" class="btn">Cancel</button>
          <button id="confirm-selection" class="btn primary">Add</button>
        </div>
      `;
      
      dialog.innerHTML = dialogContent;
      
      // 添加到页面
      document.body.appendChild(dialog);
      
      // 添加关闭按钮事件监听器
      document.getElementById('close-dialog').addEventListener('click', () => {
        dialog.remove();
      });
      
      // 添加取消按钮事件监听器
      document.getElementById('cancel-selection').addEventListener('click', () => {
        dialog.remove();
      });
      
      // 添加确认按钮事件监听器
      document.getElementById('confirm-selection').addEventListener('click', () => {
        const currentUserId = getUserId();
        if (!currentUserId) {
          alert('Please log in to add favorites');
          return;
        }
        
        console.log("Adding collection for user ID:", currentUserId);
        const selectedCheckboxes = dialog.querySelectorAll('.stock-checkbox:checked');
        const selectedStocks = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.name);
        
        if (selectedStocks.length === 0) {
          alert('Please select at least one stock');
          return;
        }
        
        // 添加所有选中的股票
        const addPromises = selectedStocks.map(stockName => {
          return new Promise((resolve, reject) => {
            fetch('/api/collect/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: currentUserId,
                stock_name: stockName
              })
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to add ${stockName}`);
              }
              return response.text();
            })
            .then(() => resolve())
            .catch(error => reject(error));
          });
        });
        
        // 等待所有添加操作完成
        Promise.all(addPromises)
          .then(() => {
            // 重新获取收藏列表
            fetchCollections();
            dialog.remove();
          })
          .catch(error => {
            console.error('Error:', error);
            alert(`Failed to add to favorites: ${error.message}`);
          });
      });
      
      // 添加股票项点击事件（整行点击切换复选框状态）
      const stockItems = dialog.querySelectorAll('.stock-item');
      stockItems.forEach(item => {
        item.addEventListener('click', (e) => {
          // 防止复选框的点击事件被触发两次
          if (e.target.tagName !== 'INPUT') {
            const checkbox = item.querySelector('.stock-checkbox');
            checkbox.checked = !checkbox.checked;
          }
        });
      });
    }
    
    // 添加事件监听器
    // 添加事件监听器
    function addEventListeners() {
      // 先移除旧的事件监听器
      collectionList.removeEventListener('click', collectionClickHandler);
      
      // 添加新的事件监听器
      collectionList.addEventListener('click', collectionClickHandler);
    }
    
    // 收藏列表点击事件处理函数
    function collectionClickHandler(e) {
      // 处理优先级按钮点击
      if (e.target.classList.contains('priority-btn') || e.target.closest('.priority-btn')) {
        e.stopPropagation();
        const button = e.target.classList.contains('priority-btn') ? e.target : e.target.closest('.priority-btn');
        const listItem = button.closest('li');
        
        // 如果按钮已经激活，则取消激活
        if (button.classList.contains('active')) {
          button.classList.remove('active');
          button.innerHTML = '☆';
          // 将项目移到列表底部
          collectionList.appendChild(listItem);
        } else {
          // 激活按钮
          button.classList.add('active');
          button.innerHTML = '★';
          // 将项目移到列表顶部
          collectionList.prepend(listItem);
        }
      }
      
      // 处理删除按钮点击
      else if (e.target.classList.contains('delete-btn')) {
        e.stopPropagation();
        const stockName = e.target.dataset.name;
        if (confirm(`Are you sure you want to delete ${stockName}?`)) {
          deleteCollection(stockName);
        }
      }
      
      // 处理股票项目点击
      else if (e.target.tagName === 'A' || e.target.closest('a')) {
        e.preventDefault();
        const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
        const stock_name = link.dataset.name;
        // 使用自定义事件通知图表模块绘制图表
        const event = new CustomEvent('drawChart', { detail: { stock_name } });
        document.dispatchEvent(event);
      }
    }
    
    // 添加收藏按钮点击事件
    if (addCollectionBtn) {
      addCollectionBtn.addEventListener('click', () => {
        fetchAvailableStocks();
      });
    }
    
    // 初始加载收藏列表
    fetchCollections();
  }
  
  // 监听用户登录事件，刷新收藏列表
  document.addEventListener('userLoggedIn', () => {
    // 等待一下确保DOM元素已加载
    setTimeout(() => {
      initializeCollection();
    }, 100);
  });
  
  // 开始初始化过程
  initializeCollection();
});