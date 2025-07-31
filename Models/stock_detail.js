// Get stock name by symbol
function getStockNameBySymbol(symbol) {
    const nameMap = {
        'AAPL': 'Apple Inc. (AAPL)',
        'apple': 'Apple Inc. (AAPL)',
        'TSLA': 'Tesla, Inc. (TSLA)',
        'tesla': 'Tesla, Inc. (TSLA)',
        'MSFT': 'Microsoft Corporation (MSFT)', 
        'microsoft': 'Microsoft Corporation (MSFT)',
        'NVDA': 'NVIDIA Corporation (NVDA)',
        'nvidia': 'NVIDIA Corporation (NVDA)',
        'GOOG': 'Alphabet Inc. (GOOG)',
        'google': 'Alphabet Inc. (GOOG)',
        'AMZN': 'Amazon.com, Inc. (AMZN)',
        'amazon': 'Amazon.com, Inc. (AMZN)',
        'META': 'Meta Platforms, Inc. (META)',
        'facebook': 'Meta Platforms, Inc. (META)',
        'BABA': 'Alibaba Group (BABA)',
        'BIDU': 'Baidu, Inc. (BIDU)',
        'TCEHY': 'Tencent Holdings (TCEHY)',
        'TSM': 'Taiwan Semiconductor (TSM)'
    };
    return nameMap[symbol] || nameMap[symbol.toLowerCase()] || `${symbol} Corporation (${symbol})`;
}

// Get company information by symbol
function getCompanyInfo(symbol) {
    const companyMap = {
        'AAPL': { sector: 'Technology', industry: 'Consumer Electronics', pe: '28.5', eps: '6.05' },
        'TSLA': { sector: 'Automotive', industry: 'Electric Vehicles', pe: '65.2', eps: '3.62' },
        'MSFT': { sector: 'Technology', industry: 'Software', pe: '31.8', eps: '9.05' },
        'NVDA': { sector: 'Technology', industry: 'Semiconductors', pe: '73.4', eps: '4.28' },
        'GOOG': { sector: 'Technology', industry: 'Internet Services', pe: '25.6', eps: '5.61' },
        'AMZN': { sector: 'Technology', industry: 'E-commerce', pe: '52.3', eps: '2.90' }
    };
    return companyMap[symbol] || { sector: 'Technology', industry: 'Various', pe: '--', eps: '--' };
}

// Get stock information from URL parameters
function getStockInfoFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id'),
        symbol: urlParams.get('symbol')
    };
}

// Get current stock price
async function getCurrentPrice(symbol) {
    try {
        const response = await fetch(`/api/data/stocks/${symbol}/current`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch stock price:', error);
        return null;
    }
}

// Get holding amount for a stock
async function getHoldingAmount(symbol) {
    try {
        // Modified API call path using correct user ID and endpoint
        const response = await fetch(`/api/data/users/1/stocks/${symbol}/quantity`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch holding amount:', error);
        return null;
    }
}

// Get 30-day historical stock data
async function getHistory30Data(symbol) {
    try {
        const response = await fetch(`/api/data/stocks/${symbol}/history30`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch historical data:', error);
        return null;
    }
}

// Get stock symbol by ID
function getStockSymbolById(id) {
    const symbolMap = {
        '1': 'AAPL',
        '2': 'TSLA',
        '3': 'MSFT',
        '4': 'NVDA'
    };
    
    return symbolMap[id] || 'AAPL';
}

// Format currency value
function formatCurrency(value) {
    if (value === null || value === undefined) return '$0.00';
    return '$' + parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format percentage value
function formatPercentage(value) {
    if (value === null || value === undefined) return '0.00%';
    return parseFloat(value).toFixed(2) + '%';
}

// Update market status
function updateMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();
    
    // Market hours: Monday-Friday 9:30 AM - 4:00 PM EST
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = (hour === 9 && minute >= 30) || (hour >= 10 && hour < 16) || (hour === 16 && minute === 0);
    
    const statusElement = document.getElementById('market-status');
    
    if (statusElement) {
        if (isWeekday && isMarketHours) {
            statusElement.textContent = 'Market Open';
            statusElement.className = 'market-status open';
        } else {
            statusElement.textContent = 'Market Closed';
            statusElement.className = 'market-status';
        }
    }
}

// Initialize page
async function initPage() {
    const stockInfo = getStockInfoFromURL();
    const stockId = stockInfo.id;
    const stockSymbol = stockInfo.symbol || getStockSymbolById(stockId);
    
    // Use the same simple naming convention as investment cards (just the symbol/source_name)
    const stockName = stockSymbol.charAt(0).toUpperCase() + stockSymbol.slice(1);
    
    // Update page title information
    document.getElementById('stock-name').textContent = stockName;
    document.getElementById('stock-symbol').textContent = 'Symbol: ' + stockSymbol;
    
    // Update market status
    updateMarketStatus();
    
    console.log('Fetching stock data:', { stockId, stockSymbol, stockName });
    
    // Get and update current price and holding amount together
    const priceData = await getCurrentPrice(stockSymbol);
    const amountData = await getHoldingAmount(stockSymbol);
    
    console.log('Price data:', priceData);
    console.log('Holding amount data:', amountData);
    
    let currentPrice = 0;
    let shares = 0;
    let totalValue = 0;
    
    if (priceData && priceData.price) {
        currentPrice = priceData.price;
    }
    
    if (amountData && amountData.quantity !== undefined) {
        shares = amountData.quantity;
        document.getElementById('holding-amount').textContent = shares + ' shares';
    } else {
        document.getElementById('holding-amount').textContent = '0 shares';
    }
    
    // Calculate total portfolio value (price * shares)
    totalValue = currentPrice * shares;
    document.getElementById('current-price').textContent = formatCurrency(totalValue);
    
    // Get real price change data if available, otherwise show no change
    let changeAmount = 0;
    let changePercentage = 0;
    
    // Try to get previous day data for real price change calculation
    try {
        const historyResponse = await fetch(`/api/data/stocks/${stockSymbol}/history30`);
        const historyData = await historyResponse.json();
        
        if (historyData && historyData.data && historyData.data.length >= 2) {
            // Get the two most recent data points
            const sortedData = historyData.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            const currentData = sortedData[0];
            const previousData = sortedData[1];
            
            if (currentData && previousData) {
                const currentClose = parseFloat(currentData.close);
                const previousClose = parseFloat(previousData.close);
                
                // Calculate change based on individual stock price, then multiply by shares
                const stockPriceChange = currentClose - previousClose;
                changeAmount = stockPriceChange * shares;
                changePercentage = (stockPriceChange / previousClose) * 100;
                
                console.log('Real price change calculated:', {
                    currentClose,
                    previousClose,
                    stockPriceChange,
                    changeAmount,
                    changePercentage
                });
            }
        }
    } catch (error) {
        console.error('Failed to fetch price change data:', error);
        changeAmount = 0;
        changePercentage = 0;
    }
    
    // Update price change display
    const changeAmountEl = document.getElementById('change-amount');
    const changePercentageEl = document.getElementById('change-percentage');
    const changeIconEl = document.getElementById('change-icon');
    const priceChangeEl = document.getElementById('price-change');
    
    changeAmountEl.textContent = formatCurrency(Math.abs(changeAmount));
    changePercentageEl.textContent = `(${formatPercentage(Math.abs(changePercentage))})`;
    
    if (changeAmount >= 0) {
        priceChangeEl.className = 'price-change positive';
        changeIconEl.className = 'fas fa-arrow-up';
    } else {
        priceChangeEl.className = 'price-change negative';
        changeIconEl.className = 'fas fa-arrow-down';
    }
    
    // Get and update profit information
    try {
        const profitResponse = await fetch(`/api/data/users/1/stocks/${stockSymbol}/profit`);
        const profitData = await profitResponse.json();
        console.log('Profit data:', profitData);
        
        if (profitData && profitData.profit !== undefined) {
            const profit = profitData.profit;
            const profitText = profit >= 0 ? `+${formatCurrency(Math.abs(profit))}` : `-${formatCurrency(Math.abs(profit))}`;
            const profitClass = 'value ' + (profit >= 0 ? 'positive' : 'negative');
            
            document.getElementById('current-profit').textContent = profitText;
            document.getElementById('current-profit').className = profitClass;
        } else {
            document.getElementById('current-profit').textContent = '$0.00';
            document.getElementById('current-profit').className = 'value positive';
        }
    } catch (error) {
        console.error('Failed to fetch profit data:', error);
        document.getElementById('current-profit').textContent = '$0.00';
        document.getElementById('current-profit').className = 'value positive';
    }
    
    // Update day range and volume based on real data if available
    try {
        const historyResponse = await fetch(`/api/data/stocks/${stockSymbol}/history30`);
        const historyData = await historyResponse.json();
        
        if (historyData && historyData.data && historyData.data.length > 0) {
            // Get today's data for day range
            const todayData = historyData.data[historyData.data.length - 1];
            if (todayData && todayData.high && todayData.low) {
                const dayLow = parseFloat(todayData.low) * shares;
                const dayHigh = parseFloat(todayData.high) * shares;
                document.getElementById('day-range').textContent = `${formatCurrency(dayLow)} - ${formatCurrency(dayHigh)}`;
            } else {
                // Fallback to calculated range based on current price
                const dayLow = totalValue * 0.98;
                const dayHigh = totalValue * 1.02;
                document.getElementById('day-range').textContent = `${formatCurrency(dayLow)} - ${formatCurrency(dayHigh)}`;
            }
            
            // Get volume from today's data if available
            if (todayData && todayData.volume) {
                document.getElementById('volume').textContent = parseInt(todayData.volume).toLocaleString();
            } else {
                // Fallback to simulated volume
                const simulatedVolume = Math.floor(Math.random() * shares * 0.1 + shares * 0.05);
                document.getElementById('volume').textContent = simulatedVolume.toLocaleString();
            }
        } else {
            // Fallback values if no data available
            if (totalValue > 0) {
                const dayLow = totalValue * 0.98;
                const dayHigh = totalValue * 1.02;
                document.getElementById('day-range').textContent = `${formatCurrency(dayLow)} - ${formatCurrency(dayHigh)}`;
                
                const simulatedVolume = Math.floor(Math.random() * shares * 0.1 + shares * 0.05);
                document.getElementById('volume').textContent = simulatedVolume.toLocaleString();
            } else {
                document.getElementById('day-range').textContent = '$0.00 - $0.00';
                document.getElementById('volume').textContent = '0';
            }
        }
    } catch (error) {
        console.error('Failed to fetch day range data:', error);
        // Fallback values
        if (totalValue > 0) {
            const dayLow = totalValue * 0.98;
            const dayHigh = totalValue * 1.02;
            document.getElementById('day-range').textContent = `${formatCurrency(dayLow)} - ${formatCurrency(dayHigh)}`;
            
            const simulatedVolume = Math.floor(Math.random() * shares * 0.1 + shares * 0.05);
            document.getElementById('volume').textContent = simulatedVolume.toLocaleString();
        } else {
            document.getElementById('day-range').textContent = '$0.00 - $0.00';
            document.getElementById('volume').textContent = '0';
        }
    }
    
    // Get and draw price chart
    const historyData = await getHistory30Data(stockSymbol);
    console.log('Historical data:', historyData);
    if (historyData && historyData.data && historyData.data.length > 0) {
        console.log('Using real data for chart, data points:', historyData.data.length);
        // Store data for resize use
        const canvas = document.getElementById('price-chart');
        canvas.setAttribute('data-has-real-data', 'true');
        canvas.setAttribute('data-chart-data', JSON.stringify(historyData.data));
        drawChart(historyData.data);
    } else {
        console.log('No historical data retrieved, using simulated chart');
        const canvas = document.getElementById('price-chart');
        canvas.removeAttribute('data-has-real-data');
        canvas.removeAttribute('data-chart-data');
        initChart(); // If fetch fails, use simulated chart
    }
    
    // Initialize chart controls
    initChartControls();
}

// Initialize chart control buttons
function initChartControls() {
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            timeButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Here you would typically fetch data for the selected time period
            const period = btn.getAttribute('data-period');
            console.log(`Switching to ${period} view`);
            // For now, we'll just log it - in a real app, you'd fetch new data
        });
    });
}

// Draw chart with real data
function drawChart(data) {
    console.log('Starting chart drawing with data:', data);
    const canvas = document.getElementById('price-chart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Cannot get canvas context');
        return;
    }
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set styles
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    ctx.font = '12px Poppins, sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'center';
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, canvas.height - 50);
    ctx.lineTo(canvas.width - 20, canvas.height - 50);
    ctx.stroke();
    
    // Sort data by date
    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get shares from holdings to calculate portfolio values
    const holdingElement = document.getElementById('holding-amount');
    const shares = holdingElement ? parseInt(holdingElement.textContent.replace(' shares', '')) || 0 : 0;
    
    // Calculate portfolio values (price * shares) instead of individual stock prices
    const portfolioValues = sortedData.map(item => parseFloat(item.close) * shares);
    const minValue = Math.min(...portfolioValues);
    const maxValue = Math.max(...portfolioValues);
    const valueRange = maxValue - minValue || 1; // Prevent division by zero
    
    // Draw Y-axis price labels (portfolio values)
    const priceTicks = 5;
    for (let i = 0; i <= priceTicks; i++) {
        const portfolioValue = minValue + (valueRange * i / priceTicks);
        const y = canvas.height - 50 - ((portfolioValue - minValue) / valueRange) * (canvas.height - 70);
        
        // Draw horizontal grid lines
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.moveTo(50, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
        
        // Draw price labels (show portfolio values)
        ctx.strokeStyle = '#CCCCCC';
        ctx.fillStyle = '#CCCCCC';
        ctx.textAlign = 'right';
        ctx.fillText('$' + portfolioValue.toLocaleString('en-US', {maximumFractionDigits: 0}), 45, y + 4);
    }
    
    // Draw line chart
    ctx.beginPath();
    ctx.strokeStyle = '#D4AF37';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    
    const dataPoints = [];
    const width = canvas.width - 70;
    const height = canvas.height - 70;
    
    sortedData.forEach((item, index) => {
        const x = 50 + (index / (sortedData.length - 1)) * width;
        const portfolioValue = parseFloat(item.close) * shares;
        const y = canvas.height - 50 - ((portfolioValue - minValue) / valueRange) * height;
        dataPoints.push({x, y, portfolioValue: portfolioValue, timestamp: item.date});
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // Fill area
    ctx.stroke();
    if (dataPoints.length > 0) {
        ctx.lineTo(dataPoints[dataPoints.length - 1].x, canvas.height - 50);
        ctx.lineTo(dataPoints[0].x, canvas.height - 50);
        ctx.closePath();
        ctx.fill();
        
        // Draw data points
        ctx.fillStyle = '#D4AF37';
        dataPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Draw X-axis time labels
    const dateTicks = Math.min(5, sortedData.length);
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < dateTicks; i++) {
        const index = Math.floor(i * (sortedData.length - 1) / (dateTicks - 1));
        const point = dataPoints[index];
        if (point) {
            const date = new Date(point.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            ctx.fillText(dateStr, point.x, canvas.height - 30);
            
            // Draw vertical grid lines
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.moveTo(point.x, 20);
            ctx.lineTo(point.x, canvas.height - 50);
            ctx.stroke();
        }
    }
    
    // Add axis labels
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px Poppins, sans-serif';
    // Removed Y-axis title
    ctx.fillText('Date', canvas.width / 2, canvas.height - 5);
}

// Initialize simulated chart
function initChart() {
    const canvas = document.getElementById('price-chart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw simulated chart
    drawMockChart(ctx, canvas.width, canvas.height);
}

// Draw simulated chart
function drawMockChart(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set styles
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.stroke();
    
    // Draw simulated line chart
    ctx.beginPath();
    ctx.moveTo(50, height - 100);
    
    // Generate simulated data points
    const dataPoints = [];
    let y = height - 100;
    for (let x = 50; x < width - 20; x += (width - 70) / 10) {
        y += (Math.random() - 0.5) * 50;
        y = Math.max(50, Math.min(height - 70, y)); // Limit y value range
        dataPoints.push({x, y});
        ctx.lineTo(x, y);
    }
    
    // Fill area
    ctx.stroke();
    ctx.lineTo(dataPoints[dataPoints.length - 1].x, height - 50);
    ctx.lineTo(50, height - 50);
    ctx.closePath();
    ctx.fill();
    
    // Draw data points
    ctx.fillStyle = '#D4AF37';
    dataPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Add axis labels
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px Poppins, sans-serif';
    // Removed Y-axis title
    ctx.fillText('Date', width / 2, height - 5);
}

// Buy button event handler
function handleBuyClick() {
    const stockName = document.getElementById('stock-name').textContent;
    alert(`Buy Function: You are about to buy ${stockName}\nThis feature will be implemented in future versions.`);
}

// Sell button event handler
function handleSellClick() {
    const stockName = document.getElementById('stock-name').textContent;
    alert(`Sell Function: You are about to sell ${stockName}\nThis feature will be implemented in future versions.`);
}

// Watchlist button event handler
function handleWatchlistClick() {
    const stockName = document.getElementById('stock-name').textContent;
    const btn = document.getElementById('watchlist-button');
    
    if (btn.textContent.includes('Watch')) {
        btn.innerHTML = '<i class="fas fa-star"></i> Watching';
        alert(`${stockName} has been added to your watchlist!`);
    } else {
        btn.innerHTML = '<i class="fas fa-star"></i> Watch';
        alert(`${stockName} has been removed from your watchlist!`);
    }
}

// Trade History button event handler
async function handleTradeHistoryClick() {
    const stockInfo = getStockInfoFromURL();
    const stockSymbol = stockInfo.symbol || getStockSymbolById(stockInfo.id);
    const modal = document.getElementById('trade-modal');
    const container = document.getElementById('trade-table-container');
    
    // Show modal
    modal.style.display = 'block';
    
    // Show loading message
    container.innerHTML = '<div class="loading-message">Loading trade history...</div>';
    
    try {
        // Fetch trade history for the stock
        const response = await fetch(`/api/data/users/1/stocks/${stockSymbol}/trades`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const trades = await response.json();
        
        if (!trades || trades.length === 0) {
            container.innerHTML = '<div class="loading-message">No trade history found for this stock.</div>';
            return;
        }
        
        // Create table
        const table = document.createElement('table');
        table.className = 'trade-table';
        
        // Create header
        const header = table.createTHead();
        const headerRow = header.insertRow();
        const headers = ['Date', 'Action', 'Quantity', 'Price', 'Change Rate', 'Total Amount'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        // Sort trades by date in descending order (newest first)
        const sortedTrades = trades.sort((a, b) => {
            const dateA = new Date(a.created_date || a.date);
            const dateB = new Date(b.created_date || b.date);
            return dateB - dateA; // Descending order
        });
        
        // Create body
        const tbody = table.createTBody();
        sortedTrades.forEach((trade, index) => {
            const row = tbody.insertRow();
            
            // Format date to all numbers (MM/DD/YYYY, HH:MM)
            const date = new Date(trade.created_date || trade.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }) + ', ' + date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            // Calculate change rate compared to previous trade
            let changeRate = 'N/A';
            let changeClass = '';
            if (index > 0) {
                const currentPrice = parseFloat(trade.price || 0);
                const previousPrice = parseFloat(sortedTrades[index - 1].price || 0);
                
                if (previousPrice > 0 && currentPrice > 0) {
                    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
                    changeRate = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
                    changeClass = changePercent >= 0 ? 'rate-increase' : 'rate-decrease';
                    console.log(`Change calculation: ${currentPrice} vs ${previousPrice} = ${changePercent.toFixed(2)}% (${changeClass})`);
                }
            }
            
            // Create cells
            const cells = [
                formattedDate,
                trade.action || 'buy',
                trade.quantity || 0,
                formatCurrency(trade.price || 0),
                changeRate,
                formatCurrency(trade.total_amount || (trade.quantity * trade.price))
            ];
            
            cells.forEach((cellText, index) => {
                const cell = row.insertCell();
                cell.textContent = cellText;
                
                // Add styling for action column
                if (index === 1) {
                    cell.className = cellText.toLowerCase() === 'buy' ? 'trade-buy' : 'trade-sell';
                    cell.textContent = cellText.toUpperCase();
                }
                
                // Add styling for change rate column
                if (index === 4 && changeClass) {
                    cell.className = changeClass;
                }
            });
        });
        
        container.innerHTML = '';
        container.appendChild(table);
        
    } catch (error) {
        console.error('Failed to fetch trade history:', error);
        container.innerHTML = '<div class="error-message">Failed to load trade history. Please try again later.</div>';
    }
}

// Close modal event handler
function handleCloseModal() {
    const modal = document.getElementById('trade-modal');
    modal.style.display = 'none';
}

// Initialize stock detail page
function initializeStockDetailPage() {
    // Add event listeners
    document.getElementById('buy-button').addEventListener('click', handleBuyClick);
    document.getElementById('sell-button').addEventListener('click', handleSellClick);
    document.getElementById('watchlist-button').addEventListener('click', handleWatchlistClick);
    document.getElementById('trade-history-button').addEventListener('click', handleTradeHistoryClick);
    document.getElementById('close-modal').addEventListener('click', handleCloseModal);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('trade-modal');
        if (event.target === modal) {
            handleCloseModal();
        }
    });
    
    // Initialize page
    initPage();
}

// Handle window resize to redraw chart
function handleResize() {
    const canvas = document.getElementById('price-chart');
    if (canvas && canvas.hasAttribute('data-has-real-data')) {
        // If real data exists, redraw real data chart
        const data = JSON.parse(canvas.getAttribute('data-chart-data') || '[]');
        if (data.length > 0) {
            drawChart(data);
        } else {
            initChart();
        }
    } else {
        // Otherwise draw simulated chart
        initChart();
    }
}

// Execute after page loads
window.addEventListener('load', initializeStockDetailPage);

// Redraw chart when window is resized
window.addEventListener('resize', handleResize);
