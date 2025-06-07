import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; 


const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});


export const fetchAllEmployees = async () => {
  try {
    const response = await api.get("/employees");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return [];
  }
};


export const fetchFilteredEmployees = async (filters) => {
  try {
    const response = await api.get("/employees/filter", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching filtered employees:", error);
    return [];
  }
};


export const downloadSelectedProfiles = async (selectedPSNos) => {
  try {
    const response = await api.post("/employees/download", { ps_nos: selectedPSNos }, { responseType: "blob" });


    const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_profiles.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("❌ Error downloading profiles:", error);
  }
};

export default api;
