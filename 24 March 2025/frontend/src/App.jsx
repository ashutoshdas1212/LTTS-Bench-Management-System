import { useState } from "react";
import EmployeeList from "./components/EmployeeList"; 
import axios from "axios";

function App() {
  const [employees, setEmployees] = useState([]);
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };


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

      setUploaded(true); 
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

 
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

 
      {!uploaded ? (
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
      ) : (
      
        <EmployeeList employees={employees} />
      )}
    </div>
  );
}

export default App;
