import React from 'react';

const TestView: React.FC = () => {
  console.log('TestView component is rendering');
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Test View</h1>
      <p className="text-gray-600">This is a test component to verify routing is working correctly.</p>
      <div className="mt-4 p-4 bg-green-100 rounded-md">
        <p className="text-green-800">✅ If you can see this, the routing is working!</p>
      </div>
    </div>
  );
};

export default TestView;