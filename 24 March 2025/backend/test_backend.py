import requests
import json

BASE_URL = "http://127.0.0.1:5000"  # Change if your Flask server is running elsewhere

# ✅ Test Fetch All Employees API
def test_get_all_employees():
    response = requests.get(f"{BASE_URL}/employees")
    print("\n🔹 Test: Get All Employees")
    print(response.json())

# ✅ Test Filter Employees API
def test_filter_employees():
    params = {
        "cadre": "LTTS-3",  # Change as per data
        "location": "Mysore",  # Change as per data
        "skills": "DevOps,React"  # Change as per data
    }
    response = requests.get(f"{BASE_URL}/employees/filter", params=params)
    print("\n🔹 Test: Filter Employees")
    print(response.json())

# ✅ Test Download Selected Employee Profiles API
def test_download_selected_profiles():
    data = {
        "ps_nos": ["12345", "67890"]  # Replace with actual PS_No values from your database
    }
    response = requests.post(f"{BASE_URL}/employees/download", json=data)
    if response.status_code == 200:
        with open("downloaded_profiles.xlsx", "wb") as file:
            file.write(response.content)
        print("\n✅ Profiles downloaded successfully as 'downloaded_profiles.xlsx'")
    else:
        print("\n❌ Error in downloading profiles:", response.json())

# ✅ Run All Tests
if __name__ == "__main__":
    test_get_all_employees()
    test_filter_employees()
    test_download_selected_profiles()
