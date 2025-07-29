const mysql = require('mysql2');

// 创建数据库连接
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'pilot'
});

// 创建游标
const cursor = conn.promise();


function AddCollect(req, res) {
    const { user_id, stock_name } = req.body;
    // 获取当前时间戳
    const created_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sql = 'INSERT INTO collections (user_id, stock_name, created_date) VALUES (?, ?, ?)';
    cursor.execute(sql, [user_id, stock_name, created_time])
        .then(() => {
            conn.commit();
            res.send('Collect added successfully');
        })
        .catch(err => {
            res.status(500).send('Error adding collect: ' + err.message);
        });
}

function GetCollect(req, res) {
    const { user_id } = req.query;
    const sql = 'SELECT distinct(stock_name) FROM collections WHERE user_id = ?';
    cursor.execute(sql, [user_id])
        .then(([rows]) => {
            const stock_names = rows.map(row => row.stock_name);
            // 创建包含 stock_id 数组的对象
            const result = { "stock_names": stock_names };
            // 发送 JSON 响应
            res.json(result);
        })
        .catch(err => {
            res.status(500).send('Error getting collects: ' + err.message);
        });
}

function DeleteCollect(req, res) {
    const { user_id, stock_name } = req.body;
    const sql = 'DELETE FROM collections WHERE user_id = ? AND stock_name = ?';
    cursor.execute(sql, [user_id, stock_name])
        .then(() => {
            conn.commit();
            res.send('Collect deleted successfully');
        })
        .catch(err => {
            res.status(500).send('Error deleting collect: ' + err.message);
        });
}

module.exports = {
    AddCollect,
    GetCollect,
    DeleteCollect
};
