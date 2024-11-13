INSERT INTO [CSDLNC].[dbo].[User] 
    ([Id], [Id_address], [Name], [DOB], [UserName], [Password], [Phone_number], [Image], [rowguid])
VALUES 
    ('User8', -- Id: Unique identifier for the user
     'Addr6', -- Id_address: Foreign key referencing the Address table
     'John Doe', -- Name: Full name of the user
     '1990-01-01', -- DOB: Date of Birth in YYYY-MM-DD format
     'john.doe', -- UserName: Unique username for the user
     'hashed_password_here', -- Password: Hashed password for the user
     '0123456789', -- Phone_number: Phone number of the user
     'path/to/image.jpg', -- Image: Path to the user's image
      NEWID()); -- rowguid: Unique identifier for the row (using NEWID() to generate a new GUID)

INSERT INTO [CSDLNC].[dbo].[Customer] 
 VALUES ('Cus4','User8', NEWID()); -- rowguid: Unique identifier for the row (using NEWID() to generate a new GUID)