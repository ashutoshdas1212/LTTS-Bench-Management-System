drop database benchresource;
CREATE DATABASE IF NOT EXISTS benchresource;
USE benchresource;

DROP TABLE IF EXISTS employee_data;
CREATE TABLE IF NOT EXISTS employee_data (
    PS_No VARCHAR(255) PRIMARY KEY,
    Employee_Name VARCHAR(255),
    Skill_Matrix_System LONGTEXT,
    Grade VARCHAR(255),
    Base_Location VARCHAR(255),
    Profile TEXT,
    Status VARCHAR(255),
    Skill_Bucket VARCHAR(255)
);

select * from employee_data;

SELECT DISTINCT Skill_Bucket FROM employee_data;
SELECT DISTINCT Skill_Matrix_System FROM employee_data;
SELECT DISTINCT Base_Location FROM employee_data;
SELECT DISTINCT Grade FROM employee_data;

SELECT DISTINCT Skill_Matrix_System FROM employee_data WHERE Skill_Matrix_System != '';
UPDATE employee_data SET Skill_Matrix_System = '' WHERE Skill_Matrix_System IS NULL;





DESC employee_data;

-- ALTER TABLE employee_data MODIFY COLUMN Skill_Matrix_System TEXT;

SELECT PS_No, COUNT(*) 
FROM employee_data 
GROUP BY PS_No 
HAVING COUNT(*) > 1;


SELECT PS_No, Status FROM employee_data;

