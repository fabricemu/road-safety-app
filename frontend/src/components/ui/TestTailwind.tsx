import React from 'react';

const TestTailwind: React.FC = () => {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Tailwind CSS Test</h1>
      <p className="text-blue-100">
        If you can see this styled component, Tailwind CSS is working! 🎉
      </p>
      <div className="mt-4 space-x-2">
        <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
          Green Button
        </button>
        <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
          Red Button
        </button>
      </div>
    </div>
  );
};

export default TestTailwind; 