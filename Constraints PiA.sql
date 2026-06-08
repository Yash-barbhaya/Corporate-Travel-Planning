select * from users where Department = 'finance'

SELECT Id, FromLocation, Destination, Status, UserId 
FROM TravelRequests;


UPDATE Users
SET Role = 'finance'
WHERE Id = 3;

ALTER TABLE Users 
DROP CONSTRAINT CK_Users_Role;

ALTER TABLE Users 
ADD CONSTRAINT CK_Users_Role CHECK (Role IN ('employee', 'manager', 'finance'));

SELECT name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('Users');
