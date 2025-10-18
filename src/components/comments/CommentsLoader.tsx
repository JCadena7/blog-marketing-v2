import React from 'react';

const CommentsLoader: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default CommentsLoader;