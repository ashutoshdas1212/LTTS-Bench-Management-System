import { useEffect, useState } from "react";
import axios from "axios";

const Filters = ({ onFilterChange }) => {
  const [locations, setLocations] = useState([]);
  const [grades, setGrades] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/dropdown-options")
      .then(response => {
        setLocations(response.data.locations);
        setGrades(response.data.grades);
        setSkills(response.data.skills);
      })
      .catch(error => console.error("Error fetching dropdown options:", error));
  }, []);

  return (
    <div>
      <label>Location:</label>
      <select onChange={(e) => onFilterChange("location", e.target.value)}>
        <option value="">All</option>
        {locations.map((loc, index) => (
          <option key={index} value={loc}>{loc}</option>
        ))}
      </select>

      <label>Grade:</label>
      <select onChange={(e) => onFilterChange("cadre", e.target.value)}>
        <option value="">All</option>
        {grades.map((grade, index) => (
          <option key={index} value={grade}>{grade}</option>
        ))}
      </select>

      <label>Skill:</label>
      <select onChange={(e) => onFilterChange("skills", e.target.value)}>
        <option value="">All</option>
        {skills.map((skill, index) => (
          <option key={index} value={skill}>{skill}</option>
        ))}
      </select>
    </div>
  );
};

export default Filters;
