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
      })
      .catch(error => {
        console.error('加载组件时出错:', error);
      });
  }

  // 加载单个组件
  function loadComponent(component) {
    return new Promise((resolve, reject) => {
      fetch(component.htmlPath)
        .then(response => response.text())
        .then(html => {
          const container = document.getElementById(component.container);
          if (container) {
            container.innerHTML = html;
            
            // 动态加载JS
            const script = document.createElement('script');
            script.src = component.jsPath;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`无法加载脚本: ${component.jsPath}`));
            document.body.appendChild(script);
          } else {
            reject(new Error(`找不到容器: ${component.container}`));
          }
        })
        .catch(error => {
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