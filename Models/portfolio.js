// 投资组合相关的JavaScript代码
function initializePortfolio() {
  loadPortfolioData();
}

// 检查文档是否已经加载完成
if (document.readyState === 'loading') {
  // 文档仍在加载中，添加事件监听器
  document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
  // 文档已经加载完成，直接执行
  initializePortfolio();
}

// 加载投资组合数据
async function loadPortfolioData() {
  const userId = 1; // 默认用户ID为1
  const portfolioGrid = document.getElementById('portfolio-grid');
  
  try {
    // 显示加载状态
    portfolioGrid.innerHTML = '<div class="loading-message">Loading...</div>';
    
    // 获取用户持有的所有股票代码
    const symbolsResponse = await fetch(`/api/data/users/${userId}/stocks`);
    if (!symbolsResponse.ok) {
      throw new Error(`HTTP error! status: ${symbolsResponse.status}`);
    }
    const symbols = await symbolsResponse.json();
    
    // 清空现有内容
    portfolioGrid.innerHTML = '';
    
    // 为每个股票代码创建portfolio-item
    for (const symbol of symbols) {
      // 获取股票持有数量
      const quantityResponse = await fetch(`/api/data/users/${userId}/stocks/${symbol}/quantity`);
      if (!quantityResponse.ok) {
        throw new Error(`HTTP error! status: ${quantityResponse.status}`);
      }
      const quantityData = await quantityResponse.json();
      const quantity = quantityData.quantity;
      
      // 获取股票总市值
      const valueResponse = await fetch(`/api/data/users/${userId}/stocks/${symbol}/value`);
      if (!valueResponse.ok) {
        throw new Error(`HTTP error! status: ${valueResponse.status}`);
      }
      const valueData = await valueResponse.json();
      const value = valueData.value;
      
      // 获取股票收益
      const profitResponse = await fetch(`/api/data/users/${userId}/stocks/${symbol}/profit`);
      if (!profitResponse.ok) {
        throw new Error(`HTTP error! status: ${profitResponse.status}`);
      }
      const profitData = await profitResponse.json();
      const profit = profitData.profit;
      
      // 创建portfolio-item元素
      const portfolioItem = document.createElement('div');
      portfolioItem.className = 'portfolio-item';
      portfolioItem.dataset.symbol = symbol;
      
      // 计算百分比变化
      const percentageChange = value !== 0 ? Math.abs((profit / value) * 100).toFixed(2) : 0;
      const changeClass = profit >= 0 ? 'change positive' : 'change negative';
      const formattedProfit = profit >= 0 ? `+$${Math.abs(profit).toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`;
      const formattedValue = `$${Math.abs(value).toFixed(2)}`;
      const formattedQuantity = `${quantity} shares`;
      
      portfolioItem.innerHTML = `
        <div class="portfolio-header">
          <h3>${symbol}</h3>
          <span class="allocation"></span>
        </div>
        <div class="portfolio-details">
          <p class="shares">Holdings: ${formattedQuantity}</p>
          <p class="value">${formattedValue}</p>
          <p class="${changeClass}">${formattedProfit} (${percentageChange}%)</p>
        </div>
      `;
      
      portfolioGrid.appendChild(portfolioItem);
    }
    
    // 添加"添加新产品"按钮
    const addNewItem = document.createElement('div');
    addNewItem.className = 'portfolio-item add-new-item';
    addNewItem.innerHTML = `
      <div class="add-icon">+</div>
      <div class="add-text">Add New Product</div>
    `;
    portfolioGrid.appendChild(addNewItem);
    
    // 添加事件监听器
    addNewItem.addEventListener('click', showPurchaseDialog);
    
    // 为每个股票项目添加点击事件，跳转到详情页面
    const portfolioItems = document.querySelectorAll('.portfolio-item:not(.add-new-item)');
    portfolioItems.forEach(item => {
      item.addEventListener('click', () => {
        const symbol = item.dataset.symbol;
        // 跳转到股票详情页面
        window.location.href = `stock_detail.html?symbol=${symbol}`;
      });
    });
    
  } catch (error) {
    console.error('获取投资组合数据失败:', error);
    portfolioGrid.innerHTML = '<div class="error-message">加载数据时出错，请稍后重试。</div>';
  }
}

// 显示购买对话框
// 显示购买对话框
async function showPurchaseDialog() {
  // 创建对话框元素
  const dialog = document.createElement('div');
  dialog.className = 'purchase-dialog';
  
  // 获取所有可用股票
  try {
    // 修改这里的API路径
    const response = await fetch('/api/stocks/list');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const stocks = data.stocks || [];
    
    // 创建对话框内容
    dialog.innerHTML = `
      <div class="purchase-dialog-content">
        <div class="purchase-dialog-header">
          <h3>Buy New Stock</h3>
          <button class="close-button">&times;</button>
        </div>
        <div class="purchase-dialog-body">
          <div class="form-group">
            <label for="stock-select">Select Stock:</label>
            <select id="stock-select">
              <option value="">-- Please Select --</option>
              ${stocks.map(stock => `<option value="${stock.name}">${stock.displayName || stock.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="stock-price">Current Price:</label>
            <input type="text" id="stock-price" readonly>
          </div>
          <div class="form-group">
            <label for="quantity">Purchase Quantity:</label>
            <input type="number" id="quantity" min="1" value="1">
          </div>
          <div class="form-group">
            <label for="total-amount">Total Amount:</label>
            <input type="text" id="total-amount" readonly>
          </div>
        </div>
        <div class="purchase-dialog-footer">
          <button class="cancel-button">Cancel</button>
          <button class="confirm-button">Confirm Purchase</button>
        </div>
      </div>
    `;
    
    // 添加对话框到页面
    document.body.appendChild(dialog);
    
    // 获取元素引用
    const closeButton = dialog.querySelector('.close-button');
    const cancelButton = dialog.querySelector('.cancel-button');
    const confirmButton = dialog.querySelector('.confirm-button');
    const stockSelect = dialog.querySelector('#stock-select');
    const priceInput = dialog.querySelector('#stock-price');
    const quantityInput = dialog.querySelector('#quantity');
    const totalInput = dialog.querySelector('#total-amount');
    
    // 添加关闭事件
    closeButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    // 添加股票选择变更事件
    stockSelect.addEventListener('change', async () => {
      const selectedStock = stockSelect.value;
      if (selectedStock) {
        try {
          // 获取股票详情
          const response = await fetch(`/api/stocks/details?stock_name=${selectedStock}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const stockDetails = await response.json();
          
          // 更新价格
          const price = parseFloat(stockDetails.price);
          priceInput.value = `$${price.toFixed(2)}`;
          
          // 更新总金额
          updateTotalAmount(price, parseInt(quantityInput.value, 10));
        } catch (error) {
          console.error('获取股票详情失败:', error);
          priceInput.value = '获取价格失败';
        }
      } else {
        priceInput.value = '';
        totalInput.value = '';
      }
    });
    
    // 添加数量变更事件
    quantityInput.addEventListener('input', () => {
      const price = priceInput.value ? parseFloat(priceInput.value.replace('$', '')) : 0;
      const quantity = parseInt(quantityInput.value, 10) || 0;
      updateTotalAmount(price, quantity);
    });
    
    // 添加确认购买事件
    confirmButton.addEventListener('click', async () => {
      const selectedStock = stockSelect.value;
      const quantity = parseInt(quantityInput.value, 10);
      const price = priceInput.value ? parseFloat(priceInput.value.replace('$', '')) : 0;
      
      if (!selectedStock) {
        alert('Please select a stock to purchase');
        return;
      }
      
      if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
      }
      
      try {
        // 获取股票ID
        console.log('Selected stock code:', selectedStock);
        const stockId = await getStockIdBySymbol(selectedStock);
        console.log('Retrieved stock ID:', stockId);
        
        if (!stockId) {
          throw new Error('Unable to get stock ID');
        }
        
        // 发送购买请求
        const response = await fetch('/api/trades/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: 1, // 默认用户ID为1
            stock_id: stockId,
            source_name: selectedStock,
            action: 'buy',
            price: price,
            quantity: quantity
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '购买失败');
        }
        
        const result = await response.json();
        
        // 显示成功消息
        alert('购买成功！');
        
        // 关闭对话框
        document.body.removeChild(dialog);
        
        // 刷新投资组合数据
        loadPortfolioData();
        
        // 刷新用户余额
        updateUserBalance(result.newCashBalance);
        
      } catch (error) {
        console.error('购买股票失败:', error);
        alert(`购买失败: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Failed to get stock list:', error);
    dialog.innerHTML = `
      <div class="purchase-dialog-content">
        <div class="purchase-dialog-header">
          <h3>Error</h3>
          <button class="close-button">&times;</button>
        </div>
        <div class="purchase-dialog-body">
          <p>Failed to get stock list. Please try again later.</p>
        </div>
        <div class="purchase-dialog-footer">
          <button class="cancel-button">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    
    // 添加关闭事件
    const closeButton = dialog.querySelector('.close-button');
    const cancelButton = dialog.querySelector('.cancel-button');
    
    closeButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }
}

// 更新总金额
function updateTotalAmount(price, quantity) {
  const totalAmount = price * quantity;
  const totalInput = document.querySelector('#total-amount');
  totalInput.value = `$${totalAmount.toFixed(2)}`;
}

// 更新用户余额
function updateUserBalance(newBalance) {
  // 获取用户余额元素
  const userBalanceElement = document.getElementById('user-balance');
  if (userBalanceElement) {
    userBalanceElement.textContent = `$${parseFloat(newBalance).toFixed(2)}`;
  }
  
  // 如果使用了localStorage存储用户数据，也更新localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (userData) {
    userData.cash = newBalance;
    localStorage.setItem('userData', JSON.stringify(userData));
  }
}

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

// 根据股票代码获取股票ID
async function getStockIdBySymbol(symbol) {
  try {
    // 从API获取股票ID
    const response = await fetch(`/api/stocks/id?stock_name=${encodeURIComponent(symbol)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.id.toString();
  } catch (error) {
    console.error('获取股票ID失败:', error);
    return null;
  }
}