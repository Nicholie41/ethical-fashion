// User Testing Interface Component for capturing participant interactions
import React, { useState, useEffect } from 'react';

const UserTestingInterface = ({ participantId, onSessionComplete }) => {
  // Session state management
  const [sessionData, setSessionData] = useState({
    participantId: participantId || 'P001',
    startTime: new Date().toISOString(),
    tasks: [],
    observations: [],
    screenshots: [],
    feedback: {}
  });

  // Current task tracking
  const [currentTask, setCurrentTask] = useState(0);
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Task definitions
  const tasks = [
    {
      id: 1,
      title: "Registration & Onboarding",
      description: "Complete registration and explore the platform",
      duration: "10 minutes",
      instructions: [
        "Register for a new account",
        "Explore the homepage",
        "Find information about ethical fashion"
      ],
      observationPoints: [
        "Registration completion time",
        "Homepage first impressions",
        "Understanding of ethical fashion"
      ]
    },
    {
      id: 2,
      title: "Product Discovery & Filtering",
      description: "Find and filter sustainable products",
      duration: "15 minutes",
      instructions: [
        "Find a sustainable t-shirt",
        "Use filters to narrow search",
        "Compare sustainability scores"
      ],
      observationPoints: [
        "Filter usage effectiveness",
        "Understanding of sustainability scores",
        "Product comparison behavior"
      ]
    },
    {
      id: 3,
      title: "Gamification & Engagement",
      description: "Interact with gamification features",
      duration: "10 minutes",
      instructions: [
        "Explore your user profile",
        "Complete activities to earn points",
        "Check the leaderboard"
      ],
      observationPoints: [
        "Understanding of points system",
        "Engagement with features",
        "Motivation to earn points"
      ]
    },
    {
      id: 4,
      title: "Purchase Process",
      description: "Complete a purchase with sustainability focus",
      duration: "15 minutes",
      instructions: [
        "Add a product to cart",
        "Review ethical credentials",
        "Complete checkout",
        "Check carbon savings"
      ],
      observationPoints: [
        "Cart addition process",
        "Sustainability information review",
        "Checkout flow completion"
      ]
    },
    {
      id: 5,
      title: "Brand & Supplier Interaction",
      description: "Explore brand information and supplier features",
      duration: "10 minutes",
      instructions: [
        "Learn about a specific brand",
        "Try adding a product as supplier",
        "Explore supplier dashboard"
      ],
      observationPoints: [
        "Brand information comprehension",
        "Supplier feature understanding",
        "Interface usability"
      ]
    }
  ];

  // Start recording session
  const startSession = () => {
    setIsRecording(true);
    setTaskStartTime(new Date());
    console.log('🎬 User Testing Session Started');
    console.log('Participant ID:', sessionData.participantId);
    console.log('Start Time:', sessionData.startTime);
  };

  // Complete current task
  const completeTask = (taskId, observations = []) => {
    const endTime = new Date();
    const duration = taskStartTime ? Math.round((endTime - taskStartTime) / 1000) : 0;
    
    const taskData = {
      taskId,
      startTime: taskStartTime?.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      observations,
      completed: true
    };

    setSessionData(prev => ({
      ...prev,
      tasks: [...prev.tasks, taskData]
    }));

    console.log(`✅ Task ${taskId} completed in ${duration} seconds`);
    console.log('Observations:', observations);

    // Move to next task
    if (currentTask < tasks.length - 1) {
      setCurrentTask(currentTask + 1);
      setTaskStartTime(new Date());
    } else {
      completeSession();
    }
  };

  // Add observation
  const addObservation = (observation) => {
    setSessionData(prev => ({
      ...prev,
      observations: [...prev.observations, {
        timestamp: new Date().toISOString(),
        taskId: currentTask + 1,
        observation
      }]
    }));
  };

  // Capture screenshot reference
  const captureScreenshot = (description) => {
    setSessionData(prev => ({
      ...prev,
      screenshots: [...prev.screenshots, {
        timestamp: new Date().toISOString(),
        taskId: currentTask + 1,
        description,
        url: window.location.href
      }]
    }));
    console.log('📸 Screenshot captured:', description);
  };

  // Complete session
  const completeSession = () => {
    setIsRecording(false);
    const sessionEndTime = new Date();
    const totalDuration = Math.round((sessionEndTime - new Date(sessionData.startTime)) / 1000);
    
    const finalSessionData = {
      ...sessionData,
      endTime: sessionEndTime.toISOString(),
      totalDuration,
      completed: true
    };

    console.log('🎉 User Testing Session Completed');
    console.log('Total Duration:', totalDuration, 'seconds');
    console.log('Tasks Completed:', finalSessionData.tasks.length);
    console.log('Observations Recorded:', finalSessionData.observations.length);
    console.log('Screenshots Captured:', finalSessionData.screenshots.length);

    if (onSessionComplete) {
      onSessionComplete(finalSessionData);
    }
  };

  // Quick observation buttons
  const QuickObservation = ({ label, type }) => (
    <button
      onClick={() => addObservation(`${type}: ${label}`)}
      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
    >
      {label}
    </button>
  );

  if (!isRecording) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={startSession}
          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600"
        >
          🎬 Start User Testing Session
        </button>
      </div>
    );
  }

  const currentTaskData = tasks[currentTask];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white border border-gray-300 rounded-lg shadow-xl">
      {/* Session Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">User Testing Session</h3>
            <p className="text-sm">Participant: {sessionData.participantId}</p>
          </div>
          <button
            onClick={completeSession}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Current Task */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Task {currentTask + 1}: {currentTaskData.title}</h4>
          <span className="text-sm text-gray-500">{currentTaskData.duration}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{currentTaskData.description}</p>
        
        <div className="mb-3">
          <h5 className="font-medium text-sm mb-2">Instructions:</h5>
          <ul className="text-sm space-y-1">
            {currentTaskData.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <h5 className="font-medium text-sm mb-2">Observation Points:</h5>
          <ul className="text-sm space-y-1">
            {currentTaskData.observationPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b">
        <h5 className="font-medium text-sm mb-2">Quick Observations:</h5>
        <div className="flex flex-wrap gap-2 mb-3">
          <QuickObservation label="Confused" type="Issue" />
          <QuickObservation label="Likes Feature" type="Positive" />
          <QuickObservation label="Slow Loading" type="Performance" />
          <QuickObservation label="Easy to Use" type="Usability" />
        </div>
        
        <button
          onClick={() => captureScreenshot(`Task ${currentTask + 1} - ${currentTaskData.title}`)}
          className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
        >
          📸 Capture Screenshot
        </button>
      </div>

      {/* Task Navigation */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">
            Task {currentTask + 1} of {tasks.length}
          </span>
          <span className="text-sm text-gray-600">
            {sessionData.tasks.length} completed
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => completeTask(currentTask + 1, ['Task completed successfully'])}
            className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 flex-1"
          >
            ✅ Complete Task
          </button>
          <button
            onClick={() => completeTask(currentTask + 1, ['Task skipped due to issues'])}
            className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
          >
            ⏭️ Skip Task
          </button>
        </div>
      </div>

      {/* Session Progress */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="text-sm text-gray-600">
          <div>Observations: {sessionData.observations.length}</div>
          <div>Screenshots: {sessionData.screenshots.length}</div>
          <div>Tasks Completed: {sessionData.tasks.length}/{tasks.length}</div>
        </div>
      </div>
    </div>
  );
};

export default UserTestingInterface; 