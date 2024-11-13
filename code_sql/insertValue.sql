-- Insert dữ liệu vào bảng Region
INSERT INTO Region (Id, Name)
VALUES ('Bac', N'Miền Bắc'),
       ('Trung', N'Miền Trung'),
       ('Nam', N'Miền Nam');

-- Insert dữ liệu vào bảng City
INSERT INTO City (Id, Id_region, Name)
VALUES ('Hanoi', 'Bac', N'Hà Nội'),
       ('Danang', 'Trung', N'Đà Nẵng'),
       ('HCMC', 'Nam', N'TP. Hồ Chí Minh');

-- Insert dữ liệu vào bảng District
INSERT INTO District (Id, Id_city, Name)
VALUES ('CauGiay', 'Hanoi', N'Cầu Giấy'),
       ('HoanKiem', 'Hanoi', N'Hoàn Kiếm'),
       ('HaiChau', 'Danang', N'Hải Châu'),
       ('SonTra', 'Danang', N'Sơn Trà'),
       ('District1', 'HCMC', N'Quận 1'),
       ('BinhThanh', 'HCMC', N'Bình Thạnh');

-- Insert dữ liệu vào bảng Ward
INSERT INTO Ward (Id, Id_district, Name)
VALUES ('DichVong', 'CauGiay', N'Dịch Vọng'),
       ('HangTrong', 'HoanKiem', N'Hàng Trống'),
       ('ThachThang', 'HaiChau', N'Thạch Thang'),
       ('ManThai', 'SonTra', N'Mân Thái'),
       ('BenNghe', 'District1', N'Bến Nghé'),
       ('HangXanh', 'BinhThanh', N'Hàng Xanh');

-- Insert dữ liệu vào bảng Address
INSERT INTO Address (Id, Street, Id_ward)
VALUES ('Addr1', N'123 Đường Dịch Vọng', 'DichVong'),
       ('Addr2', N'456 Phố Hàng Trống', 'HangTrong'),
       ('Addr3', N'789 Đường Thạch Thang', 'ThachThang'),
       ('Addr4', N'321 Đường Mân Thái', 'ManThai'),
       ('Addr5', N'654 Đường Bến Nghé', 'BenNghe'),
       ('Addr6', N'987 Đường Hàng Xanh', 'HangXanh');

-- Insert dữ liệu vào bảng Role
INSERT INTO Role (Id, Name)
VALUES ('Role1', N'Quản lý'),
       ('Role2', N'Nhân viên bán hàng');

-- Insert dữ liệu vào bảng [User]
INSERT INTO [User] (Id, Id_address, Name, DOB, UserName, Password, Phone_number, Image)
VALUES ('User1', 'Addr1', N'Tran Van A', '1990-01-01', N'trunguyen', N'password123', N'0901234567', N'/images/avatar1.jpg'),
       ('User2', 'Addr2', N'Nguyen Thi B', '1992-02-02', N'nguyenb', N'password123', N'0902345678', N'/images/avatar2.jpg'),
       ('User3', 'Addr3', N'Le Van C', '1985-03-03', N'levanc', N'password123', N'0903456789', N'/images/avatar3.jpg');

-- Insert dữ liệu vào bảng Customer
INSERT INTO Customer (Id, Id_user)
VALUES ('Cus1', 'User1'),
       ('Cus2', 'User2');

-- Insert dữ liệu vào bảng Employee
INSERT INTO Employee (Id_user, Id_role)
VALUES ('User3', 'Role1');

-- Insert dữ liệu vào bảng Category
INSERT INTO Category (Id, Name)
VALUES ('Cat1', N'Mỹ phẩm'),
       ('Cat2', N'Đồ gia dụng');

-- Insert dữ liệu vào bảng Product
INSERT INTO Product (Id, Id_category, Name, Description, Price, Stock, Image)
VALUES ('Prod1', 'Cat1', N'Sữa rửa mặt', N'Sữa rửa mặt dịu nhẹ cho da nhạy cảm', 150000, 50, N'/images/prod1.jpg'),
       ('Prod2', 'Cat2', N'Máy hút bụi', N'Máy hút bụi công suất cao', 2500000, 20, N'/images/prod2.jpg');

-- Insert dữ liệu vào bảng Supplier
INSERT INTO Supplier (Id, Name, Id_address)
VALUES ('Supp1', N'Công ty Cung ứng ABC', 'Addr4'),
       ('Supp2', N'Công ty Cung ứng XYZ', 'Addr5');

-- Insert dữ liệu vào bảng Payment
INSERT INTO Payment (Id, Name, Image)
VALUES ('Pay1', N'Thanh toán qua thẻ', NULL),
       ('Pay2', N'Thanh toán qua ví điện tử', NULL);

-- Insert dữ liệu vào bảng Bill
INSERT INTO Bill (Id, Id_payment, Total, Order_date, Status)
VALUES ('Bill1', 'Pay1', 150000, '2024-01-01', N'Đã thanh toán'),
       ('Bill2', 'Pay2', 2500000, '2024-02-01', N'Chưa thanh toán');

-- Insert dữ liệu vào bảng Buy_Product
INSERT INTO Buy_Product (Id_Bill, Id_product, Id_customer, Quantity)
VALUES ('Bill1', 'Prod1', 'Cus1', 2),
       ('Bill2', 'Prod2', 'Cus2', 1);

-- Insert dữ liệu vào bảng Cart
INSERT INTO Cart (Id_customer, Id_product, Quantity)
VALUES ('Cus1', 'Prod1', 1),
       ('Cus2', 'Prod2', 2);

-- Insert dữ liệu vào bảng Import_Bill
INSERT INTO Import_Bill (Id, Products_name, Order_date)
VALUES ('ImpBill1', N'Sữa rửa mặt', '2024-01-10'),
       ('ImpBill2', N'Máy hút bụi', '2024-02-15');

-- Insert dữ liệu vào bảng Import_Product
INSERT INTO Import_Product (Id_import_bill, Id_product, Id_supplier, Quantity)
VALUES ('ImpBill1', 'Prod1', 'Supp1', 100),
       ('ImpBill2', 'Prod2', 'Supp2', 50);
