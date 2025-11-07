import React from 'react';

const RealTimeTestingViewSimple: React.FC = () => {
  console.log('RealTimeTestingViewSimple component is rendering');
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Real-Time Testing</h3>
        <p className="text-gray-600">This is a simplified real-time testing view.</p>
        <div className="mt-4 p-4 bg-blue-100 rounded-md">
          <p className="text-blue-800">✅ Real-Time Testing View is working!</p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTestingViewSimple;