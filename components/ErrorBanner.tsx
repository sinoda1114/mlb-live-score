
import React from 'react';

interface ErrorBannerProps {
  message: string;
  children?: React.ReactNode;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, children }) => {
  return (
    <div className="bg-red-800 border border-red-700 text-white p-4 rounded-lg shadow-md flex flex-col items-center">
      <p className="font-bold">エラー発生:</p>
      <p className="mt-2 text-center">{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default ErrorBanner;
