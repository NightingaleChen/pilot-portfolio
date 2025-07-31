const User = require('../Models/user');
const stockData = require('../Models/stockdata');

const Login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Authenticate user with database
    const user = await User.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ error: "Incorrect username or password" });
    }
    
    // Calculate total assets (cash + portfolio value)
    let totalAssets = user.cash || 0;
    
    try {
      // Get user's stock symbols
      const stockSymbols = await stockData.getStockSymbolsByUserId(user.id);
      
      // Calculate portfolio value (this is a simplified calculation)
      // In a real application, you'd get current market prices and multiply by holdings
      for (const symbol of stockSymbols) {
        const trades = await stockData.getUserStockTrades(user.id, symbol);
        const totalShares = trades.reduce((sum, trade) => sum + trade.quantity, 0);
        // For now, we'll use a placeholder value - in production, fetch current market price
        // totalAssets += totalShares * currentMarketPrice;
      }
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      // Continue with just cash balance if portfolio calculation fails
    }
    
    // Return user data with real cash balance
    return res.json({
      id: user.id,
      username: username,
      firstname: user.firstname,
      lastname: user.lastname,
      balance: "*******",
      totalAssets: "*******",
      cash: user.cash,
      email: user.email,
      phone_number: user.phone_number,
      avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: "Internal server error during login" });
  }
};

const GetUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Get user data from database
    const user = await User.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Calculate total assets
    let totalAssets = user.cash || 0;
    
    try {
      // Get user's stock symbols and calculate portfolio value
      const stockSymbols = await stockData.getStockSymbolsByUserId(user.id);
      
      // In a real application, you'd fetch current market prices here
      for (const symbol of stockSymbols) {
        const trades = await stockData.getUserStockTrades(user.id, symbol);
        const totalShares = trades.reduce((sum, trade) => sum + trade.quantity, 0);
        // Placeholder for market price calculation
        // totalAssets += totalShares * currentMarketPrice;
      }
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
    }
    
    return res.json({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      balance: "*******",
      totalAssets: "*******",
      cash: user.cash,
      email: user.email,
      phone_number: user.phone_number,
      avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
    });
    
  } catch (error) {
    console.error('GetUserInfo error:', error);
    return res.status(500).json({ error: "Internal server error while fetching user info" });
  }
};

const RefreshUserBalance = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Get current cash balance from database
    const cash = await User.getUserCash(userId);
    
    if (cash === null) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Calculate total assets
    let totalAssets = cash || 0;
    
    try {
      // Get user's stock symbols and calculate portfolio value
      const stockSymbols = await stockData.getStockSymbolsByUserId(userId);
      
      // In a real application, you'd fetch current market prices here
      for (const symbol of stockSymbols) {
        const trades = await stockData.getUserStockTrades(userId, symbol);
        const totalShares = trades.reduce((sum, trade) => sum + trade.quantity, 0);
        // Placeholder for market price calculation
        // totalAssets += totalShares * currentMarketPrice;
      }
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
    }
    
    return res.json({
      balance: "*******",
      totalAssets: "*******",
      cash: cash
    });
    
  } catch (error) {
    console.error('RefreshUserBalance error:', error);
    return res.status(500).json({ error: "Internal server error while refreshing balance" });
  }
};

module.exports = {
  Login,
  GetUserInfo,
  RefreshUserBalance
};