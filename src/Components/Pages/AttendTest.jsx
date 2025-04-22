import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const AttendTest = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [modalMessage, setModalMessage] = useState('');
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResource, setShowResource] = useState(true); // <== NEW state to handle image/video first

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/resources/questions.json');
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    loadQuestions();
  }, []);

  const handleOptionSelect = (value, type) => {
    setSelectedAnswers((prev) => {
      if (type === 'mrq') {
        const current = prev[currentQuestionIndex] || [];
        const newSelection = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [currentQuestionIndex]: newSelection };
      }
      return { ...prev, [currentQuestionIndex]: value };
    });
  };

  const showSubmitButton = (type) => {
    const selected = selectedAnswers[currentQuestionIndex];
    if (type === 'mcq') return !!selected;
    if (type === 'mrq') return selected && selected.length > 0;
    if (type === 'fill in the blanks') return !!selected;
    return false;
  };

  const handleNextAfterResource = () => {
    setShowResource(false);
  };

  const renderResource = (question) => {
    const resourceType = question['Resources']?.toLowerCase();
    const index = question['index'];

    if (!resourceType || resourceType === 'none') {
      setShowResource(false);
      return null;
    }

    if (resourceType === 'img') {
      return (
        <div className="text-center space-y-4">
          <p className="text-lg">Observe the image before answering:</p>
          <img
            src={`/resources/img/${index}.png`}
            alt={`Resource ${index}`}
            className="max-w-full mx-auto border rounded-lg shadow"
          />
          <button
            onClick={handleNextAfterResource}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Next
          </button>
        </div>
      );
    }

    if (resourceType === 'video') {
      return (
        <div className="text-center space-y-4">
          <p className="text-lg">Watch the video before answering:</p>
          <video
            id="quizVideo"
            src={`/resources/video/${index}.mp4`}
            controls
            className="max-w-full mx-auto border rounded-lg shadow"
            onEnded={() => {
              document.getElementById('nextResourceBtn').style.display = 'inline-block';
            }}
          ></video>
          <button
            id="nextResourceBtn"
            onClick={handleNextAfterResource}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            style={{ display: 'none' }}
          >
            Next
          </button>
        </div>
      );
    }

    // If unexpected type
    setShowResource(false);
    return null;
  };

  const renderQuestion = (question) => {
    const type = (question['SCORM Question Type'] || 'MCQ').toLowerCase();
    const options = Object.keys(question)
      .filter((key) => key.startsWith('Option') && question[key])
      .map((key) => question[key]);

    return (
      <div className="w-full p-4">
        <p className="text-xl font-semibold mb-4">
          {currentQuestionIndex + 1}. {question['Question']}
        </p>
        <div className="space-y-2">
          {type === 'mcq' &&
            options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => handleOptionSelect(opt, 'mcq')}
                className={`flex items-center p-2 border rounded cursor-pointer hover:bg-blue-50 transition ${
                  selectedAnswers[currentQuestionIndex] === opt ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`q${currentQuestionIndex}`}
                  value={opt}
                  checked={selectedAnswers[currentQuestionIndex] === opt}
                  onChange={() => {}}
                  className="mr-2"
                />
                <label>{opt}</label>
              </div>
            ))}

          {type === 'mrq' &&
            options.map((opt, idx) => {
              const selected = selectedAnswers[currentQuestionIndex] || [];
              return (
                <div
                  key={idx}
                  onClick={() => handleOptionSelect(opt, 'mrq')}
                  className={`flex items-center p-2 border rounded cursor-pointer hover:bg-blue-50 transition ${
                    selected.includes(opt) ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    name={`q${currentQuestionIndex}`}
                    value={opt}
                    checked={selected.includes(opt)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <label>{opt}</label>
                </div>
              );
            })}

          {type === 'fill in the blanks' && (
            <select
              className="border border-gray-400 p-2 rounded"
              value={selectedAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleOptionSelect(e.target.value, 'fill in the blanks')}
            >
              <option value="">--Select an answer--</option>
              {options.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>

        {showSubmitButton(type) && (
          <button
            onClick={() => checkAnswer(question)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        )}
      </div>
    );
  };

  const checkAnswer = (question) => {
    const type = (question['SCORM Question Type'] || 'MCQ').toLowerCase();
    console.log(type)
    let selectedValues = selectedAnswers[currentQuestionIndex];

    if (!selectedValues || (Array.isArray(selectedValues) && selectedValues.length === 0)) {
      showModal('Please select an option.', false);
      return;
    }

    if (!Array.isArray(selectedValues)) {
      selectedValues = [selectedValues];
    }

    const correctAnswers = question['Correct Answer']
      .split(',')
      .map((ans) => ans.trim());
    const isCorrect =
      selectedValues.length === correctAnswers.length &&
      selectedValues.every((val) => correctAnswers.includes(val));

    if (isCorrect) setScore((prev) => prev + 1);

    const message = isCorrect
      ? 'Correct! 🎉'
      : `Incorrect. ❌ The correct answer is: ${question['Correct Answer']}`;
    showModal(message, true);
  };

  const showModal = (message, showNext) => {
    setModalMessage(message);
    setShowNextBtn(showNext);
  };

  const handleNext = () => {
    setModalMessage('');
    setCurrentQuestionIndex((prev) => prev + 1);
    setShowNextBtn(false);
    setShowResource(true);
  };

  const showFinalScore = () => (
    <>
      <div className="w-full p-4 text-center">
        <h2 className="text-2xl mb-4">Quiz Completed! 🎓</h2>
        <p className="text-xl">Your Score: {score} / {questions.length}</p>
      </div>
      <div className="flex items-center justify-center flex-col">
        <Link to="/">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Go to main menu
          </button>
        </Link>
      </div>
    </>
  );

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-4">
        <p className="text-lg text-gray-600">No questions available.</p>
        <Link to="/">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Go to main menu
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-4/5 max-w-3xl p-4">
        {currentQuestionIndex < questions.length ? (
          showResource
            ? renderResource(questions[currentQuestionIndex])
            : renderQuestion(questions[currentQuestionIndex])
        ) : (
          showFinalScore()
        )}
      </div>

      {modalMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative">
            <span
              className="absolute top-2 right-3 text-xl cursor-pointer"
              onClick={() => setModalMessage('')}
            >
              &times;
            </span>
            <h2 className="text-xl mb-4">{modalMessage}</h2>
            {showNextBtn && (
              <button
                onClick={handleNext}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendTest;
