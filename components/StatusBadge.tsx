
import React from 'react';
import { getJstStatusText } from '../lib/utils';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClass = 'bg-slate-600'; // Default
  if (status === 'Live' || status === 'In Progress') {
    badgeClass = 'bg-green-500 animate-pulse';
  } else if (status === 'Final' || status === 'Game Over') {
    badgeClass = 'bg-blue-600';
  } else if (status === 'Scheduled' || status === 'Pre-Game') {
    badgeClass = 'bg-yellow-500';
  }

  const text = getJstStatusText(status);

  return (
    <span
      className={`${badgeClass} text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md inline-block`}
    >
      {text}
    </span>
  );
};

export default StatusBadge;
