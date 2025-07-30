const Login = (req, res) => {
  // 简单的模拟登录逻辑
  const { username, password } = req.body;
  
  // 这里应该有真实的用户验证逻辑
  // 为了演示，我们使用硬编码的用户信息
  if (username && password) {
    // 返回模拟的用户数据
    return res.json({
      id: 1,
      username: username,
      firstname: "Alice",
      lastname: "Smith",
      balance: "10,000.00",
      totalAssets: "25,350.75",
      avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
    });
  }
  
  return res.status(401).json({ error: "用户名或密码不正确" });
};

const GetUserInfo = (req, res) => {
  // 获取用户信息的逻辑
  res.json({ message: "用户信息API" });
};

module.exports = {
  Login,
  GetUserInfo
};