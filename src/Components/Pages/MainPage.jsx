import React from 'react'
import { Link } from 'react-router-dom'

const MainPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to ulipsu</h1>
      <div className="flex gap-4">
        <Link to="/upload">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Upload the files
          </button>
        </Link>
        <Link to="/attend-test">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            Attend Daily_Quest
          </button>
        </Link>
      </div>
      
    </div>
  )
}

export default MainPage
