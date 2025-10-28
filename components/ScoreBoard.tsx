import React, { useState, useEffect, useRef } from 'react';
import type { LiveGame } from '../lib/types';
import { formatTimeInJST } from '../lib/utils';
import StatusBadge from './StatusBadge';

interface ScoreBoardProps {
  liveGame: LiveGame | null;
}

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}


// Reusable component for the count dots (B-S-O)
interface CountDotsProps {
  count: number;
  max: number;
  colorClass: string;
  emptyColorClass?: string;
}

const CountDots: React.FC<CountDotsProps> = ({ count, max, colorClass, emptyColorClass = 'bg-slate-700' }) => {
    const prevCount = usePrevious(count);
    const [changedIndex, setChangedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (prevCount !== undefined && count > prevCount) {
            // Animate the new dot that was turned on
            setChangedIndex(count - 1);
            const timer = setTimeout(() => {
                setChangedIndex(null);
            }, 10000); // Animation duration: 1s * 10
            return () => clearTimeout(timer);
        }
    }, [count, prevCount]);

    const getAnimationClass = () => {
        if (colorClass.includes('green')) return 'animate-flash-green';
        if (colorClass.includes('yellow')) return 'animate-flash-yellow';
        if (colorClass.includes('red')) return 'animate-flash-red';
        return '';
    };

    return (
        <div className="flex space-x-1.5">
            {Array.from({ length: max }).map((_, i) => (
                <div 
                    key={i} 
                    className={`
                        w-5 h-5 rounded-full transition-colors duration-200 
                        ${i < count ? colorClass : emptyColorClass}
                        ${changedIndex === i ? getAnimationClass() : ''}
                    `}
                ></div>
            ))}
        </div>
    );
};

// New BasesDisplay component
interface BasesDisplayProps {
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
}

const Base: React.FC<{ isOccupied: boolean; 'aria-label': string }> = ({ isOccupied, 'aria-label': ariaLabel }) => {
  const prevIsOccupied = usePrevious(isOccupied);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
      // Animate only when a runner gets on base
      if (prevIsOccupied === false && isOccupied === true) {
          setIsAnimating(true);
          const timer = setTimeout(() => {
              setIsAnimating(false);
          }, 10000); // Animation duration
          return () => clearTimeout(timer);
      }
  }, [isOccupied, prevIsOccupied]);
    
  const baseClasses = "w-6 h-6 transform rotate-45 transition-colors duration-200";
  const occupiedClasses = "bg-yellow-400";
  const emptyClasses = "bg-slate-600 border-2 border-slate-500";
  const animationClass = isAnimating ? 'animate-flash-yellow' : '';

  return (
    <div className={`${baseClasses} ${isOccupied ? occupiedClasses : emptyClasses} ${animationClass}`} role="img" aria-label={ariaLabel}></div>
  );
};

const BasesDisplay: React.FC<BasesDisplayProps> = ({ bases }) => {
  return (
    <div className="relative w-24 h-24" aria-label="Bases">
      <div className="absolute top-1 left-1/2 -translate-x-1/2">
        <Base isOccupied={bases.second} aria-label={`Second base: ${bases.second ? 'occupied' : 'empty'}`} />
      </div>
      <div className="absolute top-1/2 left-1 -translate-y-1/2">
        <Base isOccupied={bases.third} aria-label={`Third base: ${bases.third ? 'occupied' : 'empty'}`} />
      </div>
      <div className="absolute top-1/2 right-1 -translate-y-1/2">
        <Base isOccupied={bases.first} aria-label={`First base: ${bases.first ? 'occupied' : 'empty'}`} />
      </div>
    </div>
  );
};


const AtBatIndicator = () => (
    <span className="ml-2 text-xs font-bold text-yellow-400 animate-pulse">● 攻撃中</span>
);

const ScoreBoard: React.FC<ScoreBoardProps> = ({ liveGame }) => {
  if (!liveGame) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-md text-center text-slate-400 animate-pulse">
        試合データを選択中...
      </div>
    );
  }

  const inningInfo = liveGame.inning !== null && liveGame.isTopInning !== null
    ? `${liveGame.inning}回 ${liveGame.isTopInning ? '表' : '裏'}`
    : '';
  
  const isLive = liveGame.status === 'Live' || liveGame.status === 'In Progress';

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-slate-100 truncate">{liveGame.awayName}</h2>
            {isLive && liveGame.isTopInning === true && <AtBatIndicator />}
          </div>
          <p className="text-5xl font-extrabold text-blue-400">{liveGame.awayRuns}</p>
        </div>
        <div className="text-center mx-4">
          <StatusBadge status={liveGame.status} />
          {inningInfo && <p className="text-xl font-bold text-slate-300 mt-2">{inningInfo}</p>}
        </div>
        <div className="flex-1 text-right">
           <div className="flex items-center justify-end">
            <h2 className="text-xl font-semibold text-slate-100 truncate">{liveGame.homeName}</h2>
            {isLive && liveGame.isTopInning === false && <AtBatIndicator />}
          </div>
          <p className="text-5xl font-extrabold text-blue-400">{liveGame.homeRuns}</p>
        </div>
      </div>

      {isLive && (liveGame.batterName || liveGame.pitcherName) && (
        <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4 mt-4">
          <div>
            <p className="text-slate-400 text-sm">現在の打者:</p>
            <p className="text-slate-100 text-lg font-medium">{liveGame.batterName || '---'}</p>
            {liveGame.batterStats && (
                <div className="text-sm text-slate-300 mt-1 font-mono">
                    {`打率${liveGame.batterStats.avg} (${liveGame.batterStats.atBats}-${liveGame.batterStats.hits})`}
                </div>
            )}
            {liveGame.batterGameLog && liveGame.batterGameLog.length > 0 && (
                <div 
                    className="text-sm text-slate-400 mt-1 truncate" 
                    title={liveGame.batterGameLog.map(log => log.result).join('、 ')}
                >
                    {liveGame.batterGameLog.map((log, index) => (
                        <span key={index}>
                            <span className={log.isHit ? 'text-green-400 font-semibold' : ''}>
                                {log.result}
                            </span>
                            {index < liveGame.batterGameLog.length - 1 && '、 '}
                        </span>
                    ))}
                </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">⚾️現在の投手:</p>
            <p className="text-slate-100 text-lg font-medium">{liveGame.pitcherName || '---'}</p>
            {liveGame.pitcherStats && (
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mt-2">
                    <div>投球数</div>
                    <div>打者数</div>
                    <div>防御率</div>
                    <div className="text-base font-bold text-slate-200">{liveGame.pitcherStats.pitchCount}</div>
                    <div className="text-base font-bold text-slate-200">{liveGame.pitcherStats.battersFaced}</div>
                    <div className="text-base font-bold text-slate-200">{liveGame.pitcherStats.era}</div>
                </div>
            )}
          </div>
        </div>
      )}

      {isLive && (liveGame.count || liveGame.bases) && (
        <div className="border-t border-slate-700 pt-4 mt-4 flex justify-center items-center gap-x-8">
            {liveGame.bases && <BasesDisplay bases={liveGame.bases} />}
            {liveGame.count && (
            <div className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-lg">
                <div className="font-mono text-xl font-bold text-slate-400 flex flex-col space-y-2.5">
                    <span className="flex items-center h-5">B</span>
                    <span className="flex items-center h-5">S</span>
                    <span className="flex items-center h-5">O</span>
                </div>
                <div className="flex flex-col space-y-2">
                    <CountDots count={liveGame.count.balls} max={3} colorClass="bg-green-500" />
                    <CountDots count={liveGame.count.strikes} max={2} colorClass="bg-yellow-500" />
                    <CountDots count={liveGame.count.outs} max={3} colorClass="bg-red-500" />
                </div>
            </div>
            )}
        </div>
      )}

      <div className="text-right text-xs text-slate-500 mt-4 border-t border-slate-700 pt-3">
        最終更新: {formatTimeInJST(liveGame.lastUpdated)} (JST)
      </div>
    </div>
  );
};

export default ScoreBoard;