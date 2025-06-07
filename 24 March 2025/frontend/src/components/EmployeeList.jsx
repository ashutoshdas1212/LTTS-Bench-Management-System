import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { fetchAllEmployees } from "../services/api";
import "../styles/EmployeeList.css"; 

const EmployeeList = () => {
  const {
    data: employees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchAllEmployees,
  });

  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filters, setFilters] = useState({
    grade: "",
    baseLocation: "",
    skills: "",
    skillBucket: "", 
  });

  const [uniqueGrades, setUniqueGrades] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniqueSkills, setUniqueSkills] = useState([]);
  const [uniqueSkillBuckets, setUniqueSkillBuckets] = useState([]); 


  useEffect(() => {
    axios.get("http://127.0.0.1:5000/dropdown-options")
      .then(response => {
        setUniqueSkillBuckets(response.data.skill_buckets); 
      })
      .catch(error => console.error("Error fetching skill buckets:", error));
  }, []);


  useEffect(() => {
    if (employees) {
      console.log("API Response from /employees:", employees); 

      const grades = [...new Set(employees.map((emp) => emp.Grade))];
      const locations = [...new Set(employees.map((emp) => emp.Base_Location))];
      const allSkills = employees.flatMap((emp) =>
        emp.Skill_Matrix_System.split(",")
      );
      const skills = [...new Set(allSkills.map((skill) => skill.trim()))];

      setUniqueGrades(grades);
      setUniqueLocations(locations);
      setUniqueSkills(skills);

      let filteredData = employees;

      if (filters.grade) {
        filteredData = filteredData.filter(
          (emp) => emp.Grade === filters.grade
        );
      }
      if (filters.baseLocation) {
        filteredData = filteredData.filter(
          (emp) => emp.Base_Location === filters.baseLocation
        );
      }
      if (filters.skills.trim() !== "") {
        const skillList = filters.skills
          .split(",")
          .map((skill) => skill.trim().toLowerCase());
        filteredData = filteredData.filter((emp) => {
          const employeeSkills = emp.Skill_Matrix_System.toLowerCase();
          return skillList.every((skill) => employeeSkills.includes(skill));
        });
      }
      if (filters.skillBucket) { 
        filteredData = filteredData.filter(
          (emp) => emp.Skill_Bucket === filters.skillBucket
        );
      }

      setFilteredEmployees(filteredData);
      setCurrentPage(1);
    }
  }, [employees, filters]);

  if (isLoading) return <p>Loading employees...</p>;
  if (error) return <p>Error loading employees!</p>;

  const handleExportExcel = () => {
    axios.get("http://127.0.0.1:5000/employees/export-excel", { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "employees.xlsx"); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error exporting Excel file:", error);
        alert("Failed to export Excel file. Please try again.");
      });
  };

  const toggleStatus = (ps_no) => {
    console.log(`Toggling status for PS No: ${ps_no}`); 
    axios
      .post(`http://127.0.0.1:5000/employees/toggle-status/${ps_no}`)
      .then((response) => {
        console.log("API Response:", response.data); 
 
        setFilteredEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.PS_No === ps_no
              ? { ...emp, Status: response.data.new_status }
              : emp
          )
        );
      })
      .catch((error) => {
        console.error("Error updating status:", error); 
      });
  };

  const downloadResume = (driveLink) => {
    if (!driveLink) {
      alert("No resume link available.");
      return;
    }
  
    if (driveLink.includes("drive.google.com")) {
      const fileId = driveLink.match(/[-\w]{25,}/)?.[0];
      if (fileId) {
        const directDownloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
        window.open(directDownloadLink, "_blank");
      } else {
        alert("Invalid Google Drive link.");
      }
    } else {
      window.open(driveLink, "_blank");
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

  return (
    <div className="employee-container">
   
       <button onClick={handleExportExcel} className="export-excel-btn">
  Export Excel
</button>

    
      <div className="filters-container">
        <div className="filter-group">
          <label>Grade:</label>
          <select
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
          >
            <option value="">All</option>
            {uniqueGrades.map((grade, index) => (
              <option key={index} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Base Location:</label>
          <select
            onChange={(e) =>
              setFilters({ ...filters, baseLocation: e.target.value })
            }
          >
            <option value="">All</option>
            {uniqueLocations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Skills:</label>
          <input
            type="text"
            placeholder="Enter skills (comma-separated)"
            onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Skill Bucket:</label>
          <select
            onChange={(e) => setFilters({ ...filters, skillBucket: e.target.value })}
          >
            <option value="">All</option>
            {uniqueSkillBuckets.map((bucket, index) => (
              <option key={index} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
        </div>
      </div>


      <div className="records-per-page">
        <label>Records per page:</label>
        <select onChange={(e) => setRecordsPerPage(Number(e.target.value))}>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      
      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>PS No</th>
              <th>Name</th>
              <th>Grade</th>
              <th>Base Location</th>
              <th>Skill</th>
              <th>Skill Bucket</th>
              <th>Status</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((employee) => (
              <tr key={employee.PS_No}>
                <td>{employee.PS_No}</td>
                <td>{employee.Employee_Name}</td>
                <td>{employee.Grade}</td>
                <td>{employee.Base_Location}</td>
                <td>{employee.Skill_Matrix_System}</td>
                <td>{employee.Skill_Bucket}</td>
                <td>
                  <button className="toggle-btn" onClick={() => toggleStatus(employee.PS_No)}>
                    {employee.Status === "Bench" ?"Bench": "Not in Bench"}
                  </button>
                </td>
                <td>
                  <button className="download-btn" onClick={() => downloadResume(employee.Profile)}>
                    Download Resume
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    
      <div className="pagination-container">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeList;