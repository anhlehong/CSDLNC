// dbconfig.js
const sql = require("mssql");
const { MongoClient } = require("mongodb");

const sqlConfig = {
    user: 'sa',  // Tên đăng nhập SQL Server
    password: '123456',  // Mật khẩu SQL Server
    server: 'localhost\\GLOBAL',  // Địa chỉ IP SQL Server
    database: 'CSDLNC',  // Tên database SQL Server
    options: {
        encrypt: true,  // Bật mã hóa nếu bạn dùng Azure SQL
        trustServerCertificate: true  // Tùy chọn bảo mật trong môi trường phát triển
    }
};

const mongoUri = "mongodb://localhost:27017";  // Địa chỉ MongoDB
const mongoDbName = "CSDLNC";  // Tên database MongoDB

// Hàm kết nối SQL Server
async function connectToSqlServer() {
    try {
        await sql.connect(sqlConfig);
        console.log("Connected to SQL Server");
    } catch (error) {
        console.error("Error connecting to SQL Server:", error);
    }
}

// Hàm kết nối MongoDB
async function connectToMongoDB() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(mongoDbName);
    return db;
}

module.exports = {
    sql,
    connectToSqlServer,
    connectToMongoDB
};