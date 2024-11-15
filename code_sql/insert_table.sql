-- Insert dữ liệu vào bảng Region
INSERT INTO Region (id, Name)
VALUES ('bac', N'Miền Bắc'),
       ('trung', N'Miền Trung'),
       ('nam', N'Miền Nam');
GO

-- Insert dữ liệu vào bảng City
INSERT INTO city (id, region_id, Name)
VALUES ('hanoi', 'bac', N'Hà Nội'),
       ('danang', 'trung', N'Đà Nẵng'),
       ('hcm', 'nam', N'TP. Hồ Chí Minh');
GO

-- Insert dữ liệu vào bảng District
INSERT INTO District (id, city_id, Name)
VALUES ('caugiay', 'hanoi', N'Cầu Giấy'),
       ('hoankiem', 'hanoi', N'Hoàn Kiếm'),
       ('haichau', 'danang', N'Hải Châu'),
       ('sontra', 'danang', N'Sơn Trà'),
       ('quan1', 'hcm', N'Quận 1'),
       ('binhthanh', 'hcm', N'Bình Thạnh');
GO

-- Insert dữ liệu vào bảng Ward
INSERT INTO Ward (id, district_id, Name)
VALUES ('dichong', 'caugiay', N'Dịch Vọng'),
       ('hangtrong', 'hoankiem', N'Hàng Trống'),
       ('thachthang', 'haichau', N'Thạch Thang'),
       ('manthai', 'sontra', N'Mân Thái'),
       ('benghe', 'quan1', N'Bến Nghé'),
       ('hangxanh', 'binhthanh', N'Hàng Xanh');
GO

-- Insert dữ liệu vào bảng Address
INSERT INTO Address (id, Street, ward_id)
VALUES ('addr1', N'123 Đường Dịch Vọng', 'dichong'),
       ('addr2', N'456 Phố Hàng Trống', 'hangtrong'),
       ('addr3', N'789 Đường Thạch Thang', 'thachthang'),
       ('addr4', N'321 Đường Mân Thái', 'manthai'),
       ('addr5', N'654 Đường Bến Nghé', 'benghe');
GO   

-- Insert dữ liệu vào bảng Role
INSERT INTO Role (id, Name)
VALUES ('role1', N'Quản lý'),
       ('role2', N'Nhân viên bán hàng');
GO

-- Insert dữ liệu vào bảng [User]
INSERT INTO [User] (id, address_id, Name, DOB, UserName, Password, Phone_number, Image)
VALUES ('user1', 'addr1', N'Tran Van A', '1990-01-01', N'trunguyen', N'password123', N'0901234567', N'/images/avatar1.jpg'),
       ('user2', 'addr2', N'Nguyen Thi B', '1992-02-02', N'nguyenb', N'password123', N'0902345678', N'/images/avatar2.jpg'),
       ('user3', 'addr3', N'Le Van C', '1985-03-03', N'levanc', N'password123', N'0903456789', N'/images/avatar3.jpg');
GO

-- Insert dữ liệu vào bảng Customer
INSERT INTO Customer (id, user_id)
VALUES ('cus1', 'user1'),
       ('cus2', 'user2');
GO

-- Insert dữ liệu vào bảng Employee
INSERT INTO Employee (user_id, role_id)
VALUES ('user3', 'role1');
GO

-- Insert dữ liệu vào bảng Category
INSERT INTO Category (id, Name)
VALUES ('cat1', N'Mỹ phẩm'),
       ('cat2', N'Đồ gia dụng');
GO

-- Insert dữ liệu vào bảng Product
INSERT INTO Product (id, category_id, Name, Description, Price, Stock, Image)
VALUES ('prod1', 'cat1', N'Sữa rửa mặt', N'Sữa rửa mặt dịu nhẹ cho da nhạy cảm', 150000, 50, N'/images/prod1.jpg'),
       ('prod2', 'cat2', N'Máy hút bụi', N'Máy hút bụi công suất cao', 2500000, 20, N'/images/prod2.jpg');
GO

-- Insert dữ liệu vào bảng Supplier
INSERT INTO Supplier (id, Name, address_id)
VALUES ('supp1', N'Công ty Cung ứng ABC', 'addr4'),
       ('supp2', N'Công ty Cung ứng XYZ', 'addr5');
GO

-- Insert dữ liệu vào bảng Payment
INSERT INTO Payment (id, Name, Image)
VALUES ('pay1', N'Thanh toán qua thẻ', NULL),
       ('pay2', N'Thanh toán qua ví điện tử', NULL);
GO

-- Insert dữ liệu vào bảng Bill
INSERT INTO Bill (id, payment_id, Total, Order_date, Status)
VALUES ('bill1', 'pay1', 150000, '2024-01-01', N'Đã thanh toán'),
       ('bill2', 'pay2', 2500000, '2024-02-01', N'Chưa thanh toán');
GO

-- Insert dữ liệu vào bảng Buy_Product
INSERT INTO Buy_Product (bill_id, product_id, customer_id, Quantity)
VALUES ('bill1', 'prod1', 'cus1', 2),
       ('bill2', 'prod2', 'cus2', 1);
GO

-- Insert dữ liệu vào bảng Cart
INSERT INTO Cart (customer_id, product_id, Quantity)
VALUES ('cus1', 'prod1', 1),
       ('cus2', 'prod2', 2);
GO

-- Insert dữ liệu vào bảng Import_Bill
INSERT INTO Import_Bill (id, Products_name, Order_date)
VALUES ('impbill1', N'Sữa rửa mặt', '2024-01-10'),
       ('impbill2', N'Máy hút bụi', '2024-02-15');
GO

-- Insert dữ liệu vào bảng Import_Product
INSERT INTO Import_Product (import_bill_id, product_id, supplier_id, Quantity)
VALUES ('impbill1', 'prod1', 'supp1', 100),
       ('impbill2', 'prod2', 'supp2', 50);
GO
