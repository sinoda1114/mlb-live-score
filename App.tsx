
import React, { useState, useEffect } from 'react';
import { useTodayGamesJST } from './hooks/useTodayGamesJST';
import { useLiveGame } from './hooks/useLiveGame';
import { toJstDateStr } from './lib/utils';
import GameSelect from './components/GameSelect';
import ScoreBoard from './components/ScoreBoard';
import ErrorBanner from './components/ErrorBanner';

function App() {
  const [selectedGamePk, setSelectedGamePk] = useState<number | undefined>(undefined);
  const { games, error: gamesError, isLoading: gamesIsLoading, retry: retryGames } = useTodayGamesJST();
  const { live, error: liveError, retry: retryLive } = useLiveGame(selectedGamePk);

  useEffect(() => {
    // 試合一覧がロード/更新された際の処理
    if (games.length > 0) {
        // 選択中の試合がまだリストに存在するか確認
        const isSelectedGameStillPresent = games.some(game => game.gamePk === selectedGamePk);
        // 選択中の試合がない場合、または選択中の試合が新しいリストにない場合は、リストの最初の試合を選択
        if (selectedGamePk === undefined || !isSelectedGameStillPresent) {
            setSelectedGamePk(games[0].gamePk);
        }
    } else if (games.length === 0) {
        // 試合がない場合は選択を解除
        setSelectedGamePk(undefined);
    }
  }, [games]);

  const handleGameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGamePk(Number(e.target.value));
  };

  const todayJST = toJstDateStr(new Date());

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-slate-900 text-slate-200 font-sans">
      <header className="w-full max-w-2xl text-center py-4">
        <h1 className="text-3xl font-bold text-blue-400">Live MLB Today</h1>
        <p className="text-sm text-slate-400 mt-1">当日（JST: {todayJST}）のMLB試合</p>
        <div className="mt-4">
          <button
            onClick={retryGames}
            disabled={gamesIsLoading}
            className="flex items-center justify-center mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
            aria-label="試合リストを更新"
          >
            {gamesIsLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>更新中...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 2a9 9 0 01-13.51 6.49M20 15h-5v5" />
                </svg>
                <span>試合リストを更新</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl mt-4 space-y-4">
        {gamesIsLoading && (
            <div className="bg-slate-800 p-4 rounded-lg shadow-md text-center text-slate-400">
                試合情報をロード中...
            </div>
        )}

        {gamesError && (
          <ErrorBanner message={gamesError}>
            <button
              onClick={retryGames}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              再試行
            </button>
          </ErrorBanner>
        )}

        {!gamesIsLoading && games.length === 0 && !gamesError && (
          <div className="bg-slate-800 p-4 rounded-lg shadow-md text-center text-slate-400">
            本日は対象の試合が見つかりませんでした（JST）。
          </div>
        )}

        {games.length > 0 && (
          <GameSelect
            games={games}
            selectedGamePk={selectedGamePk}
            onSelectChange={handleGameSelect}
          />
        )}

        {selectedGamePk && games.length > 0 && (
          <>
            {liveError && (
              <ErrorBanner message={liveError}>
                <button
                  onClick={retryLive}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  再試行
                </button>
              </ErrorBanner>
            )}
            <ScoreBoard liveGame={live} />
          </>
        )}
      </main>

      <footer className="w-full max-w-2xl text-center text-sm text-slate-500 mt-8 py-4 border-t border-slate-700">
        <p>
          データはMLB Stats APIから取得しています。数秒の遅延があり得る点にご注意ください。
        </p>
      </footer>
    </div>
  );
}

export default App;
