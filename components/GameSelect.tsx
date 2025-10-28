
import React from 'react';
import type { GameListItem } from '../lib/types';

interface GameSelectProps {
  games: GameListItem[];
  selectedGamePk?: number;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const GameSelect: React.FC<GameSelectProps> = ({ games, selectedGamePk, onSelectChange }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md">
      <label htmlFor="game-select" className="block text-slate-400 text-sm mb-2">
        試合を選択:
      </label>
      <select
        id="game-select"
        value={selectedGamePk || ''}
        onChange={onSelectChange}
        className="w-full p-2 rounded-md bg-slate-700 border border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500"
      >
        {!selectedGamePk && <option value="">試合を選択してください</option>}
        {games.map((game) => (
          <option key={game.gamePk} value={game.gamePk}>
            {game.awayName} vs {game.homeName} ({game.status === 'Live' || game.status === 'In Progress' ? '試合中' : game.status === 'Final' || game.status === 'Game Over' ? '終了' : '未開始'})
          </option>
        ))}
      </select>
    </div>
  );
};

export default GameSelect;
