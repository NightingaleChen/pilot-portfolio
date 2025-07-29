// 数据服务模块 - 集中管理数据获取和共享
const DataService = (() => {
  // 私有变量
  let productData = {};
  
  // 初始化数据
  function initData() {
    // 模拟产品数据 - 将来从后端API获取
    productData = {
      1: {
        name: {
          zh: '苹果 (AAPL)',
          en: 'Apple (AAPL)'
        },
        price: '$189.84',
        change: '+3.5%',
        // ... 其他数据
      },
      // ... 其他产品
    };
  }
  
  // 获取所有产品数据
  function getAllProducts() {
    return productData;
  }
  
  // 获取单个产品数据
  function getProduct(id) {
    return productData[id];
  }
  
  // 生成K线图数据
  function generateKLineData(min, avg, max) {
    // ... 生成K线图数据的代码
  }
  
  // 初始化
  initData();
  
  // 公开API
  return {
    getAllProducts,
    getProduct,
    generateKLineData
  };
})();

// 如果使用ES模块
export default DataService;