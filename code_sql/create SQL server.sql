-- Tạo cơ sở dữ liệu
CREATE DATABASE csdl_nc;
GO

USE csdl_nc;
GO

-- Tạo bảng region
CREATE TABLE region (
    id VARCHAR(255) PRIMARY KEY,
    name NVARCHAR(100) UNIQUE NOT NULL  -- Giảm từ 255 xuống 100
);

-- Tạo bảng city
CREATE TABLE city (
    id VARCHAR(255) PRIMARY KEY,
    region_id VARCHAR(255), 
    name NVARCHAR(100) NOT NULL,  -- Giảm từ 255 xuống 100
    FOREIGN KEY (region_id) REFERENCES region(id)
);

-- Tạo bảng district
CREATE TABLE district (
    id VARCHAR(255) PRIMARY KEY,
    city_id VARCHAR(255), 
    name NVARCHAR(100) NOT NULL,  -- Giảm từ 255 xuống 100
    FOREIGN KEY (city_id) REFERENCES city(id)
);

-- Tạo bảng ward
CREATE TABLE ward (
    id VARCHAR(255) PRIMARY KEY,
    district_id VARCHAR(255),
    name NVARCHAR(100) NOT NULL,  -- Giảm từ 255 xuống 100
    FOREIGN KEY (district_id) REFERENCES district(id)
);

-- Tạo bảng address
CREATE TABLE address (
    id VARCHAR(255) PRIMARY KEY,
    street NVARCHAR(255),  -- Giữ nguyên vì có thể dài
    ward_id VARCHAR(255),
    FOREIGN KEY (ward_id) REFERENCES ward(id)
);

-- Tạo bảng role
CREATE TABLE role (
    id VARCHAR(255) PRIMARY KEY,
    name NVARCHAR(100) UNIQUE NOT NULL  -- Giảm từ 255 xuống 100
);

-- Tạo bảng user
CREATE TABLE [user] (
    id VARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    dob DATE,
    username NVARCHAR(100) UNIQUE NOT NULL,  -- Giảm từ 255 xuống 100
    password NVARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),  -- Đúng kích thước cho số điện thoại
    image NVARCHAR(255),
    address_id VARCHAR(255) UNIQUE,
    FOREIGN KEY (address_id) REFERENCES address(id)
);

-- Tạo bảng customer
CREATE TABLE customer (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) FOREIGN KEY REFERENCES [user](id)
);

-- Tạo bảng employee
CREATE TABLE employee (
    user_id VARCHAR(255) PRIMARY KEY FOREIGN KEY REFERENCES [user](id),
    role_id VARCHAR(255) FOREIGN KEY REFERENCES role(id)
);

-- Tạo bảng category
CREATE TABLE category (
    id VARCHAR(255) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL  -- Giảm từ 255 xuống 100
);

-- Tạo bảng product
CREATE TABLE product (
    id VARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000),  -- Giữ nguyên vì mô tả có thể dài
    price DECIMAL(18, 2) NOT NULL,
    stock INT NOT NULL,
    image NVARCHAR(255),
    category_id VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

-- Tạo bảng supplier
CREATE TABLE supplier (
    id VARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    address_id VARCHAR(255) UNIQUE,
    FOREIGN KEY (address_id) REFERENCES address(id)
);

-- Tạo bảng payment
CREATE TABLE payment (
    id VARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    image NVARCHAR(255)
);

-- Tạo bảng bill
CREATE TABLE bill (
    id VARCHAR(255) PRIMARY KEY,
    payment_id VARCHAR(255) FOREIGN KEY REFERENCES payment(id),
    total DECIMAL(18, 2) NOT NULL,
    order_date DATE NOT NULL,
    status NVARCHAR(100)  -- Giảm từ 255 xuống 100
);

-- Tạo bảng buy_product
CREATE TABLE buy_product (
    bill_id VARCHAR(255) FOREIGN KEY REFERENCES bill(id),
    product_id VARCHAR(255) FOREIGN KEY REFERENCES product(id),
    customer_id VARCHAR(255) FOREIGN KEY REFERENCES customer(id),
    quantity INT NOT NULL,
    PRIMARY KEY(bill_id, product_id, customer_id)
);

-- Tạo bảng cart
CREATE TABLE cart (
    customer_id VARCHAR(255) FOREIGN KEY REFERENCES customer(id),
    product_id VARCHAR(255) FOREIGN KEY REFERENCES product(id),
    quantity INT NOT NULL,
    PRIMARY KEY(customer_id, product_id)
);

-- Tạo bảng import_bill
CREATE TABLE import_bill (
    id VARCHAR(255) PRIMARY KEY,
    products_name NVARCHAR(255) NOT NULL,
    order_date DATE NOT NULL
);

-- Tạo bảng import_product
CREATE TABLE import_product (
    import_bill_id VARCHAR(255) FOREIGN KEY REFERENCES import_bill(id),
    product_id VARCHAR(255) FOREIGN KEY REFERENCES product(id),
    supplier_id VARCHAR(255) FOREIGN KEY REFERENCES supplier(id),
    quantity INT NOT NULL,
    PRIMARY KEY(import_bill_id, product_id, supplier_id)
);

GO
