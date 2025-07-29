// 组件加载管理器
const ComponentLoader = (() => {
  // 组件配置
  const components = [
    {
      container: 'collection-container',
      htmlPath: '/collection.html', // 去掉 /Views 前缀
      jsPath: '/Models/collection.js'
    },
    {
      container: 'recommendation-container',
      htmlPath: '/recommendation_chart.html',  // 去掉/Views前缀
      jsPath: '/Models/recommendation.js'
    },
    {
      container: 'portfolio-container',
      htmlPath: '/portfolio.html',  // 去掉/Views前缀
      jsPath: '/Models/portfolio.js'
    },
    {
      container: 'chart-container-wrapper',
      htmlPath: '/chart.html',  // 去掉/Views前缀
      jsPath: '/Models/chart.js'
    }
  ];

  // 加载所有组件
  function loadAllComponents() {
    const promises = components.map(component => loadComponent(component));
    
    Promise.all(promises)
      .then(() => {
        // 触发组件加载完成事件
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
        console.log('所有组件加载完成');
      })
      .catch(error => {
        console.error('加载组件时出错:', error);
        // 尝试重新加载失败的组件
        setTimeout(() => {
          console.log('尝试重新加载组件...');
          loadAllComponents();
        }, 2000);
      });
  }

  // 加载单个组件
  function loadComponent(component) {
    return new Promise((resolve, reject) => {
      // 检查容器是否存在
      const container = document.getElementById(component.container);
      if (!container) {
        console.error(`找不到容器: ${component.container}`);
        return reject(new Error(`找不到容器: ${component.container}`));
      }
      
      // 添加加载状态指示
      container.innerHTML = '<div class="loading-component">加载中...</div>';
      
      fetch(component.htmlPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
          }
          return response.text();
        })
        .then(html => {
          container.innerHTML = html;
          
          // 检查是否已经加载过此JS
          const scriptId = `script-${component.container}`;
          let script = document.getElementById(scriptId);
          
          if (script) {
            // 如果已存在，则移除旧脚本
            script.parentNode.removeChild(script);
          }
          
          // 动态加载JS
          script = document.createElement('script');
          script.id = scriptId;
          script.src = component.jsPath;
          script.onload = () => {
            console.log(`组件 ${component.container} 加载完成`);
            resolve();
          };
          script.onerror = (e) => {
            console.error(`无法加载脚本: ${component.jsPath}`, e);
            reject(new Error(`无法加载脚本: ${component.jsPath}`));
          };
          document.body.appendChild(script);
        })
        .catch(error => {
          console.error(`加载组件 ${component.htmlPath} 失败:`, error);
          container.innerHTML = `<div class="error-component">加载失败: ${error.message}</div>`;
          reject(error);
        });
    });
  }

  // 公开API
  return {
    loadAllComponents,
    loadComponent
  };
})();

// 如果使用ES模块，则导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLoader;
} else if (typeof exports !== 'undefined') {
  exports.ComponentLoader = ComponentLoader;
}
// 删除 export default ComponentLoader; 这一行