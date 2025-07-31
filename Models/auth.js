// Authentication related JavaScript code
// Add a global variable to track current logged-in user ID
let currentLoggedInUserId = null;

// Make the variable available globally
window.currentLoggedInUserId = currentLoggedInUserId;

document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const loginOverlay = document.getElementById('login-overlay');
  const appContainer = document.getElementById('app-container');
  const loginButton = document.getElementById('login-button');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const logoutLink = document.getElementById('logout-link');
  const userBalance = document.getElementById('user-balance');
  const userTotalAssets = document.getElementById('user-total-assets');
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar');
  
  // 退出相关元素
  const quitButton = document.getElementById('quit-button');
  const logoutConfirmOverlay = document.getElementById('logout-confirm-overlay');
  const logoutConfirmYes = document.getElementById('logout-confirm-yes');
  const logoutConfirmNo = document.getElementById('logout-confirm-no');
  
  // 检查是否已登录
  const checkLoginStatus = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      // 已登录，显示应用界面
      const user = JSON.parse(userData);
      // 设置当前登录的用户ID
      currentLoggedInUserId = user.id || user.username;
      window.currentLoggedInUserId = currentLoggedInUserId;
      displayUserInfo(user);
      loginOverlay.style.display = 'none';
      appContainer.style.display = 'flex';
      
      // 刷新余额以确保显示最新数据
      if (user.id) {
        refreshUserBalance(user.id);
      }
    } else {
      // 未登录，显示登录界面
      currentLoggedInUserId = null;
      window.currentLoggedInUserId = null;
      loginOverlay.style.display = 'flex';
      appContainer.style.display = 'none';
    }
  };
  
  // 显示用户信息的函数
  const displayUserInfo = (user) => {
    // Use masked values for security in the top bar
    userBalance.textContent = `*****`;
    userTotalAssets.textContent = `*****`;
    userName.textContent = `${user.firstname} ${user.lastname}`;
    userAvatar.src = user.avatar || 'path/to/default/avatar.png';
    
    // 确保应用容器可见
    document.body.classList.add('logged-in');
    
    // 添加点击刷新余额的功能
    if (userBalance && user.id) {
      userBalance.style.cursor = 'pointer';
      userBalance.title = 'Click to refresh balance';
      userBalance.onclick = () => refreshUserBalance(user.id);
    }
    
    if (userTotalAssets && user.id) {
      userTotalAssets.style.cursor = 'pointer';
      userTotalAssets.title = 'Click to refresh total assets';
      userTotalAssets.onclick = () => refreshUserBalance(user.id);
    }
  };

  // 刷新用户余额的函数
  const refreshUserBalance = async (userId) => {
    try {
      const response = await fetch(`/api/auth/user/${userId}/balance`);
      if (!response.ok) {
        throw new Error('Failed to refresh balance');
      }
      
      const balanceData = await response.json();
      
      // Keep top bar display masked for security
      userBalance.textContent = `*****`;
      userTotalAssets.textContent = `*****`;
      
      // Update localStorage if user data exists
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        user.balance = balanceData.balance; // Keep masked value for consistency
        user.totalAssets = balanceData.totalAssets; // Keep masked value for consistency
        user.cash = balanceData.cash; // Keep real cash value for calculations
        localStorage.setItem('userData', JSON.stringify(user));
      }
      
      return balanceData;
    } catch (error) {
      console.error('Error refreshing user balance:', error);
      return null;
    }
  };

  // 暴露刷新余额函数给全局作用域
  window.refreshUserBalance = refreshUserBalance;
  
  // 登录处理
  const handleLogin = async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // 简单验证
    if (!username || !password) {
      loginError.textContent = 'Please enter both username and password.';
      return;
    }
    
    try {
      // 发送登录请求 - 让服务器验证用户名和密码
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid username or password.');
      }
      
      const userData = await response.json();
      
      // 保存用户数据到本地存储
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // 设置当前登录的用户ID
      currentLoggedInUserId = userData.id || username;
      window.currentLoggedInUserId = currentLoggedInUserId;
      
      // 显示用户信息
      displayUserInfo(userData);
      
      // 隐藏登录界面，显示应用界面
      loginOverlay.style.display = 'none';
      appContainer.style.display = 'flex';
      
      // 触发一个自定义事件，通知应用用户已登录
      const loginEvent = new CustomEvent('userLoggedIn', { detail: userData });
      document.dispatchEvent(loginEvent);
      
      // 清空登录表单
      usernameInput.value = '';
      passwordInput.value = '';
      loginError.textContent = '';
      
      // 设置定期刷新余额（每30秒刷新一次）
      if (userData.id) {
        setInterval(() => {
          refreshUserBalance(userData.id);
        }, 30000);
      }
      
      // 使用ComponentLoader加载组件，而不是刷新页面
      if (typeof ComponentLoader !== 'undefined') {
        ComponentLoader.loadAllComponents();
      } else {
        // 如果ComponentLoader不可用，则手动加载组件
        loadComponents();
      }
      
    } catch (error) {
      loginError.textContent = error.message;
    }
  };
  
  // 手动加载组件的函数
  function loadComponents() {
    const components = [
      {
        container: 'collection-container',
        htmlPath: '/collection.html'  // 修改这里，去掉/Views前缀
      },
      {
        container: 'recommendation-container',
        htmlPath: '/recommendation.html'  // 修改这里，去掉/Views前缀
      },
      {
        container: 'portfolio-container',
        htmlPath: '/portfolio.html'  // 修改这里，去掉/Views前缀
      },
      {
        container: 'chart-container-wrapper',
        htmlPath: '/chart.html'  // 修改这里，去掉/Views前缀
      }
    ];
    
    components.forEach(component => {
      const container = document.getElementById(component.container);
      if (container) {
        fetch(component.htmlPath)
          .then(response => response.text())
          .then(html => {
            container.innerHTML = html;
          })
          .catch(error => {
            console.error(`加载组件 ${component.htmlPath} 失败:`, error);
          });
      }
    });
  }
  
  // 显示退出确认浮窗
  const showLogoutConfirm = () => {
    logoutConfirmOverlay.style.display = 'flex';
  };
  
  // 隐藏退出确认浮窗
  const hideLogoutConfirm = () => {
    logoutConfirmOverlay.style.display = 'none';
  };
  
  // 登出处理
  const handleLogout = () => {
    // 清除本地存储的用户数据
    localStorage.removeItem('userData');
    
    // 重置当前登录的用户ID
    currentLoggedInUserId = null;
    window.currentLoggedInUserId = null;
    
    // 移除logged-in类
    document.body.classList.remove('logged-in');
    
    // 显示登录界面，隐藏应用界面
    loginOverlay.style.display = 'flex';
    appContainer.style.display = 'none';
    
    // 隐藏退出确认浮窗
    hideLogoutConfirm();
  };
  
  // 添加事件监听器
  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
  }
  
  if (logoutLink) {
    logoutLink.addEventListener('click', showLogoutConfirm);
  }
  
  // 添加退出按钮事件监听器
  if (quitButton) {
    quitButton.addEventListener('click', showLogoutConfirm);
  }
  
  // 添加确认退出按钮事件监听器
  if (logoutConfirmYes) {
    logoutConfirmYes.addEventListener('click', handleLogout);
  }
  
  // 添加取消退出按钮事件监听器
  if (logoutConfirmNo) {
    logoutConfirmNo.addEventListener('click', hideLogoutConfirm);
  }
  
  // 初始化检查登录状态
  checkLoginStatus();
});