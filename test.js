const express = require("express");
const { connectToMongoDB, connectToSqlServer } = require("./dbconfig");
const app = express();
const sql = require('mssql');
const bodyParser = require('body-parser');

app.use(express.json());

let mongoDb;

// Kết nối MongoDB và SQL Server
connectToSqlServer();
connectToMongoDB().then(db => {
    mongoDb = db;
});

// API đồng bộ hóa bill và sản phẩm
app.post('/api/sync-bill', async (req, res) => {
    const { BillId, ProductId, CustomerId, Quantity, Price, UserName, PhoneNumber } = req.body;
    console.log(req.body)
    
    try {
        // Kết nối tới SQL Server để lấy thêm thông tin sản phẩm
        const productResult = await sql.query`SELECT Name FROM dbo.Product WHERE Id = ${ProductId}`;
        const productName = productResult.recordset[0].Name;

        // Cập nhật hoặc thêm hóa đơn và sản phẩm vào MongoDB
        const billCollection = mongoDb.collection('Bills');

        const filter = { "Bill.Id": BillId };
        const update = {
            $set: {
                "Bill.Customer": {
                    "Id": CustomerId,
                    "UserName": UserName,
                    "PhoneNumber": PhoneNumber
                }
            },
            $push: {
                "Bill.Products": {
                    "ProductId": ProductId,
                    "Name": productName,
                    "Quantity": Quantity,
                    "Price": Price
                }
            }
        };

        await billCollection.updateOne(filter, update, { upsert: true });

        res.send('Bill updated successfully with product details.');
    } catch (error) {
        console.error('Error syncing bill:', error);
        res.status(500).send('Error syncing bill');
    }
});

// Khởi động server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
