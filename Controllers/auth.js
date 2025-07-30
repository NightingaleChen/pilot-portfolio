const Login = (req, res) => {
  // Simple mock login logic
  const { username, password } = req.body;
  
  // There should be real user authentication logic here
  // For demonstration purposes, we use hardcoded user information
  if (username && password) {
    // Return mock user data
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
  
  return res.status(401).json({ error: "Incorrect username or password" });
};

const GetUserInfo = (req, res) => {
  // Logic to get user information
  res.json({ message: "User Info API" });
};

module.exports = {
  Login,
  GetUserInfo
};