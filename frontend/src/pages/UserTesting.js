// User Testing Results Page for displaying participant interactions and session data
import React, { useState, useEffect } from 'react';
import UserTestingInterface from '../components/UserTestingInterface';

const UserTesting = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [showInterface, setShowInterface] = useState(false);

  // Sample session data for demonstration
  const sampleSessions = [
    {
      participantId: 'P001',
      startTime: '2025-01-27T10:00:00.000Z',
      endTime: '2025-01-27T10:45:00.000Z',
      totalDuration: 2700,
      tasks: [
        {
          taskId: 1,
          title: 'Registration & Onboarding',
          duration: 180,
          completed: true,
          observations: ['Quick registration process', 'Clear onboarding flow']
        },
        {
          taskId: 2,
          title: 'Product Discovery & Filtering',
          duration: 540,
          completed: true,
          observations: ['Filters worked well', 'Sustainability scores clear']
        },
        {
          taskId: 3,
          title: 'Gamification & Engagement',
          duration: 360,
          completed: true,
          observations: ['Points system engaging', 'Leaderboard motivating']
        },
        {
          taskId: 4,
          title: 'Purchase Process',
          duration: 720,
          completed: true,
          observations: ['Smooth checkout', 'Carbon savings visible']
        },
        {
          taskId: 5,
          title: 'Brand & Supplier Interaction',
          duration: 300,
          completed: true,
          observations: ['Brand info comprehensive', 'Supplier features intuitive']
        }
      ],
      observations: [
        { timestamp: '2025-01-27T10:02:00.000Z', taskId: 1, observation: 'Positive: Easy registration' },
        { timestamp: '2025-01-27T10:05:00.000Z', taskId: 1, observation: 'Issue: Email validation unclear' },
        { timestamp: '2025-01-27T10:12:00.000Z', taskId: 2, observation: 'Positive: Filter interface intuitive' },
        { timestamp: '2025-01-27T10:18:00.000Z', taskId: 2, observation: 'Performance: Slow loading on mobile' },
        { timestamp: '2025-01-27T10:25:00.000Z', taskId: 3, observation: 'Usability: Points system easy to understand' },
        { timestamp: '2025-01-27T10:35:00.000Z', taskId: 4, observation: 'Positive: Checkout process streamlined' },
        { timestamp: '2025-01-27T10:42:00.000Z', taskId: 5, observation: 'Issue: Supplier dashboard could be clearer' }
      ],
      screenshots: [
        { timestamp: '2025-01-27T10:02:30.000Z', taskId: 1, description: 'Registration form completion' },
        { timestamp: '2025-01-27T10:12:15.000Z', taskId: 2, description: 'Product filtering interface' },
        { timestamp: '2025-01-27T10:25:45.000Z', taskId: 3, description: 'Gamification dashboard' },
        { timestamp: '2025-01-27T10:35:20.000Z', taskId: 4, description: 'Checkout process' },
        { timestamp: '2025-01-27T10:42:10.000Z', taskId: 5, description: 'Brand detail page' }
      ],
      feedback: {
        overallRating: 8,
        positiveComments: 'Great sustainability focus, intuitive interface',
        negativeComments: 'Some loading delays, mobile optimization needed',
        suggestions: 'Add more product images, improve mobile experience'
      }
    }
  ];

  useEffect(() => {
    setSessions(sampleSessions);
  }, []);

  const handleSessionComplete = (sessionData) => {
    setSessions(prev => [...prev, sessionData]);
    setCurrentSession(sessionData);
    setShowInterface(false);
  };

  const calculateTaskCompletionRate = (tasks) => {
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const calculateAverageTaskTime = (tasks) => {
    const completedTasks = tasks.filter(task => task.completed);
    const totalTime = completedTasks.reduce((sum, task) => sum + task.duration, 0);
    return Math.round(totalTime / completedTasks.length);
  };

  const getObservationStats = (observations) => {
    const types = {
      'Positive': 0,
      'Issue': 0,
      'Performance': 0,
      'Usability': 0
    };

    observations.forEach(obs => {
      const type = obs.observation.split(':')[0];
      if (types.hasOwnProperty(type)) {
        types[type]++;
      }
    });

    return types;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Testing Session Results
          </h1>
          <p className="text-gray-600">
            Participant interactions and usability testing data for the Ethical Fashion Platform
          </p>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setShowInterface(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              🎬 Start New Session
            </button>
            <button
              onClick={() => setCurrentSession(sessions[0])}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              📊 View Sample Data
            </button>
          </div>
        </div>

        {/* User Testing Interface */}
        {showInterface && (
          <UserTestingInterface
            participantId={`P${sessions.length + 1}`}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {/* Sessions Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sessions:</span>
                <span className="font-semibold">{sessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Duration:</span>
                <span className="font-semibold">
                  {sessions.length > 0 
                    ? Math.round(sessions.reduce((sum, s) => sum + s.totalDuration, 0) / sessions.length / 60)
                    : 0} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Observations:</span>
                <span className="font-semibold">
                  {sessions.reduce((sum, s) => sum + s.observations.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Screenshots Captured:</span>
                <span className="font-semibold">
                  {sessions.reduce((sum, s) => sum + s.screenshots.length, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion</h3>
            <div className="space-y-3">
              {sessions.length > 0 && sessions[0].tasks.map((task, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Task {task.taskId}:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${task.completed ? 'text-green-600' : 'text-red-600'}`}>
                      {task.completed ? '✓' : '✗'}
                    </span>
                    <span className="text-sm font-medium">{task.duration}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observation Types</h3>
            {sessions.length > 0 && (
              <div className="space-y-2">
                {Object.entries(getObservationStats(sessions[0].observations)).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-sm text-gray-600">{type}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Session View */}
        {currentSession && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Session: {currentSession.participantId}
              </h2>
              <div className="text-sm text-gray-500">
                {new Date(currentSession.startTime).toLocaleDateString()}
              </div>
            </div>

            {/* Session Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {calculateTaskCompletionRate(currentSession.tasks)}%
                </div>
                <div className="text-sm text-blue-600">Task Completion</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(currentSession.totalDuration / 60)}
                </div>
                <div className="text-sm text-green-600">Minutes</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {currentSession.observations.length}
                </div>
                <div className="text-sm text-yellow-600">Observations</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {currentSession.screenshots.length}
                </div>
                <div className="text-sm text-purple-600">Screenshots</div>
              </div>
            </div>

            {/* Task Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Performance</h3>
              <div className="space-y-3">
                {currentSession.tasks.map((task, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {task.completed ? 'Completed' : 'Failed'}
                        </span>
                        <span className="text-sm text-gray-500">{task.duration}s</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Observations:</strong> {task.observations.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations Timeline */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observations Timeline</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentSession.observations.map((obs, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500 w-16">
                      {new Date(obs.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Task {obs.taskId}</div>
                      <div className="text-sm text-gray-600">{obs.observation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshots */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Captured Screenshots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSession.screenshots.map((screenshot, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">{screenshot.description}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      Task {screenshot.taskId} • {new Date(screenshot.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-sm">📸 Screenshot Placeholder</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Participant Feedback */}
            {currentSession.feedback && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participant Feedback</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Positive Comments</h4>
                    <p className="text-sm text-green-700">{currentSession.feedback.positiveComments}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Areas for Improvement</h4>
                    <p className="text-sm text-red-700">{currentSession.feedback.negativeComments}</p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Suggestions</h4>
                  <p className="text-sm text-blue-700">{currentSession.feedback.suggestions}</p>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    Overall Rating: {currentSession.feedback.overallRating}/10
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTesting; 