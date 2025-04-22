import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = 'https://daily-quest-backend.vercel.app';

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all questions, images, and videos?')) {
      try {
        const response = await fetch(`${BASE_URL}/api/delete-all`, {  // Removed /api
          method: 'DELETE',
        });
  
        if (response.ok) {
          setMessage("✅ All files deleted successfully!");
          setJsonData(null); // Clear JSON view too
          setFile(null);     // Reset uploaded file
          navigate("/go-back");
        } else {
          setMessage("❌ Failed to delete files.");
         
        }
      } catch (error) {
        console.error(error);
        setMessage("❌ Error deleting files.");
        
      }
    }
  };
  
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setJsonData(null); // Reset JSON data on file change
  };

  const handleConvert = (e) => {
    e.preventDefault(); // Prevent page refresh

    if (!file) {
      setMessage("❌ Please upload a file first.");
      return;
    }

    // Initialize FileReader to read the Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Get the first sheet

        // Convert sheet data to JSON
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const headers = data[0]; // The first row will be the headers
        const questions = data.slice(1).map((row) => {
          const question = {};
          headers.forEach((header, index) => {
            question[header] = row[index];
          });
          return question;
        });

        // Optional: Ensure 'Option 4' exists
        questions.forEach((q) => {
          if (!q["Option 4"]) q["Option 4"] = null;
        });

        // Save the JSON data to state
        setJsonData(questions);
        setMessage("✅ File successfully converted!");
      } catch (error) {
        console.error(error);
        setMessage("❌ Error processing the file.");
      }
    };

    reader.readAsBinaryString(file); // Read the file
  };

  // Function to save the JSON data to the server
  const handleSave = async () => {
    if (!jsonData) {
      setMessage("❌ No data to save.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/save-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        setMessage("✅ Data successfully saved!");
        navigate("/go-back"); // Redirect on success
      } else {
        setMessage("❌ Error saving the file.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error saving the file.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Upload and Convert Excel to JSON</h1>

      <form onSubmit={handleConvert} className="w-full max-w-md">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="border border-gray-400 p-2 rounded mb-4 w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mb-4 w-full disabled:opacity-50"
        >
          Convert
        </button>

        {/* Display the converted JSON data */}
      {jsonData && (
        <div className="mt-6 p-4 bg-white rounded shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Converted JSON Data</h2>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}

      {/* Save button */}
      {jsonData && (
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mt-4 w-full disabled:opacity-50"
        >
          Save
        </button>
      )}


        <div className="flex gap-4 pt-4 justify-center">
        <Link to="/zip">
            <button className="bg-blue-600 hover:bg-blue-700 rounded-lg text-white px-6 py-2 rounded mb-4 w-full disabled:opacity-50">
              Upload Zip Files
            </button>
          </Link>
          <Link to="">
          <button
           onClick={handleDeleteAll}
          className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
          >
          Delete all files
          </button>
          </Link>
      </div>
        
      </form>

      {message && (
        <div
          className={`text-lg text-center ${message.includes("❌hg") ? "text-red-600" : "text-green-600"} mb-4`}
        >
          {message}
        </div>
      )}

      
    </div>
  );
};

export default Upload;
