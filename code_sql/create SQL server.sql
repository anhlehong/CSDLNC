-- Tạo cơ sở dữ liệu
CREATE DATABASE CSDLNC;
GO

USE CSDLNC;
GO

-- Tạo bảng Region
CREATE TABLE Region (
    Id VARCHAR(255) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL
);

-- Tạo bảng City
CREATE TABLE City (
    Id VARCHAR(255) PRIMARY KEY,
    Id_region VARCHAR(255) FOREIGN KEY REFERENCES Region(Id),
    Name NVARCHAR(100) NOT NULL
);

-- Tạo bảng District
CREATE TABLE District (
    Id VARCHAR(255) PRIMARY KEY,
    Id_city VARCHAR(255) FOREIGN KEY REFERENCES City(Id),
    Name NVARCHAR(100) NOT NULL
);

-- Tạo bảng Ward
CREATE TABLE Ward (
    Id VARCHAR(255) PRIMARY KEY,
    Id_district VARCHAR(255) FOREIGN KEY REFERENCES District(Id),
    Name NVARCHAR(100) NOT NULL
);

-- Tạo bảng Address
CREATE TABLE Address (
    Id VARCHAR(255) PRIMARY KEY,
    Street NVARCHAR(255),
    Id_ward VARCHAR(255) FOREIGN KEY REFERENCES Ward(Id)
);

-- Tạo bảng Role
CREATE TABLE Role (
    Id VARCHAR(255) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL
);

-- Tạo bảng User
CREATE TABLE [User] (
    Id VARCHAR(255) PRIMARY KEY,
    Id_address VARCHAR(255) FOREIGN KEY REFERENCES Address(Id),
    Name NVARCHAR(100) NOT NULL,
    DOB DATE,
    UserName NVARCHAR(100) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Phone_number NVARCHAR(20),
    Image NVARCHAR(255)
);

-- Tạo bảng Customer
CREATE TABLE Customer (
    Id VARCHAR(255) PRIMARY KEY,
    Id_user VARCHAR(255) FOREIGN KEY REFERENCES [User](Id)
);

-- Tạo bảng Employee
CREATE TABLE Employee (
    Id_user VARCHAR(255) PRIMARY KEY FOREIGN KEY REFERENCES [User](Id),
    Id_role VARCHAR(255) FOREIGN KEY REFERENCES Role(Id)
);

-- Tạo bảng Category
CREATE TABLE Category (
    Id VARCHAR(255) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL
);

-- Tạo bảng Product
CREATE TABLE Product (
    Id VARCHAR(255) PRIMARY KEY,
    Id_category VARCHAR(255) FOREIGN KEY REFERENCES Category(Id),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    Price DECIMAL(18, 2) NOT NULL,
    Stock INT NOT NULL,
    Image NVARCHAR(255)
);

-- Tạo bảng Supplier
CREATE TABLE Supplier (
    Id VARCHAR(255) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Id_address VARCHAR(255) FOREIGN KEY REFERENCES Address(Id)
);

-- Tạo bảng Payment
CREATE TABLE Payment (
    Id VARCHAR(255) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Image NVARCHAR(255)
);

-- Tạo bảng Bill
CREATE TABLE Bill (
    Id VARCHAR(255) PRIMARY KEY,
    Id_payment VARCHAR(255) FOREIGN KEY REFERENCES Payment(Id),
    Total DECIMAL(18, 2) NOT NULL,
    Order_date DATE NOT NULL,
    Status NVARCHAR(100)
);

-- Tạo bảng Buy_Product
CREATE TABLE Buy_Product (
    Id_Bill VARCHAR(255) FOREIGN KEY REFERENCES Bill(Id),
    Id_product VARCHAR(255) FOREIGN KEY REFERENCES Product(Id),
    Id_customer VARCHAR(255) FOREIGN KEY REFERENCES Customer(Id),
    Quantity INT NOT NULL,
    PRIMARY KEY(Id_Bill, Id_product, Id_customer)
);

-- Tạo bảng Cart
CREATE TABLE Cart (
    Id_customer VARCHAR(255) FOREIGN KEY REFERENCES Customer(Id),
    Id_product VARCHAR(255) FOREIGN KEY REFERENCES Product(Id),
    Quantity INT NOT NULL,
    PRIMARY KEY(Id_customer, Id_product)
);

-- Tạo bảng Import_Bill
CREATE TABLE Import_Bill (
    Id VARCHAR(255) PRIMARY KEY,
    Products_name NVARCHAR(255) NOT NULL,
    Order_date DATE NOT NULL
);

-- Tạo bảng Import_Product
CREATE TABLE Import_Product (
    Id_import_bill VARCHAR(255) FOREIGN KEY REFERENCES Import_Bill(Id),
    Id_product VARCHAR(255) FOREIGN KEY REFERENCES Product(Id),
    Id_supplier VARCHAR(255) FOREIGN KEY REFERENCES Supplier(Id),
    Quantity INT NOT NULL,
    PRIMARY KEY(Id_import_bill, Id_product, Id_supplier)
);

GO
