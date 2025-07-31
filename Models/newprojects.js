// 投资组合相关的JavaScript代码
document.addEventListener('DOMContentLoaded', () => {
  // 初始化投资组合
  initializePortfolio();
  
  // 设置添加新项目按钮事件
  setupAddNewItemButton();
});

// 初始化投资组合
async function initializePortfolio() {
  try {
    // 获取用户数据
    const userData = localStorage.getItem('userData');
    if (!userData) {
      console.error('用户未登录');
      return;
    }
    
    const user = JSON.parse(userData);
    const userId = user.id;
    
    // 从数据库获取用户投资组合
    const response = await fetch(`/api/trades/portfolio?userId=${userId}`);
    if (!response.ok) {
      throw new Error('获取投资组合失败');
    }
    
    const portfolioData = await response.json();
    
    // 渲染投资组合
    renderPortfolio(portfolioData);
    
  } catch (error) {
    console.error('初始化投资组合失败:', error);
    // 显示空的投资组合
    renderPortfolio([]);
  }
}

// 渲染投资组合
function renderPortfolio(portfolioData) {
  const portfolioGrid = document.getElementById('portfolio-grid');
  
  // 清空现有内容（保留添加按钮）
  const addButton = portfolioGrid.querySelector('.add-new-item');
  portfolioGrid.innerHTML = '';
  
  // 添加投资组合项目
  portfolioData.forEach((item, index) => {
    const portfolioItem = createPortfolioItem(item, index + 1);
    portfolioGrid.appendChild(portfolioItem);
  });
  
  // 重新添加添加按钮
  portfolioGrid.appendChild(addButton);
  
  // 为投资组合项目添加点击事件
  addPortfolioItemEvents();
}

// 创建投资组合项目元素
function createPortfolioItem(item, id) {
  const div = document.createElement('div');
  div.className = 'portfolio-item';
  div.dataset.id = id;
  div.dataset.stockName = item.stock_name;
  
  // 计算分配比例（这里需要总投资组合价值）
  const allocation = '0%'; // 暂时设为0%，需要计算总价值后更新
  
  // 格式化变化
  const changeClass = item.change_percent >= 0 ? 'positive' : 'negative';
  const changeSign = item.change_percent >= 0 ? '+' : '';
  
  div.innerHTML = `
    <div class="portfolio-header">
      <h3>${item.stock_name}</h3>
      <span class="allocation">${allocation}</span>
    </div>
    <div class="portfolio-details">
      <p class="shares">Holdings: ${item.shares} shares</p>
      <p class="value">$${item.value.toFixed(2)}</p>
      <p class="change ${changeClass}">${changeSign}$${item.change_amount.toFixed(2)} (${changeSign}${item.change_percent.toFixed(1)}%)</p>
    </div>
  `;
  
  return div;
}

// 为投资组合项目添加事件
function addPortfolioItemEvents() {
  const portfolioItems = document.querySelectorAll('.portfolio-item:not(.add-new-item)');
  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const stockName = item.dataset.stockName;
      const event = new CustomEvent('drawChart', { detail: { stock_name: stockName } });
      document.dispatchEvent(event);
    });
  });
}

// 设置添加新项目按钮
function setupAddNewItemButton() {
  const addNewItemButton = document.querySelector('.add-new-item');
  if (addNewItemButton) {
    addNewItemButton.addEventListener('click', () => {
      showAddItemOverlay();
    });
  }
}

// 显示添加项目浮窗
function showAddItemOverlay() {
  // 创建浮窗（如果不存在）
  let overlay = document.getElementById('add-item-overlay');
  if (!overlay) {
    overlay = createAddItemOverlay();
    document.body.appendChild(overlay);
  }
  
  // 显示浮窗
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.classList.add('show');
  }, 10);
  
  // 加载股票列表
  loadStockList();
  
  // 设置事件监听器
  setupOverlayEvents();
}


// 创建添加项目浮窗
function createAddItemOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'add-item-overlay';
  overlay.className = 'add-item-overlay';
  
  overlay.innerHTML = `
    <div class="add-item-container">
      <div class="add-item-header">
        <h3>Add New Investment</h3>
        <button class="close-add-item-btn">&times;</button>
      </div>
      <div class="add-item-content">
        <div class="stock-search-section">
          <select id="stock-dropdown" class="form-control">
            <option value="" disabled selected>Select a stock</option>
            <!-- 股票选项将通过 JavaScript 动态添加 -->
          </select>
        </div>
        <div class="trade-section" id="trade-section" style="display: none;">
          <div class="selected-stock-info" id="selected-stock-info">
            <!-- Selected stock info will be displayed here -->
          </div>
          <div class="trade-form">
            <div class="form-group">
              <label for="trade-type">Action:</label>
              <select id="trade-type" class="form-control">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div class="form-group">
              <label for="quantity">Quantity:</label>
              <input type="number" id="quantity" class="form-control" min="1" placeholder="Enter quantity">
            </div>
            <div class="form-group">
              <label for="total-cost">Total Cost:</label>
              <input type="text" id="total-cost" class="form-control" readonly>
            </div>
            <div class="form-actions">
              <button id="confirm-trade" class="btn btn-primary">Confirm Trade</button>
              <button id="cancel-trade" class="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return overlay;
}

// 设置浮窗事件监听器
function setupOverlayEvents() {
  const overlay = document.getElementById('add-item-overlay');
  const closeBtn = overlay.querySelector('.close-add-item-btn');
  const cancelBtn = overlay.querySelector('#cancel-trade');
  const confirmBtn = overlay.querySelector('#confirm-trade');
  const stockDropdown = overlay.querySelector('#stock-dropdown');
  const quantityInput = overlay.querySelector('#quantity');
  
  // 关闭按钮
  closeBtn.addEventListener('click', hideAddItemOverlay);
  cancelBtn.addEventListener('click', hideAddItemOverlay);
  
  // 点击外部关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      hideAddItemOverlay();
    }
  });
  
  // 下拉菜单选择
  stockDropdown.addEventListener('change', (e) => {
    const selectedStockName = e.target.value;
    if (selectedStockName) {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const stockData = {
        name: selectedStockName, // 使用 name 而不是 source_name
        displayName: selectedOption.text
      };
      selectStock(stockData);
      
      // 选择后自动关闭下拉菜单
      stockDropdown.blur();
    }
  });
  
  // 数量变化时计算总成本
  quantityInput.addEventListener('input', calculateTotalCost);
  
  // 确认交易
  confirmBtn.addEventListener('click', confirmTrade);
}

// 加载股票列表
async function loadStockList() {
  try {
    const response = await fetch('/api/stocks/list');
    if (!response.ok) {
      throw new Error('获取股票列表失败');
    }
    
    const data = await response.json();
    // 提取 stocks 数组
    const stocks = data.stocks;
    
    if (Array.isArray(stocks)) {
      // 只填充下拉菜单，不再显示股票列表
      populateStockDropdown(stocks);
    } else {
      console.error('返回的股票数据格式不正确:', data);
    }
    
  } catch (error) {
    console.error('加载股票列表失败:', error);
  }
}

// 填充股票下拉菜单
function populateStockDropdown(stocks) {
  const stockDropdown = document.getElementById('stock-dropdown');
  stockDropdown.innerHTML = '<option value="" disabled selected>Select a stock</option>';
  
  stocks.forEach(stock => {
    const option = document.createElement('option');
    option.value = stock.name; // 使用 name 而不是 source_name
    option.textContent = stock.displayName;
    stockDropdown.appendChild(option);
  });
}

// 选择股票
async function selectStock(stock) {
  try {
    // 确保 stock.name 或 stock.source_name 存在
    const stockName = stock.name || stock.source_name;
    
    if (!stockName) {
      console.error('股票名称未定义:', stock);
      return;
    }
    
    // 获取股票详细信息
    const response = await fetch(`/api/stocks/details?stock_name=${stockName}`);
    if (!response.ok) {
      throw new Error('获取股票详情失败');
    }
    
    const stockDetails = await response.json();
    
    // 更新选中状态
    document.querySelectorAll('.stock-item').forEach(item => {
      item.classList.remove('selected');
      if (item.dataset.stockName === stockName) {
        item.classList.add('selected');
      }
    });
    
    // 更新下拉菜单选中值
    const stockDropdown = document.getElementById('stock-dropdown');
    stockDropdown.value = stockName;
    
    // 显示股票信息
    displaySelectedStock(stockDetails);
    
    // 显示交易区域
    document.getElementById('trade-section').style.display = 'block';
    
  } catch (error) {
    console.error('选择股票失败:', error);
  }
}

// 显示选中的股票信息
function displaySelectedStock(stockDetails) {
  const stockInfo = document.getElementById('selected-stock-info');
  
  // 从 change 字段中提取百分比数值
  const changeText = stockDetails.change || '0%';
  const changeValue = parseFloat(changeText.replace('%', ''));
  const changeClass = changeValue >= 0 ? 'positive' : 'negative';
  
  stockInfo.innerHTML = `
    <h4>${stockDetails.name}</h4>
    <p>Current Price: $${stockDetails.price}</p>
    <p class="${changeClass}">Change: ${stockDetails.change}</p>
  `;
  
  // 存储当前股票信息
  stockInfo.dataset.stockName = stockDetails.name;
  stockInfo.dataset.currentPrice = stockDetails.price;
}

// 隐藏添加项目浮窗
function hideAddItemOverlay() {
  const overlay = document.getElementById('add-item-overlay');
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.style.display = 'none';
    // 重置表单
    resetTradeForm();
  }, 300);
}

// 显示股票列表
function displayStockList(stocks) {
  const stockList = document.getElementById('stock-list');
  stockList.innerHTML = '';
  
  stocks.forEach(stock => {
    const stockItem = document.createElement('div');
    stockItem.className = 'stock-item';
    stockItem.dataset.stockName = stock.source_name;
    
    stockItem.innerHTML = `
      <div class="stock-name">${stock.displayName}</div>
      <div class="stock-price">Click to select</div>
    `;
    
    stockItem.addEventListener('click', () => selectStock(stock));
    stockList.appendChild(stockItem);
  });
}

// 过滤股票列表
function filterStockList(searchTerm) {
  const stockItems = document.querySelectorAll('.stock-item');
  const term = searchTerm.toLowerCase();
  
  stockItems.forEach(item => {
    const stockName = item.querySelector('.stock-name').textContent.toLowerCase();
    if (stockName.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// 计算总成本
function calculateTotalCost() {
  const quantity = parseInt(document.getElementById('quantity').value) || 0;
  const stockInfo = document.getElementById('selected-stock-info');
  const currentPrice = parseFloat(stockInfo.dataset.currentPrice) || 0;
  
  const totalCost = quantity * currentPrice;
  document.getElementById('total-cost').value = `$${totalCost.toFixed(2)}`;
}

// 确认交易
async function confirmTrade() {
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      alert('用户未登录');
      return;
    }
    
    const user = JSON.parse(userData);
    const stockInfo = document.getElementById('selected-stock-info');
    const tradeType = document.getElementById('trade-type').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // 添加更严格的验证
    if (!user.id) {
      alert('用户ID无效，请重新登录');
      console.error('用户数据:', user);
      return;
    }
    
    if (!stockInfo.dataset.stockName) {
      alert('请先选择股票');
      return;
    }
    
    if (!quantity || quantity <= 0) {
      alert('请输入有效的数量');
      return;
    }
    
    if (!tradeType || !['buy', 'sell'].includes(tradeType)) {
      alert('请选择有效的交易类型');
      return;
    }
    
    const tradeData = {
      user_id: user.id,
      source_name: stockInfo.dataset.stockName,
      action: tradeType,
      quantity: quantity
    };
    
    // 添加调试日志
    console.log('用户数据:', user);
    console.log('发送的交易数据:', tradeData);
    
    // 验证所有参数都不是 undefined
    if (Object.values(tradeData).some(value => value === undefined)) {
      console.error('发现undefined参数:', tradeData);
      alert('数据验证失败，请检查所有字段');
      return;
    }
    
    const response = await fetch('/api/trades/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradeData)
    });
    
    console.log('交易请求状态:', response.status, response.statusText);
    
    if (!response.ok) {
      try {
        // 先获取原始响应文本
        const responseText = await response.text();
        console.log('服务器原始响应:', responseText);
        
        try {
          // 尝试将文本解析为JSON
          const error = JSON.parse(responseText);
          console.log('解析后的JSON错误:', error);
          throw new Error(error.message || '交易失败');
        } catch (parseError) {
          console.error('JSON解析错误:', parseError);
          // 如果响应不是有效的 JSON
          throw new Error('服务器返回了非预期的响应格式: ' + responseText.substring(0, 100));
        }
      } catch (jsonError) {
        console.error('处理响应时出错:', jsonError);
        // 如果响应不是有效的 JSON
        throw new Error('服务器返回了非预期的响应格式');
      }
    }
    
    const result = await response.json();
    alert('交易成功！');
    
    // 在交易成功后添加
    if (result.balance) {
    // 更新页面上的余额显示
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
    balanceElement.textContent = `$${result.balance.current.toFixed(2)}`;
    }
    
    // 显示余额变化信息
    const changeAmount = Math.abs(result.balance.change);
    const changeType = result.balance.change > 0 ? '增加' : '减少';
    alert(`交易成功！余额${changeType} $${changeAmount.toFixed(2)}，当前余额: $${result.balance.current.toFixed(2)}`);
    }
    
    // 关闭浮窗
    hideAddItemOverlay();
    
    // 刷新投资组合
    initializePortfolio();
    
  } catch (error) {
    console.error('交易过程中出错:', error);
    alert('交易失败: ' + error.message);
  }
}

// 重置交易表单
function resetTradeForm() {
  document.getElementById('stock-search').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('total-cost').value = '';
  document.getElementById('trade-section').style.display = 'none';
  
  // 清除选中状态
  document.querySelectorAll('.stock-item').forEach(item => {
    item.classList.remove('selected');
  });
}