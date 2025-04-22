import React, { useState } from "react";
import JSZip from "jszip";
import { useNavigate } from "react-router-dom";

const UploadZip = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = 'https://daily-quest-backend.vercel.app';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setExtractedData(null); // Reset data when file is changed
  };

  const handleConvert = (e) => {
    e.preventDefault(); // Prevent page refresh

    if (!file) {
      setMessage("❌ Please upload a zip file first.");
      return;
    }

    // Initialize JSZip to read the zip file
    const reader = new FileReader();
    reader.onload = (e) => {
      const zip = new JSZip();
      zip.loadAsync(e.target.result).then((zipContent) => {
        let imgFiles = [];
        let videoFiles = [];

        // Iterate through the zip content
        zip.forEach((relativePath, file) => {
          if (file.name.includes("Img/")) {
            imgFiles.push(file.name);
          } else if (file.name.includes("video/")) {
            videoFiles.push(file.name);
          }
        });

        // Store the file names in state
        setExtractedData({ imgFiles, videoFiles });
        setMessage("✅ Files successfully extracted!");
        setMessage(imgFiles, videoFiles);
      });
    };

    reader.readAsArrayBuffer(file); // Read the zip file as an array buffer
  };

  const handleSave = async () => {
    if (!file) {
      setMessage("❌ No file to save.");
      return;
    }
  
    const formData = new FormData();
    formData.append("zipFile", file); // same name as multer expects
  
    try {
      const response = await fetch(`${BASE_URL}/api/upload-zip`, {
        method: "POST",
        body: formData, // ✅ NO Content-Type manually
      });
  
      if (response.ok) {
        setMessage("✅ Files successfully uploaded and saved!");
        navigate("/go-back");
      } else {
        setMessage("❌ Error uploading the file.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error uploading the file.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Upload and Extract Zip Folder</h1>

      <form onSubmit={handleConvert} className="w-full max-w-md">
        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="border border-gray-400 p-2 rounded mb-4 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mb-4 w-full disabled:opacity-50"
        >
          Extract
        </button>
      </form>

      {message && (
        <div
          className={`text-lg text-center ${message.includes("❌") ? "text-red-600" : "text-green-600"} mb-4`}
        >
          {message}
        </div>
      )}

      {/* Display the extracted files */}
      {extractedData && (
        <div className="mt-6 p-4 bg-white rounded shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Extracted Files</h2>
          <h3 className="text-lg font-semibold">Images</h3>
          <ul>
            {extractedData.imgFiles.length > 0 ? (
              extractedData.imgFiles.map((file, idx) => <li key={idx}>{file}</li>)
            ) : (
              <li>No images found.</li>
            )}
          </ul>
          <h3 className="text-lg font-semibold">Videos</h3>
          <ul>
            {extractedData.videoFiles.length > 0 ? (
              extractedData.videoFiles.map((file, idx) => <li key={idx}>{file}</li>)
            ) : (
              <li>No videos found.</li>
            )}
          </ul>
        </div>
      )}

      {/* Save button */}
      {extractedData && (
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mt-4 disabled:opacity-50"
        >
          Save Files
        </button>
      )}

    </div>
  );
};

export default UploadZip;
