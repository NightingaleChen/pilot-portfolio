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
    
    // 默认用户ID - 实际应用中应该从登录系统获取
    const userId = 1; // 假设用户ID为1
    
    // 获取用户收藏列表
    function fetchCollections() {
      console.log("collection list start");
      fetch(`/api/collect/get?user_id=${userId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('获取收藏失败');
          }
          return response.json();
        })
        .then(data => {
          displayCollections(data.stock_names);
        })
        .catch(error => {
          console.error('Error:', error);
          collectionList.innerHTML = `<li class="error-message">加载失败: ${error.message}</li>`;
        });
    }
    
    // 显示收藏列表
    function displayCollections(stockNames) {
      if (!stockNames || stockNames.length === 0) {
        collectionList.innerHTML = '<li class="empty-message">暂无收藏</li>';
        return;
      }
      
      collectionList.innerHTML = '';
      stockNames.forEach(stockName => {
        const listItem = document.createElement('li');
        listItem.className = 'collection-item';
        listItem.innerHTML = `
          <a href="#" data-name="${stockName}">${stockName}</a>
          <div class="item-actions">
            <button class="priority-btn">☆</button>
            <button class="delete-btn" data-name="${stockName}">×</button>
          </div>
        `;
        collectionList.appendChild(listItem);
      });
      
      // 添加事件监听器
      addEventListeners();
    }
    
    // 添加收藏
    // function addCollection(stockName) {
    //   fetch('/api/collect/add', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       user_id: userId,
    //       stock_name: stockName
    //     })
    //   })
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('添加收藏失败');
    //     }
    //     return response.text();
    //   })
    //   .then(() => {
    //     // 重新获取收藏列表
    //     fetchCollections();
    //   })
    //   .catch(error => {
    //     console.error('Error:', error);
    //     alert(`添加收藏失败: ${error.message}`);
    //   });
    // }
    
    // 删除收藏
    function deleteCollection(stockName) {
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
          throw new Error('删除收藏失败');
        }
        return response.text();
      })
      .then(() => {
        // 重新获取收藏列表
        fetchCollections();
      })
      .catch(error => {
        console.error('Error:', error);
        alert(`删除收藏失败: ${error.message}`);
      });
    }
    
    // 获取可添加的股票列表
    function fetchAvailableStocks() {
      fetch(`/api/collect/stocks?user_id=${userId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('获取股票列表失败');
          }
          return response.json();
        })
        .then(data => {
          showAddStockDialog(data.stocks);
        })
        .catch(error => {
          console.error('Error:', error);
          alert(`获取股票列表失败: ${error.message}`);
        });
    }
    
    // 显示添加股票对话框
    function showAddStockDialog(stocks) {
      // 移除旧对话框（如果存在）
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
          <h3>添加收藏</h3>
          <button id="close-dialog">×</button>
        </div>
        <div class="dialog-content">
      `;
      
      if (!stocks || stocks.length === 0) {
        dialogContent += '<p>没有可添加的股票</p>';
      } else {
        dialogContent += '<div class="selection-info">请选择要添加的股票（可多选）</div>';
        dialogContent += '<ul class="stock-list">';
        stocks.forEach(stock => {
          dialogContent += `<li data-name="${stock.name}">
            <label class="stock-item">
              <input type="checkbox" class="stock-checkbox" data-name="${stock.name}">
              <span>${stock.displayName}</span>
            </label>
          </li>`;
        });
        dialogContent += '</ul>';
      }
      
      dialogContent += `
        </div>
        <div class="dialog-footer">
          <button id="cancel-selection" class="btn">取消</button>
          <button id="confirm-selection" class="btn primary">确认添加</button>
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
        const selectedCheckboxes = dialog.querySelectorAll('.stock-checkbox:checked');
        const selectedStocks = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.name);
        
        if (selectedStocks.length === 0) {
          alert('请至少选择一个股票');
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
                user_id: userId,
                stock_name: stockName
              })
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`添加 ${stockName} 失败`);
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
            alert(`添加收藏失败: ${error.message}`);
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
    function addEventListeners() {
      // 优先级按钮点击事件
      const priorityButtons = document.querySelectorAll('.priority-btn');
      priorityButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const listItem = button.closest('li');
          
          // 如果按钮已经激活，则取消激活
          if (button.classList.contains('active')) {
            button.classList.remove('active');
            button.innerHTML = '<span style="color: white; font-weight: bold; font-size: 1.2em">☆</span>'; // 改为白色粗体空心星星
            // 将项目移到列表底部
            collectionList.appendChild(listItem);
          } else {
            // 激活按钮
            button.classList.add('active');
            button.innerHTML = '★'; // 实心星星
            // 将项目移到列表顶部
            collectionList.prepend(listItem);
          }
        });
      });
      
      // 删除按钮点击事件
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const stockName = button.dataset.name;
          if (confirm(`确定要删除 ${stockName} 吗？`)) {
            deleteCollection(stockName);
          }
        });
      });
      
      // 股票项目点击事件
      const stockItems = document.querySelectorAll('.collection-item a');
      stockItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const stockName = item.dataset.name;
          // 使用自定义事件通知图表模块绘制图表
          const event = new CustomEvent('drawChart', { detail: { stockName } });
          document.dispatchEvent(event);
        });
      });
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
  
  // 开始初始化过程
  initializeCollection();
});