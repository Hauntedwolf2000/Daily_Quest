import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./Components/Pages/MainPage";
import Upload from "./Components/Pages/Upload";
import AttendTest from "./Components/Pages/AttendTest";
import GoBack from "./Components/GoBack";
import UploadZip from "./Components/Pages/UploadZip";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/attend-test" element={<AttendTest />} />
        <Route path="/go-back" element={<GoBack/>}/>
        <Route path="/zip" element={<UploadZip/>}/>
      </Routes>
    </Router>
  );
}

export default App;
