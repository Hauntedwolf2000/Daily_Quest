import React from 'react'
import { Link } from 'react-router-dom'

const GoBack = () => {
  return (
    <div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl text-green-600 font-bold mb-4">Success!</h2>
          <p className="text-gray-700 mb-6">
            Your file has been successfully uploaded and saved.
          </p>
          <Link to="/">
            <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition">
              Go Back
            </button>
          </Link>
        </div>

    </div>
  )
}

export default GoBack