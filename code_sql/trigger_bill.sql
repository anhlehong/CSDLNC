CREATE TRIGGER trg_sync_buy_product_to_mongo
ON dbo.Buy_Product
AFTER INSERT
AS
BEGIN
    DECLARE @BillId VARCHAR(255),
            @ProductId VARCHAR(255),
            @CustomerId VARCHAR(255),
            @Quantity INT,
            @Price DECIMAL(18, 2),
            @UserName NVARCHAR(100),
            @PhoneNumber NVARCHAR(20);

    -- L?y thông tin t? b?ng Buy_Product và liên k?t v?i các b?ng khác
    SELECT 
        @BillId = bp.Id_Bill,
        @ProductId = bp.Id_product,
        @CustomerId = bp.Id_customer,
        @Quantity = bp.Quantity,
        @Price = p.Price,
        @UserName = u.UserName,
        @PhoneNumber = u.Phone_number
    FROM INSERTED bp
    INNER JOIN dbo.Customer c ON bp.Id_customer = c.Id
    INNER JOIN dbo.[User] u ON c.Id_user = u.Id
    INNER JOIN dbo.Product p ON bp.Id_product = p.Id;

    -- G?i d? li?u thô t?i Node.js API d? x? lý JSON
    DECLARE @url NVARCHAR(2000) = 'http://localhost:5000/api/sync-bill';
    DECLARE @postData NVARCHAR(MAX);

    SET @postData = '{
        "BillId": "' + ISNULL(@BillId, '') + '",
        "ProductId": "' + ISNULL(@ProductId, '') + '",
        "CustomerId": "' + ISNULL(@CustomerId, '') + '",
        "Quantity": ' + CAST(@Quantity AS NVARCHAR(20)) + ',
        "Price": ' + CAST(@Price AS NVARCHAR(20)) + ',
        "UserName": "' + ISNULL(@UserName, '') + '",
        "PhoneNumber": "' + ISNULL(@PhoneNumber, '') + '"
    }';

    -- G?i d? li?u t?i API
    DECLARE @Object INT;
    EXEC sp_OACreate 'MSXML2.ServerXMLHTTP', @Object OUT;
    EXEC sp_OAMethod @Object, 'open', NULL, 'POST', @url, 'false';
    EXEC sp_OAMethod @Object, 'setRequestHeader', NULL, 'Content-Type', 'application/json';
    EXEC sp_OAMethod @Object, 'send', NULL, @postData;
    EXEC sp_OADestroy @Object;
END;
