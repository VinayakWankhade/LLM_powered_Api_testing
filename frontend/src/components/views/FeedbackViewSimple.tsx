import React from 'react';

const FeedbackViewSimple: React.FC = () => {
  console.log('FeedbackViewSimple component is rendering');
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Feedback & Learning System</h3>
        <p className="text-gray-600">This is a simplified feedback view.</p>
        <div className="mt-4 p-4 bg-purple-100 rounded-md">
          <p className="text-purple-800">✅ Feedback View is working!</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackViewSimple;