
import { useState, useEffect, useCallback } from 'react';
import type { GameListItem } from '../lib/types';
import { fetchMLBData } from '../services/api';
import { toJstDateStr, addDaysJst, filterGamesToJstToday, extractGameList } from '../lib/utils';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 5000;

export function useTodayGamesJST() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retrySignal, setRetrySignal] = useState(0);

  const retry = useCallback(() => {
    setRetrySignal(s => s + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadGames = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          const todayJST = toJstDateStr(new Date());
          const yesterdayJST = toJstDateStr(addDaysJst(new Date(), -1));

          // Fetch from both UTC dates that could contain JST's "today" games
          const [todayData, yesterdayData] = await Promise.all([
            fetchMLBData(`/api/v1/schedule?sportId=1&date=${todayJST}`).catch(e => {
                console.warn(`Could not fetch schedule for ${todayJST}:`, e);
                return null; // Don't let one failure kill the whole process
            }),
            fetchMLBData(`/api/v1/schedule?sportId=1&date=${yesterdayJST}`).catch(e => {
                console.warn(`Could not fetch schedule for ${yesterdayJST}:`, e);
                return null; // Don't let one failure kill the whole process
            }),
          ]);

          const combinedGames = [
              ...extractGameList(yesterdayData),
              ...extractGameList(todayData)
          ];

          const jstTodayGames = filterGamesToJstToday(combinedGames);
          
          // Deduplicate games using a Map
          const uniqueGames = Array.from(new Map(jstTodayGames.map(item => [item.gamePk, item])).values());
          
          if (isMounted) {
            setGames(uniqueGames);
          }
          setIsLoading(false);
          return; // Success, exit the loop
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : '試合一覧の取得に失敗しました。';
          console.error(`Attempt ${attempt + 1} failed:`, errorMessage);
          
          if (attempt < MAX_RETRY_ATTEMPTS - 1) {
            if (isMounted) {
              setError(`試合一覧の取得に失敗しました（${attempt + 2}/${MAX_RETRY_ATTEMPTS}回目リトライ中）。${errorMessage}`);
            }
            const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            if (!isMounted) return;
          } else {
            if (isMounted) {
              setError(`試合一覧の取得に失敗しました。ネットワークをご確認のうえ、再試行してください。${errorMessage}`);
              setIsLoading(false);
            }
          }
        }
      }
    };

    loadGames();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrySignal]);

  return { games, error, isLoading, retry };
}
