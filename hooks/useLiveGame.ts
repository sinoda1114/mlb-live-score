
import { useState, useEffect, useRef, useCallback } from 'react';
import type { LiveGame, MLBLiveGameResponse } from '../lib/types';
import { fetchMLBData } from '../services/api';
import { mapLiveGameData } from '../lib/utils';

const POLLING_INTERVAL = 5000; // 5秒
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 5000; // 5秒

export function useLiveGame(gamePk?: number) {
  const [live, setLive] = useState<LiveGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!gamePk) {
      clearTimer();
      setLive(null);
      setError(null);
      return;
    }

    try {
      setError(null);
      const data: MLBLiveGameResponse = await fetchMLBData(`/api/v1.1/game/${gamePk}/feed/live`);
      const mapped = mapLiveGameData(data);
      setLive(mapped);
      retryCountRef.current = 0; // 成功したらリトライカウントをリセット

      // Stop polling for finished games
      if (mapped.status === 'Final' || mapped.status === 'Game Over') {
        clearTimer();
      } else {
        timerRef.current = window.setTimeout(fetchData, POLLING_INTERVAL);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'ライブデータの取得に失敗しました。';
      console.error("Failed to fetch live game data:", errorMessage);

      if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current++;
        const delay = RETRY_BASE_DELAY * Math.pow(2, retryCountRef.current - 1); // 指数バックオフ
        setError(`データ取得に失敗しました（${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}回目リトライ中）。${errorMessage}`);
        timerRef.current = window.setTimeout(fetchData, delay);
      } else {
        setError(`データ取得に失敗しました。ネットワークをご確認のうえ、再試行してください。${errorMessage}`);
        clearTimer(); // 最大リトライ回数を超えたらポーリング停止
      }
    }
  }, [gamePk, clearTimer]);

  useEffect(() => {
    clearTimer(); // gamePkが変わったら既存のタイマーをクリア
    retryCountRef.current = 0; // gamePkが変わったらリトライカウントもリセット
    fetchData(); // 新しいgamePkで即座にデータ取得開始

    return () => {
      clearTimer(); // コンポーネントのアンマウント時にタイマーをクリーンアップ
    };
  }, [gamePk, fetchData, clearTimer]);

  const retry = useCallback(() => {
    retryCountRef.current = 0; // リトライボタンが押されたらリトライカウントをリセット
    clearTimer(); // 既存のタイマーをクリア
    fetchData(); // 即座に再フェッチを開始
  }, [fetchData, clearTimer]);


  return { live, error, retry };
}
