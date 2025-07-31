// 插入交易数据到trades表
const db = require('../Models/db.js').getCursor();
const User = require('../Models/user');

const insertTrade = async (tradeData) => {
    try {
        // 验证必要字段
        if (!tradeData.user_id || !tradeData.stock_id || !tradeData.price || !tradeData.quantity) {
            throw new Error('缺少必要的交易信息');
        }

        // 计算总金额
        const total_amount = tradeData.price * tradeData.quantity;

        // 获取用户当前现金余额
        const currentCash = await User.getUserCash(tradeData.user_id);
        if (currentCash === null) {
            throw new Error('用户不存在');
        }

        // 根据交易类型更新用户现金余额
        const action = tradeData.action || 'BUY';
        let newCashAmount;
        
        if (action.toUpperCase() === 'BUY') {
            // 买入股票，现金减少
            newCashAmount = currentCash - total_amount;
            if (newCashAmount < 0) {
                throw new Error('现金余额不足');
            }
        } else if (action.toUpperCase() === 'SELL') {
            // 卖出股票，现金增加
            newCashAmount = currentCash + total_amount;
        } else {
            throw new Error('不支持的交易类型');
        }

        // 构建SQL插入语句
        const query = `
            INSERT INTO trades (
                user_id,
                stock_id,
                source_name,
                action,
                price,
                quantity,
                total_amount,
                created_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // 准备参数
        const params = [
            tradeData.user_id,
            tradeData.stock_id,
            tradeData.source_name || null,
            action,  // 使用处理后的action
            tradeData.price,
            tradeData.quantity,
            total_amount,
            tradeData.created_date || new Date()  // 默认为当前时间
        ];

        // 开始数据库事务
        await db.beginTransaction();

        try {
            // 执行交易记录插入
            const [result] = await db.execute(query, params);
            
            // 更新用户现金余额
            const updateSuccess = await User.updateUserCash(tradeData.user_id, newCashAmount);
            if (!updateSuccess) {
                throw new Error('更新用户现金余额失败');
            }

            // 提交事务
            await db.commit();

            return {
                success: true,
                tradeId: result.insertId,
                message: '交易记录添加成功',
                newCashBalance: newCashAmount
            };
        } catch (error) {
            // 如果出错，回滚事务
            await db.rollback();
            throw error;
        }

    } catch (error) {
        console.error('插入交易记录失败:', error);
        throw {
            success: false,
            error: error.message || '插入交易记录失败'
        };
    }
};

module.exports = {
    insertTrade
};
