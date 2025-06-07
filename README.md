Video Link:https://drive.google.com/file/d/1n3JorfxtPVB_Dt-y06dc0h8M0N8w-VSz/view?usp=sharing


So, as you can see, I was told to build a Bench Management System for employees to make it easier for the person to upload the Excel sheet which is here (bt.xlsx) and extract the data from bt.xlsx to show it in the UI. The sheet contains all details of employees, but we needed only some columns in the UI, which were needed as we required only some important details.

We have made the backend using Python Flask and the frontend using React. So, it is a full-stack project which extracts data from the sheet and puts it into a MySQL table. It extracts data in an intelligent way that matches the columns of the Excel sheet with the columns of the MySQL table and inserts the data into the MySQL table. This data is shown in specific columns in the frontend.

We have given a clean, beautiful UI which fetches the data dynamically from each column and shows it as options in the filter.

Also, you can see each row has a toggle button which is used to change from "Bench" to "NOT IN BENCH," and also for each row/employee, we have a download resume button which is used for downloading the employee's resume.

So, we can see in the video that the employee which I had marked as "Not in Bench" can be displayed in the Excel sheet.

Also, when I delete any column in the Excel sheet and upload it, it gets the data and shows it in the UI, which shows that it is an intelligent system and it can fetch the required data from the given Excel sheet irrespective of how many columns there are. Our aim was also to allow different column names, and it recognizes and matches them with the column names of the MySQL table, inserts the data, and shows it in the UI.

# Bench Management System

A full-stack application for managing employee bench status with Excel upload capabilities, dynamic filtering, and resume downloads.

##  Project Overview

This system was designed to simplify bench management by allowing HR to:
1. Upload Excel sheets (`bt.xlsx`) containing employee data
2. Automatically extract and display only the required columns in a clean UI
3. Dynamically filter employees by grade, location, skills, and skill buckets
4. Toggle bench status with real-time updates
5. Download employee resumes directly from the interface

The intelligent backend:
- Matches Excel columns with MySQL table columns regardless of column order
- Handles missing columns gracefully
- Preserves data integrity during updates
- Exports updated statuses back to Excel

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TanStack Query, Axios
- **Backend**: Python Flask, MySQL
- **Data Processing**: Pandas, OpenPyXL

## ✨ Key Features

### Intelligent Excel Processing
- Auto-detects and maps Excel columns to database fields
- Handles variations in column names (e.g., "PS No" → "PS_No")
- Preserves original Excel structure while updating statuses

### Dynamic Employee Management
```jsx
// Example from EmployeeList.jsx
const toggleStatus = (ps_no) => {
  axios.post(`/employees/toggle-status/${ps_no}`)
    .then(response => {
      setFilteredEmployees(prev => 
        prev.map(emp => emp.PS_No === ps_no 
          ? {...emp, Status: response.data.new_status} 
          : emp
        )
      );
    });
};
