import React from 'react';
import { Candidate } from '../types';

interface ScoreBadgeProps {
  candidate: Candidate;
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
  onClick?: () => void;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ 
  candidate, 
  size = 'md', 
  showGrade = true,
  onClick 
}) => {
  // Ensure score is a number
  const score = typeof candidate.score === 'number' ? candidate.score : parseFloat(candidate.score as any) || 0;
  const grade = candidate.score_grade || 'F';
  
  // Determine color based on score (matching status badge style)
  const getColorClasses = () => {
    if (score >= 80) {
      return 'bg-green-100 text-green-800';
    } else if (score >= 60) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (score >= 40) {
      return 'bg-orange-100 text-orange-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  // Determine size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-lg';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-semibold
        ${getColorClasses()}
        ${getSizeClasses()}
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : ''}
      `}
      onClick={handleClick}
      title={`Score: ${score.toFixed(1)}/100 (Grade: ${grade})`}
    >
      {showGrade && (
        <>
          <span className="font-bold">{grade}</span>
          <span className="opacity-70">•</span>
        </>
      )}
      <span className="font-bold">{score.toFixed(1)}</span>
    </div>
  );
};

export default ScoreBadge;
