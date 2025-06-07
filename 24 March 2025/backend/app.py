from flask import Flask, jsonify, request, send_file
from flask_cors import CORS  
import pandas as pd
import mysql.connector
import os
import pandas as pd
from flask import send_file

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  


db_config = {
    "host": "localhost",
    "user": "root",
    "password": "123@",  
    "database": "benchresource"
}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  


UPLOADED_FILE_NAME = None
ORIGINAL_FILE_PATH = None 


@app.route("/upload", methods=["POST"])
def upload_file():
    global UPLOADED_FILE_NAME, ORIGINAL_FILE_PATH

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

   
    UPLOADED_FILE_NAME = file.filename
    ORIGINAL_FILE_PATH = file_path 

    
    print(f"Original file path: {ORIGINAL_FILE_PATH}")

    
    try:
        df = pd.read_excel(file_path)
        return jsonify({"message": "File uploaded successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def setup_database():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

      
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS employee_data (
            PS_No VARCHAR(20) PRIMARY KEY,
            Employee_Name VARCHAR(255),
            Skill_Matrix_System LONGTEXT,
            Grade VARCHAR(255),
            Base_Location VARCHAR(255),
            Profile TEXT,
            Status VARCHAR(255),  
            Skill_Bucket VARCHAR(255)
        )
        """)

        connection.commit()
        print(" Table 'employee_data' is ready!")

    except mysql.connector.Error as err:
        print(f"Error setting up database: {err}")

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()




def load_excel_to_mysql():
    file_path = "filtered_output_fixed.xlsx"
    if not os.path.exists(file_path):
        print(f" Error: File {file_path} not found!")
        return

    df = pd.read_excel(file_path)

  
    df.rename(columns={
        'PS No': 'PS_No',
        'Employee Name': 'Employee_Name',
        'Skill Matrix (System)': 'Skill_Matrix_System',
        'Base Location': 'Base_Location',
        'Skill Bucket': 'Skill_Bucket'
    }, inplace=True)

    required_columns = {'PS_No', 'Employee_Name', 'Skill_Matrix_System', 'Grade', 'Base_Location', 'Profile', 'Status', 'Skill_Bucket'}
    if not required_columns.issubset(df.columns):
        print(f" Missing required columns! Found: {df.columns}")
        return

    df = df.fillna("")

    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

    
        cursor.execute("DELETE FROM employee_data")
        connection.commit()

        for _, row in df.iterrows():
            try:
                cursor.execute("""
                INSERT INTO employee_data (PS_No, Employee_Name, Skill_Matrix_System, Grade, Base_Location, Profile, Status, Skill_Bucket)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                Employee_Name = VALUES(Employee_Name),
                Skill_Matrix_System = VALUES(Skill_Matrix_System),
                Grade = VALUES(Grade),
                Base_Location = VALUES(Base_Location),
                Profile = VALUES(Profile),
                Status = VALUES(Status),
                Skill_Bucket = VALUES(Skill_Bucket)
                """, (row['PS_No'], row['Employee_Name'], row['Skill_Matrix_System'], row['Grade'], row['Base_Location'], row['Profile'], row['Status'], row['Skill_Bucket']))
            except mysql.connector.Error as err:
                print(f" Error inserting row: {err}")

        connection.commit()
        print(" Data inserted successfully!")

    except mysql.connector.Error as err:
        print(f" Database error: {err}")

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()


@app.route('/employees', methods=['GET'])
def get_all_employees():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM employee_data")
        employees = cursor.fetchall()
        
        print("API Response from Flask:", employees) 

        return jsonify(employees)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)})

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()



@app.route('/employees/filter', methods=['GET'])
def filter_employees():
    cadre_level = request.args.get('cadre')
    location = request.args.get('location')
    skill_keywords = request.args.get('skills')

    query = "SELECT DISTINCT * FROM employee_data WHERE 1=1"
    params = []

    if cadre_level:
        query += " AND Grade LIKE %s"
        params.append(f"%{cadre_level}%")

    if location:
        query += " AND Base_Location LIKE %s"
        params.append(f"%{location}%")

    if skill_keywords:
        skills = skill_keywords.split(',')
        skill_conditions = " AND ".join(["Skill_Matrix_System LIKE %s"] * len(skills))
        query += f" AND ({skill_conditions})"
        params.extend([f"%{skill.strip()}%" for skill in skills])

    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        employees = cursor.fetchall()

        unique_employees = {emp["PS_No"]: emp for emp in employees}.values()

        return jsonify(list(unique_employees))

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)})

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()



@app.route('/dropdown-options', methods=['GET'])
def get_dropdown_options():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

       
        cursor.execute("SELECT DISTINCT Base_Location FROM employee_data WHERE Base_Location != ''")
        locations = [row['Base_Location'] for row in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT Grade FROM employee_data WHERE Grade != ''")
        grades = [row['Grade'] for row in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT Skill_Bucket FROM employee_data WHERE Skill_Bucket != ''")
        skill_buckets = [row['Skill_Bucket'] for row in cursor.fetchall()]  

        cursor.execute("SELECT DISTINCT Skill_Matrix_System FROM employee_data WHERE Skill_Matrix_System != ''")
        skills = [row['Skill_Matrix_System'] for row in cursor.fetchall()]  

        print("Dropdown API Response:", {
            "locations": locations, 
            "grades": grades, 
            "skill_buckets": skill_buckets, 
            "skills": skills
        })  

        return jsonify({
            "locations": locations,
            "grades": grades,
            "skill_buckets": skill_buckets,
            "skills": skills
        })

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)})

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()




@app.route('/employees/download', methods=['POST'])
def download_selected_profiles():
    try:
        selected_ps_nos = request.json.get("ps_nos", [])
        if not selected_ps_nos:
            return jsonify({"error": "No employees selected"}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        query = "SELECT * FROM employee_data WHERE PS_No IN ({})".format(
            ', '.join(['%s'] * len(selected_ps_nos))
        )
        cursor.execute(query, selected_ps_nos)
        employees = cursor.fetchall()

        df = pd.DataFrame(employees)
        file_path = "selected_profiles.xlsx"
        df.to_excel(file_path, index=False)

        return send_file(file_path, as_attachment=True)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)})

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()

def update_excel_status(ps_no, new_status):
    try:
        if not ORIGINAL_FILE_PATH:
            print(" No file uploaded.")
            return False

        
        df_original = pd.read_excel(ORIGINAL_FILE_PATH)


        if 'PS No' not in df_original.columns or 'Status' not in df_original.columns:
            print(" Required columns ('PS No' or 'Status') not found in the original Excel file.")
            return False

       
        df_original.loc[df_original['PS No'] == ps_no, 'Status'] = new_status

        
        df_original.to_excel(ORIGINAL_FILE_PATH, index=False)
        print(f" Updated original Excel file for PS No: {ps_no} with status: {new_status}")
        return True

    except Exception as e:
        print(f" Error updating Excel file: {e}")
        return False

@app.route('/employees/export-excel', methods=['GET'])
def export_excel():
    try:
        if not ORIGINAL_FILE_PATH:
            return jsonify({"error": "No file uploaded"}), 404

   
        original_df = pd.read_excel(ORIGINAL_FILE_PATH)
        
       
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT PS_No, Status FROM employee_data")
        status_updates = {str(row['PS_No']): row['Status'] for row in cursor.fetchall()}
        
      
        original_df['PS No'] = original_df['PS No'].astype(str)
        
      
        if 'Status' in original_df.columns:
           
            original_df['Status'] = original_df['PS No'].map(status_updates)
            
            
            original_df['Status'] = original_df['Status'].fillna('Bench')  
        
   
        output_path = os.path.join(UPLOAD_FOLDER, "updated_status.xlsx")
        
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            original_df.to_excel(writer, index=False, sheet_name='Sheet1')
        
        return send_file(
            output_path, 
            as_attachment=True, 
            download_name=UPLOADED_FILE_NAME,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    except Exception as e:
        print(f" Error exporting Excel: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()


@app.route('/employees/toggle-status/<ps_no>', methods=['POST'])
def toggle_bench_status(ps_no):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

   
        cursor.execute("SELECT Status FROM employee_data WHERE PS_No = %s", (ps_no,))
        current_status = cursor.fetchone()[0]
        new_status = "Not in Bench" if current_status == "Bench" else "Bench"

       
        cursor.execute("UPDATE employee_data SET Status = %s WHERE PS_No = %s", (new_status, ps_no))
        connection.commit()

        return jsonify({
            "message": "Status updated successfully",
            "new_status": new_status
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if connection and connection.is_connected():
            connection.close()




if __name__ == '__main__':
    print(" Connecting to MySQL and setting up database...")
    setup_database()
    load_excel_to_mysql()
    print(" Flask Backend is Running!")
    app.run(debug=True)
