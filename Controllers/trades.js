// 插入交易数据到trades表
const db = require('../Models/db.js').getCursor();

const insertTrade = async (tradeData) => {
    try {
        // 验证必要字段
        if (!tradeData.user_id || !tradeData.stock_id || !tradeData.price || !tradeData.quantity) {
            throw new Error('缺少必要的交易信息');
        }

        // 计算总金额
        const total_amount = tradeData.price * tradeData.quantity;

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
            tradeData.action || 'BUY',  // 默认为买入
            tradeData.price,
            tradeData.quantity,
            total_amount,
            tradeData.created_date || new Date()  // 默认为当前时间
        ];

        // 执行SQL语句
        const [result] = await db.execute(query, params);

        return {
            success: true,
            tradeId: result.insertId,
            message: '交易记录添加成功'
        };

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
