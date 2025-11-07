import React from 'react';

const IngestionViewSimple: React.FC = () => {
  console.log('IngestionViewSimple component is rendering');
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Data Ingestion</h3>
        <p className="text-gray-600">This is a simplified data ingestion view.</p>
        <div className="mt-4 p-4 bg-green-100 rounded-md">
          <p className="text-green-800">✅ Data Ingestion View is working!</p>
        </div>
      </div>
    </div>
  );
};

export default IngestionViewSimple;