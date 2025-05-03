import { useState } from "react";
import EmployeeList from "./components/EmployeeList"; // ✅ Employee List Component
import axios from "axios";

function App() {
  const [employees, setEmployees] = useState([]);
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);

  // ✅ Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // ✅ Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploaded(true); // ✅ Move to employee list page after successful upload
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  // ✅ Fetch employees once file is uploaded
  useState(() => {
    if (uploaded) {
      axios
        .get("http://127.0.0.1:5000/employees")
        .then((response) => setEmployees(response.data))
        .catch((error) => console.error("Error fetching employees:", error));
    }
  }, [uploaded]);

  return (
    <div>
      <h1>Bench Resource Engagement Portal</h1>

      {/* ✅ File Upload Page */}
      {!uploaded ? (
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
      ) : (
        /* ✅ Show Employee List after successful upload */
        <EmployeeList employees={employees} />
      )}
    </div>
  );
}

export default App;
