import React, { useState, useEffect, useCallback } from 'react';
// import type { YourType } from '../types';

interface ComponentNameProps {
  // Define your props here
  title: string;
  onAction?: () => void;
  className?: string;
}

/**
 * ComponentName - Brief description of what this component does
 * 
 * @param {string} title - Description of the title prop
 * @param {function} onAction - Optional callback function
 * @param {string} className - Optional additional CSS classes
 */
const ComponentName: React.FC<ComponentNameProps> = ({ 
  title, 
  onAction, 
  className = '' 
}) => {
  // ===== STATE =====
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // ===== EFFECTS =====
  useEffect(() => {
    // Initialize component or fetch data
    const initializeComponent = async () => {
      setIsLoading(true);
      try {
        // Fetch or initialize data
        // const result = await fetchData();
        // setData(result);
      } catch (error) {
        console.error('Error initializing component:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // ===== EVENT HANDLERS =====
  const handleClick = useCallback(() => {
    if (onAction) {
      onAction();
    }
  }, [onAction]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // ===== EARLY RETURNS =====
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-gray-500">
        No data available
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {title}
      </h2>

      <div className="space-y-4">
        {/* Component content goes here */}
        <p className="text-gray-700">Component content</p>
      </div>

      {onAction && (
        <button
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Perform action"
          tabIndex={0}
        >
          Action Button
        </button>
      )}
    </div>
  );
};

export default ComponentName;
