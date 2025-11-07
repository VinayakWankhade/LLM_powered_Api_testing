import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const RealTimeTestingDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize WebSocket connection for testing channel
  useWebSocket('testing', 'test_results', (data) => {
    setTestResults(data);
  });

  const startTesting = async () => {
    try {
      const response = await fetch('/api/testing/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interval_seconds: 30 }),
      });
      const data = await response.json();
      if (data.status === 'started') {
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Failed to start testing:', error);
    }
  };

  const stopTesting = async () => {
    try {
      const response = await fetch('/api/testing/stop', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.status === 'stopped') {
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Failed to stop testing:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Real-Time Testing Dashboard</h1>
        <div>
          {!isRunning ? (
            <button
              onClick={startTesting}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start Testing
            </button>
          ) : (
            <button
              onClick={stopTesting}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Stop Testing
            </button>
          )}
        </div>
      </div>

      {testResults && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Execution Stats</h2>
            <div className="space-y-2">
              {Object.entries(testResults.execution_stats).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Coverage Stats</h2>
            <div className="space-y-2">
              {Object.entries(testResults.coverage_stats).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Failure Patterns</h2>
            <div className="space-y-2">
              {testResults.failure_patterns.map((pattern: string, index: number) => (
                <div key={index} className="p-2 bg-red-50 rounded">
                  <span className="text-red-600">{pattern}</span>
                </div>
              ))}
            </div>
          </div>

          {testResults.latest_results && (
            <div className="col-span-2 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Latest Results</h2>
              <pre className="bg-gray-50 p-4 rounded overflow-auto">
                {JSON.stringify(testResults.latest_results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeTestingDashboard;