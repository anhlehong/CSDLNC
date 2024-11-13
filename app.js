// app.js
const express = require("express");
const { connectToMongoDB, connectToSqlServer } = require("./dbconfig");
const app = express();
const { v4: uuidv4 } = require("uuid");
const sql = require('mssql');
const bodyParser = require('body-parser');
const axios = require('axios'); // Thêm axios nếu chưa được khai báo

app.use(express.json());

let mongoDb;


connectToSqlServer();

// Kết nối MongoDB
connectToMongoDB().then(db => {
    mongoDb = db;
});

// Customer
// app.post("/api/sync-customer", async (req, res) => {
//     const {
//         CustomerId, UserId, UserName, Password, Phone_number, DOB, Image,
//         Street, Ward, District, City, Region, Action
//     } = req.body;

//     console.log("Received request:", req.body);

//     try {
//         const customerCollection = mongoDb.collection("Customer");
//         const customerData = {
//             Customer: {
//                 Id: CustomerId,
//                 User: {
//                     Id: UserId,
//                     UserName: UserName,
//                     Password: Password,
//                     Phone_number: Phone_number,
//                     DOB: DOB,
//                     Image: Image,
//                     Address: {
//                         Street: Street,
//                         Ward: Ward,
//                         District: District,
//                         City: City,
//                         Region: Region
//                     },
//                 }
//             }
//         };

//         if (Action === 'INSERT') {
//             // Thêm mới hoặc cập nhật khách hàng
//             const filter = { "Customer.Id": CustomerId };
//             const update = { $set: customerData };
//             await customerCollection.updateOne(filter, update, { upsert: true });
//             res.send("Customer and related data inserted/updated successfully");
//         } else if (Action === "DELETE") {
//             // Xóa khách hàng và các quan hệ liên quan
//             await customerCollection.deleteOne({ "Customer.Id": CustomerId });
//             res.send("Customer and related data deleted successfully");
//         } else {
//             res.status(400).send("Invalid action");
//         }
//     } catch (error) {
//         console.error("Error syncing customer:", error);
//         res.status(500).send("Error syncing customer");
//     }
// });
app.post("/api/sync-customer", async (req, res) => {
    const {
        CustomerId, UserId, Name, UserName, Password, Phone_number, DOB, Image,
        Street, Ward, District, City, Region, Action
    } = req.body;

    console.log("Received request /api/sync-customer:", req.body);

    try {
        const customerCollection = mongoDb.collection("Customer");
        const customerData = {
            Customer: {
                Id: CustomerId,
                User: {
                    Id: UserId,
                    Name: Name,
                    UserName: UserName,
                    Password: Password,
                    Phone_number: Phone_number,
                    DOB: DOB,
                    Image: Image,
                    Address: {
                        Street: Street,
                        Ward: Ward,
                        District: District,
                        City: City,
                        Region: Region
                    },
                }
            }
        };

        if (Action === 'INSERT' || Action === 'UPDATE') {
            // Insert or update customer data
            const filter = { "Customer.Id": CustomerId };
            const update = { $set: customerData };
            await customerCollection.updateOne(filter, update, { upsert: true });
            res.send("Customer and related data inserted/updated successfully");
        } else if (Action === "DELETE") {
            // Delete customer data
            await customerCollection.deleteOne({ "Customer.Id": CustomerId });
            res.send("Customer and related data deleted successfully");
        } else {
            res.status(400).send("Invalid action");
        }
    } catch (error) {
        console.error("Error syncing customer:", error);
        res.status(500).send("Error syncing customer");
    }
});

app.post('/api/add-customer', async (req, res) => {
    const userId = uuidv4();
    const rowguid = uuidv4();
    const rowguidCustomer = uuidv4();
    const customerId = uuidv4();
    const Id_address = uuidv4();
    const rowguidAddress = uuidv4();
    const { Name, DOB, UserName, Password, Phone_number, Image, Street, Id_ward } = req.body;

    console.log("Received request /api/add-customer:", req.body);

    // Kiểm tra dữ liệu đầu vào
    if (!Name || !DOB || !UserName || !Password || !Phone_number || !Street || !Id_ward) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const pool = await sql.connect();

        const transaction = await pool.transaction();
        await transaction.begin();

        try {
            // Insert address
            const addressRequest = transaction.request();
            await addressRequest
                .input('Id_address', sql.VarChar(36), Id_address)
                .input('Street', sql.NVarChar(255), Street)
                .input('Id_ward', sql.NVarChar(36), Id_ward)
                .input('rowguidAddress', sql.NVarChar(36), rowguidAddress)
                .query(`
                    INSERT INTO [Address] (Id, Street, Id_ward, rowguid)
                    VALUES (@Id_address, @Street, @Id_ward, @rowguidAddress);
                `);

            // Insert user
            const userRequest = transaction.request();
            await userRequest
                .input('Id', sql.NVarChar(36), userId)
                .input('Name', sql.NVarChar(255), Name)
                .input('DOB', sql.Date, DOB)
                .input('UserName', sql.NVarChar(255), UserName)
                .input('Password', sql.NVarChar(255), Password)
                .input('Phone_number', sql.NVarChar(20), Phone_number)
                .input('Image', sql.NVarChar(255), Image)
                .input('Id_address', sql.NVarChar(36), Id_address)
                .input('rowguid', sql.NVarChar(36), rowguid)
                .query(`
                    INSERT INTO [User] (Id, Name, DOB, UserName, Password, Phone_number, Image, Id_address, rowguid)
                    VALUES (@Id, @Name, @DOB, @UserName, @Password, @Phone_number, @Image, @Id_address, @rowguid);
                `);

            // Insert customer
            const customerRequest = transaction.request();
            await customerRequest
                .input('CustomerId', sql.NVarChar(36), customerId)
                .input('UserId', sql.NVarChar(36), userId)
                .input('rowguidCustomer', sql.NVarChar(36), rowguidCustomer)
                .query(`
                    INSERT INTO [Customer] (Id, Id_user, rowguid)
                    VALUES (@CustomerId, @UserId, @rowguidCustomer);
                `);

            await transaction.commit();
            res.status(200).send('Address, User and Customer added successfully');
        } catch (error) {
            await transaction.rollback();  // Rollback nếu có lỗi
            console.error('Error adding user and customer:', error);
            res.status(500).send('Failed to add user and customer');
        }

    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
        res.status(500).send('Failed to connect to SQL Server');
    }
});

app.put('/api/update-customer/:customerId', async (req, res) => {
    const { customerId } = req.params;
    const {
        Name, DOB, UserName, Password, Phone_number, Image,
        Street, Id_ward
    } = req.body;

    console.log("Received update request for customer:", req.body);

    if (!customerId) {
        return res.status(400).send('Customer ID is required');
    }

    try {
        const pool = await sql.connect();
        const transaction = pool.transaction();

        await transaction.begin();

        try {
            // Lấy user ID từ bảng Customer
            console.log('Retrieving associated user ID from Customer...');
            const customerResult = await transaction.request()
                .input('CustomerId', sql.NVarChar(36), customerId)
                .query(`
                    SELECT Id_user FROM [Customer] WHERE Id = @CustomerId;
                `);

            if (customerResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).send('Customer not found');
            }

            const userId = customerResult.recordset[0].Id_user;
            console.log(`Customer ID: ${customerId}, User ID: ${userId}`);

            // Lấy thông tin chi tiết từ bảng User
            console.log('Retrieving associated address ID from User...');
            const userResult = await transaction.request()
                .input('UserId', sql.NVarChar(36), userId)
                .query(`
                    SELECT Id_address, Name, DOB, UserName, Password, Phone_number, Image
                    FROM [User] WHERE Id = @UserId;
                `);

            const existingUser = userResult.recordset[0];
            const addressId = existingUser?.Id_address;
            console.log(`Existing Address ID: ${addressId}`);

            // Xóa Address cũ nếu địa chỉ mới được cung cấp
            if (Street && Id_ward) {
                await transaction.request()
                    .input('Id_address', sql.NVarChar(36), addressId)
                    .query(`DELETE FROM [Address] WHERE Id = @Id_address;`);
                console.log('Old address deleted.');

                // Tạo địa chỉ mới
                const newAddressId = uuidv4();
                console.log('Inserting new address...');
                await transaction.request()
                    .input('Id_address', sql.NVarChar(36), newAddressId)
                    .input('Street', sql.NVarChar(255), Street || existingUser.Street)
                    .input('Id_ward', sql.NVarChar(36), Id_ward || existingUser.Id_ward)
                    .query(`
                        INSERT INTO [Address] (Id, Street, Id_ward)
                        VALUES (@Id_address, @Street, @Id_ward);
                    `);

                // Cập nhật ID địa chỉ trong bảng User
                await transaction.request()
                    .input('UserId', sql.NVarChar(36), userId)
                    .input('Id_address', sql.NVarChar(36), newAddressId)
                    .query(`
                        UPDATE [User] SET Id_address = @Id_address WHERE Id = @UserId;
                    `);
                console.log('New address inserted and user updated with new address ID.');
            }

            // Cập nhật thông tin bảng User
            console.log('Updating User table...');
            await transaction.request()
                .input('UserId', sql.NVarChar(36), userId)
                .input('Name', sql.NVarChar(255), Name || existingUser.Name)
                .input('DOB', sql.Date, DOB || existingUser.DOB)
                .input('UserName', sql.NVarChar(255), UserName || existingUser.UserName)
                .input('Password', sql.NVarChar(255), Password || existingUser.Password)
                .input('Phone_number', sql.NVarChar(20), Phone_number || existingUser.Phone_number)
                .input('Image', sql.NVarChar(255), Image || existingUser.Image)
                .query(`
                    UPDATE [User]
                    SET Name = @Name,
                        DOB = @DOB,
                        UserName = @UserName,
                        Password = @Password,
                        Phone_number = @Phone_number,
                        Image = @Image
                    WHERE Id = @UserId;
                `);
            console.log('User table updated successfully.');

            await transaction.commit();

            // Gọi API để đồng bộ với MongoDB
            const customerData = {
                CustomerId: customerId,
                UserId: userId,
                Name: Name || existingUser.Name,
                UserName: UserName || existingUser.UserName,
                Password: Password || existingUser.Password,
                Phone_number: Phone_number || existingUser.Phone_number,
                DOB: DOB || existingUser.DOB,
                Image: Image || existingUser.Image,
                Street: Street || existingUser.Street,
                Ward: 'Ward Name',
                District: 'District Name',
                City: 'City Name',
                Region: 'Region Name',
                Action: 'UPDATE'
            };

            await axios.post('http://localhost:5000/api/sync-customer', customerData);
            console.log("Customer data synced with MongoDB successfully.");

            res.status(200).send('Customer, User, and Address updated and synced with MongoDB successfully');
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Error updating customer:', error);
            res.status(500).send('Failed to update customer');
        }
    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
        res.status(500).send('Failed to connect to SQL Server');
    }
});

app.delete('/api/delete-customer/:customerId', async (req, res) => {
    const { customerId } = req.params;

    if (!customerId) {
        return res.status(400).send('Customer ID is required');
    }

    try {
        const pool = await sql.connect();
        const transaction = await pool.transaction();
        await transaction.begin();

        try {
            // Lấy user ID liên quan từ bảng Customer
            console.log('Retrieving associated user ID from Customer...');
            const customerResult = await transaction.request()
                .input('CustomerId', sql.NVarChar(36), customerId)
                .query(`
                    SELECT Id_user FROM [Customer] WHERE Id = @CustomerId;
                `);

            if (customerResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).send('Customer not found');
            }

            const userId = customerResult.recordset[0].Id_user;
            console.log(`Customer ID: ${customerId}, User ID: ${userId}`);

            // Lấy address ID liên quan từ bảng User
            console.log('Retrieving associated address ID from User...');
            const userResult = await transaction.request()
                .input('UserId', sql.NVarChar(36), userId)
                .query(`
                    SELECT Id_address FROM [User] WHERE Id = @UserId;
                `);

            const addressId = userResult.recordset[0]?.Id_address;
            console.log(`Address ID: ${addressId}`);

            // Xóa bản ghi trong bảng Customer
            console.log('Deleting from Customer table...');
            await transaction.request()
                .input('CustomerId', sql.NVarChar(36), customerId)
                .query(`
                    DELETE FROM [Customer] WHERE Id = @CustomerId;
                `);
            console.log('Deleted from Customer table successfully.');

            // Xóa bản ghi trong bảng User
            console.log('Deleting from User table...');
            await transaction.request()
                .input('UserId', sql.NVarChar(36), userId)
                .query(`
                    DELETE FROM [User] WHERE Id = @UserId;
                `);
            console.log('Deleted from User table successfully.');

            // Xóa bản ghi trong bảng Address nếu address ID tồn tại
            if (addressId) {
                console.log('Deleting from Address table...');
                await transaction.request()
                    .input('Id_address', sql.NVarChar(36), addressId)
                    .query(`
                        DELETE FROM [Address] WHERE Id = @Id_address;
                    `);
                console.log('Deleted from Address table successfully.');
            }

            await transaction.commit();
            res.status(200).send('Customer, User, and Address deleted successfully');
        } catch (error) {
            await transaction.rollback();
            console.error('Error deleting customer:', error);
            res.status(500).send('Failed to delete customer');
        }
    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
        res.status(500).send('Failed to connect to SQL Server');
    }
});

// Employee
// API sync-employee để đưa dữ liệu lên MongoDB
app.post("/api/sync-employee", async (req, res) => {
    const {
        UserId, Name, UserName, Password, Phone_number, DOB, Image,
        Street, Ward, District, City, Region, Role, Action
    } = req.body;

    console.log("Received request /api/sync-employee:", req.body);

    try {
        const employeeCollection = mongoDb.collection("Employee");

        const employeeData = {
            Employee: {
                Role: Role,
                User: {
                    Id: UserId,
                    Name: Name,
                    UserName: UserName,
                    Password: Password,
                    Phone_number: Phone_number,
                    DOB: DOB,
                    Image: Image,
                    Address: {
                        Street: Street,
                        Ward: Ward,
                        District: District,
                        City: City,
                        Region: Region
                    },
                }
            }
        };

        if (Action === 'INSERT' || Action === 'UPDATE') {
            // Insert or update employee data
            const filter = { "Employee.User.Id": UserId };
            const update = { $set: employeeData };
            await employeeCollection.updateOne(filter, update, { upsert: true });
            res.send("Employee and related data inserted/updated successfully");
        } else if (Action === "DELETE") {
            // Delete employee data
            await employeeCollection.deleteOne({ "Employee.User.Id": UserId });
            res.send("Employee and related data deleted successfully");
        } else {
            res.status(400).send("Invalid action");
        }
    } catch (error) {
        console.error("Error syncing employee:", error);
        res.status(500).send("Error syncing employee");
    }
});

app.post('/api/add-employee', async (req, res) => {
    const userId = uuidv4();
    const userRowguid = uuidv4();
    const addressId = uuidv4();
    const addressRowguid = uuidv4();
    const employeeRowguid = uuidv4();

    const { Name, DOB, UserName, Password, Phone_number, Image, Street, Id_ward, Id_role } = req.body;

    if (!Name || !DOB || !UserName || !Password || !Phone_number || !Street || !Id_ward || !Id_role) {
        return res.status(400).send('Thiếu trường bắt buộc');
    }
    console.log("Received request at /api/add-employee:", req.body);

    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // Thêm địa chỉ
            const addressRequest = transaction.request();
            await addressRequest
                .input('Id_address', sql.VarChar(36), addressId)
                .input('Street', sql.NVarChar(255), Street)
                .input('Id_ward', sql.NVarChar(36), Id_ward)
                .input('rowguid', sql.NVarChar(36), addressRowguid)
                .query(`
                    INSERT INTO [Address] (Id, Street, Id_ward, rowguid)
                    VALUES (@Id_address, @Street, @Id_ward, @rowguid);
                `);

            // Thêm user
            const userRequest = transaction.request();
            await userRequest
                .input('Id', sql.NVarChar(36), userId)
                .input('Name', sql.NVarChar(255), Name)
                .input('DOB', sql.Date, DOB)
                .input('UserName', sql.NVarChar(255), UserName)
                .input('Password', sql.NVarChar(255), Password)
                .input('Phone_number', sql.NVarChar(20), Phone_number)
                .input('Image', sql.NVarChar(255), Image)
                .input('Id_address', sql.NVarChar(36), addressId)
                .input('rowguid', sql.NVarChar(36), userRowguid)
                .query(`
                    INSERT INTO [User] (Id, Name, DOB, UserName, Password, Phone_number, Image, Id_address, rowguid)
                    VALUES (@Id, @Name, @DOB, @UserName, @Password, @Phone_number, @Image, @Id_address, @rowguid);
                `);

            // Thêm employee
            const employeeRequest = transaction.request();
            await employeeRequest
                .input('Id_user', sql.NVarChar(36), userId)
                .input('Id_role', sql.NVarChar(36), Id_role)
                .input('rowguid', sql.NVarChar(36), employeeRowguid)
                .query(`
                    INSERT INTO [Employee] (Id_user, Id_role, rowguid)
                    VALUES (@Id_user, @Id_role, @rowguid);
                `);

            await transaction.commit();

            // Truy vấn thông tin Ward, District, City, và Region
            const locationQuery = await pool.request()
                .input('Id_ward', sql.NVarChar(36), Id_ward)
                .query(`
                    SELECT 
                        w.Name AS Ward, 
                        d.Name AS District, 
                        c.Name AS City, 
                        r.Name AS Region 
                    FROM Ward w
                    INNER JOIN District d ON w.Id_district = d.Id
                    INNER JOIN City c ON d.Id_city = c.Id
                    INNER JOIN Region r ON c.Id_region = r.Id
                    WHERE w.Id = @Id_ward
                `);

            const locationData = locationQuery.recordset[0];

            // Lấy tên vai trò (Role) từ Id_role
            const roleQuery = await pool.request()
                .input('Id_role', sql.NVarChar(36), Id_role)
                .query(`SELECT Name FROM [Role] WHERE Id = @Id_role`);

            const roleName = roleQuery.recordset[0]?.Name || "Unknown Role";

            // Gọi API sync-employee để đồng bộ với MongoDB
            await axios.post(`http://localhost:5000/api/sync-employee`, {
                UserId: userId,
                Name: Name,
                UserName: UserName,
                Password: Password,
                Phone_number: Phone_number,
                DOB: DOB,
                Image: Image,
                Street: Street,
                Ward: locationData.Ward,
                District: locationData.District,
                City: locationData.City,
                Region: locationData.Region,
                Role: roleName,
                Action: 'INSERT'
            });

            res.status(200).send('Đã thêm Address, User và Employee thành công');
        } catch (error) {
            await transaction.rollback();
            console.error('Lỗi khi thêm user và employee:', error);
            res.status(500).send('Thêm user và employee thất bại');
        }

    } catch (error) {
        console.error('Lỗi kết nối SQL Server:', error);
        res.status(500).send('Kết nối SQL Server thất bại');
    }
});

app.delete('/api/delete-employee/:UserId', async (req, res) => {
    const { UserId } = req.params;

    if (!UserId) {
        return res.status(400).send('Thiếu UserId');
    }
    console.log("Received request at /api/delete-employee:", req.body);

    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // Xóa employee
            await transaction.request()
                .input('Id_user', sql.NVarChar(36), UserId)
                .query(`DELETE FROM [Employee] WHERE Id_user = @Id_user;`);

            // Xóa user
            await transaction.request()
                .input('Id', sql.NVarChar(36), UserId)
                .query(`DELETE FROM [User] WHERE Id = @Id;`);

            await transaction.commit();

            // Đồng bộ với MongoDB
            await axios.post(`http://localhost:5000/api/sync-employee`, {
                UserId,
                Action: 'DELETE'
            });

            res.status(200).send('Đã xóa Employee và User thành công');
        } catch (error) {
            await transaction.rollback();
            console.error('Lỗi khi xóa user và employee:', error);
            res.status(500).send('Xóa user và employee thất bại');
        }

    } catch (error) {
        console.error('Lỗi kết nối SQL Server:', error);
        res.status(500).send('Kết nối SQL Server thất bại');
    }
});

app.put('/api/update-employee/:UserId', async (req, res) => {
    const { UserId } = req.params;
    const {
        Name, DOB, UserName, Password, Phone_number, Image,
        Street, Id_ward, Id_role
    } = req.body;

    console.log("Yêu cầu cập nhật nhân viên nhận được:", req.body);

    if (!UserId) {
        return res.status(400).send('Cần có ID người dùng');
    }

    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        // Bắt đầu giao dịch SQL
        await transaction.begin();

        try {
            // Lấy thông tin chi tiết từ bảng User
            console.log('Lấy ID địa chỉ liên kết từ User...');
            const userResult = await transaction.request()
                .input('UserId', sql.NVarChar(36), UserId)
                .query(`
                    SELECT Id_address, Name, DOB, UserName, Password, Phone_number, Image
                    FROM [User] WHERE Id = @UserId;
                `);

            if (userResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).send('Không tìm thấy người dùng');
            }

            const existingUser = userResult.recordset[0];
            const addressId = existingUser?.Id_address;
            console.log(`ID Địa chỉ hiện tại: ${addressId}`);

            // Xóa địa chỉ cũ nếu có địa chỉ mới
            if (Street && Id_ward) {
                await transaction.request()
                    .input('Id_address', sql.NVarChar(36), addressId)
                    .query(`DELETE FROM [Address] WHERE Id = @Id_address;`);
                console.log('Địa chỉ cũ đã bị xóa.');

                // Tạo địa chỉ mới
                const newAddressId = uuidv4();
                console.log('Chèn địa chỉ mới...');
                await transaction.request()
                    .input('Id_address', sql.NVarChar(36), newAddressId)
                    .input('Street', sql.NVarChar(255), Street)
                    .input('Id_ward', sql.NVarChar(36), Id_ward)
                    .query(`
                        INSERT INTO [Address] (Id, Street, Id_ward)
                        VALUES (@Id_address, @Street, @Id_ward);
                    `);

                // Cập nhật ID địa chỉ trong bảng User
                await transaction.request()
                    .input('UserId', sql.NVarChar(36), UserId)
                    .input('Id_address', sql.NVarChar(36), newAddressId)
                    .query(`
                        UPDATE [User] SET Id_address = @Id_address WHERE Id = @UserId;
                    `);
                console.log('Địa chỉ mới đã được chèn và cập nhật trong User.');
            }

            // Cập nhật thông tin bảng User với dữ liệu hiện tại nếu không có dữ liệu mới
            console.log('Cập nhật bảng User...');
            await transaction.request()
                .input('UserId', sql.NVarChar(36), UserId)
                .input('Name', sql.NVarChar(255), Name || existingUser.Name)
                .input('DOB', sql.Date, DOB || existingUser.DOB)
                .input('UserName', sql.NVarChar(255), UserName || existingUser.UserName)
                .input('Password', sql.NVarChar(255), Password || existingUser.Password)
                .input('Phone_number', sql.NVarChar(20), Phone_number || existingUser.Phone_number)
                .input('Image', sql.NVarChar(255), Image || existingUser.Image)
                .query(`
                    UPDATE [User]
                    SET Name = @Name,
                        DOB = @DOB,
                        UserName = @UserName,
                        Password = @Password,
                        Phone_number = @Phone_number,
                        Image = @Image
                    WHERE Id = @UserId;
                `);
            console.log('Bảng User đã được cập nhật thành công.');

            // Cập nhật vai trò của nhân viên trong bảng Employee
            console.log('Cập nhật bảng Employee...');
            await transaction.request()
                .input('UserId', sql.NVarChar(36), UserId)
                .input('Id_role', sql.NVarChar(36), Id_role || existingUser.Id_role)
                .query(`
                    UPDATE [Employee] SET Id_role = @Id_role WHERE Id_user = @UserId;
                `);
            console.log('Bảng Employee đã được cập nhật thành công.');

            await transaction.commit();

            // Gọi API để đồng bộ với MongoDB
            const employeeData = {
                UserId,
                Name: Name || existingUser.Name,
                UserName: UserName || existingUser.UserName,
                Password: Password || existingUser.Password,
                Phone_number: Phone_number || existingUser.Phone_number,
                DOB: DOB || existingUser.DOB,
                Image: Image || existingUser.Image,
                Street: Street || existingUser.Street,
                Ward: 'Ward Name', // Cập nhật tên nếu có dữ liệu chính xác
                Role: Id_role || existingUser.Id_role,
                Action: 'UPDATE'
            };

            await axios.post('http://localhost:5000/api/sync-employee', employeeData);
            console.log("Dữ liệu nhân viên đã đồng bộ với MongoDB thành công.");

            res.status(200).send('Nhân viên, User và Địa chỉ đã được cập nhật và đồng bộ với MongoDB thành công');
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Lỗi khi cập nhật nhân viên:', error);
            res.status(500).send('Cập nhật nhân viên thất bại');
        }
    } catch (error) {
        console.error('Lỗi kết nối SQL Server:', error);
        res.status(500).send('Kết nối SQL Server thất bại');
    }
});

// draft
app.put('/api/update-user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { Name, DOB, UserName, Password, Phone_number, Image, Street, Ward, District, City, Region } = req.body;

    try {
        // Kết nối đến SQL Server
        const pool = await sql.connect();

        // Bắt đầu một giao dịch để đảm bảo tính toàn vẹn dữ liệu
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Cập nhật bảng User trong SQL Server
            await transaction.request()
                .input('UserId', sql.NVarChar(36), userId)
                .input('Name', sql.NVarChar, Name)
                .input('DOB', sql.Date, DOB)
                .input('UserName', sql.NVarChar, UserName)
                .input('Password', sql.NVarChar, Password)
                .input('Phone_number', sql.NVarChar, Phone_number)
                .input('Image', sql.NVarChar, Image)
                .query(`
                    UPDATE [User]
                    SET Name = @Name, DOB = @DOB, UserName = @UserName, Password = @Password, 
                        Phone_number = @Phone_number, Image = @Image
                    WHERE Id = @UserId
                `);

            // Commit giao dịch nếu cập nhật thành công trong SQL Server
            await transaction.commit();

            // Tiếp tục cập nhật trong MongoDB
            const customerCollection = mongoDb.collection("Customer");
            const filter = { "Customer.User.Id": userId };
            const update = {
                $set: {
                    "Customer.User.Name": Name,
                    "Customer.User.UserName": UserName,
                    "Customer.User.Password": Password,
                    "Customer.User.Phone_number": Phone_number,
                    "Customer.User.DOB": DOB,
                    "Customer.User.Image": Image,
                    "Customer.User.Address": {
                        Street, Ward, District, City, Region
                    }
                }
            };
            await customerCollection.updateOne(filter, update);

            res.status(200).send("User updated successfully");
        } catch (error) {
            await transaction.rollback();  // Rollback nếu có lỗi
            console.error("Error updating user:", error);
            res.status(500).send("Failed to update user");
        }

    } catch (error) {
        console.error("Error connecting to SQL Server:", error);
        res.status(500).send("Failed to connect to SQL Server");
    }
});

app.delete('/api/delete-user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const pool = await sql.connect();

        // Bắt đầu một giao dịch để đảm bảo tính toàn vẹn dữ liệu
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            await transaction.request()
                .input('UserId', sql.NVarChar(36), userId)
                .query(`DELETE FROM[Customer] WHERE Id_user = @UserId`);


            const result = await transaction.request()
                .input('Id', sql.NVarChar(36), userId)
                .query(`DELETE FROM[User] WHERE Id = @Id`);


            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                return res.status(404).send('User not found');
            }


            await transaction.commit();
            res.status(200).send('User deleted successfully');
        } catch (error) {
            await transaction.rollback();  // Rollback nếu có lỗi
            console.error('Error deleting user:', error);
            res.status(500).send('Failed to delete user');
        }

    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
        res.status(500).send('Failed to connect to SQL Server');
    }
});

// Khởi động server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
