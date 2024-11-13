USE CSDLNC
GO

CREATE TRIGGER trg_sync_customer_to_mongo
ON dbo.Customer
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    PRINT 'Trigger trg_sync_customer_to_mongo started';

    DECLARE @CustomerId VARCHAR(255), @UserId VARCHAR(255), 
            @UserName NVARCHAR(100), @Password NVARCHAR(255), 
            @PhoneNumber NVARCHAR(20), @DOB DATE, @Image NVARCHAR(255),
            @Street NVARCHAR(255), @Ward NVARCHAR(100), 
            @District NVARCHAR(100), @City NVARCHAR(100), 
            @Region NVARCHAR(100), @Action NVARCHAR(50), @Name NVARCHAR(255);

    IF EXISTS (SELECT * FROM INSERTED) AND EXISTS (SELECT * FROM DELETED)
    BEGIN
        -- Case for UPDATE
        SET @Action = 'UPDATE';
    END
    ELSE IF EXISTS (SELECT * FROM INSERTED)
    BEGIN
        -- Case for INSERT
        SET @Action = 'INSERT';
    END
    ELSE IF EXISTS (SELECT * FROM DELETED)
    BEGIN
        -- Case for DELETE
        SET @Action = 'DELETE';
    END

    -- Chỉ thực hiện khi hành động là INSERT hoặc UPDATE
    IF @Action IN ('INSERT', 'UPDATE')
    BEGIN
        SELECT 
            @CustomerId = i.Id,
            @UserId = u.Id,
            @Name = u.Name,
            @UserName = u.UserName,
            @Password = u.Password,
            @PhoneNumber = u.Phone_number,
            @DOB = u.DOB,
            @Image = u.Image,
            @Street = a.Street,
            @Ward = w.Name,
            @District = d.Name,
            @City = c.Name,
            @Region = r.Name
        FROM INSERTED i
        INNER JOIN dbo.[User] u ON i.Id_user = u.Id
        INNER JOIN dbo.Address a ON u.Id_address = a.Id
        INNER JOIN dbo.Ward w ON a.Id_ward = w.Id
        INNER JOIN dbo.District d ON w.Id_district = d.Id
        INNER JOIN dbo.City c ON d.Id_city = c.Id
        INNER JOIN dbo.Region r ON c.Id_region = r.Id;
    END
    ELSE IF @Action = 'DELETE'
    BEGIN
        SELECT 
            @CustomerId = d.Id
        FROM DELETED d;
    END

    DECLARE @url NVARCHAR(2000) = 'http://localhost:5000/api/sync-customer';
    DECLARE @postData NVARCHAR(MAX);
    
    SET @postData = '{
        "CustomerId": "' + ISNULL(@CustomerId, '') + '",
        "UserId": "' + COALESCE(@UserId, '') + '",
        "Name": "' + COALESCE(@Name, '') + '",
        "UserName": "' + COALESCE(@UserName, '') + '",
        "Password": "' + COALESCE(@Password, '') + '",
        "Phone_number": "' + COALESCE(@PhoneNumber, '') + '",
        "DOB": "' + COALESCE(CAST(@DOB AS NVARCHAR(50)), '') + '",
        "Image": "' + COALESCE(@Image, '') + '",
        "Street": "' + COALESCE(@Street, '') + '",
        "Ward": "' + COALESCE(@Ward, '') + '",
        "District": "' + COALESCE(@District, '') + '",
        "City": "' + COALESCE(@City, '') + '",
        "Region": "' + COALESCE(@Region, '') + '",
        "Action": "' + @Action + '"
    }';
    
    DECLARE @Object INT;
    EXEC sp_OACreate 'MSXML2.ServerXMLHTTP', @Object OUT;
    EXEC sp_OAMethod @Object, 'open', NULL, 'POST', @url, 'false';
    EXEC sp_OAMethod @Object, 'setRequestHeader', NULL, 'Content-Type', 'application/json';
    EXEC sp_OAMethod @Object, 'send', NULL, @postData;
    EXEC sp_OADestroy @Object;

    PRINT 'Trigger trg_sync_customer_to_mongo finished';
END;
GO

-- Enable OLE Automation Procedures
sp_configure 'show advanced options', 1;
GO
RECONFIGURE;
GO
sp_configure 'Ole Automation Procedures', 1;
GO
RECONFIGURE;
GO
