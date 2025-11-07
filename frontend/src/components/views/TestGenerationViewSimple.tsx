import React from 'react';

const TestGenerationViewSimple: React.FC = () => {
  console.log('TestGenerationViewSimple component is rendering');
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Generate Test Cases</h3>
        <p className="text-gray-600">This is a simplified test generation view.</p>
        <div className="mt-4 p-4 bg-blue-100 rounded-md">
          <p className="text-blue-800">✅ Test Generation View is working!</p>
        </div>
      </div>
    </div>
  );
};

export default TestGenerationViewSimple;