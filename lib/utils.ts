
import type { GameListItem, LiveGame, MLBScheduleResponse, MLBLiveGameResponse, PlayerStats, BatterGameLog } from './types';

const TEAM_NAME_MAP_JA: { [key: string]: string } = {
  'Los Angeles Angels': 'ロサンゼルス・エンゼルス',
  'Houston Astros': 'ヒューストン・アストロズ',
  'Oakland Athletics': 'オークランド・アスレチックス',
  'Toronto Blue Jays': 'トロント・ブルージェイズ',
  'Atlanta Braves': 'アトランタ・ブレーブス',
  'Milwaukee Brewers': 'ミルウォーキー・ブルワーズ',
  'St. Louis Cardinals': 'セントルイス・カージナルス',
  'Chicago Cubs': 'シカゴ・カブス',
  'Arizona Diamondbacks': 'アリゾナ・ダイヤモンドバックス',
  'Los Angeles Dodgers': 'ロサンゼルス・ドジャース',
  'San Francisco Giants': 'サンフランシスコ・ジャイアンツ',
  'Cleveland Guardians': 'クリーブランド・ガーディアンズ',
  'Seattle Mariners': 'シアトル・マリナーズ',
  'Miami Marlins': 'マイアミ・マーリンズ',
  'New York Mets': 'ニューヨーク・メッツ',
  'Washington Nationals': 'ワシントン・ナショナルズ',
  'Baltimore Orioles': 'ボルチモア・オリオールズ',
  'San Diego Padres': 'サンディエゴ・パドレス',
  'Philadelphia Phillies': 'フィラデルフィア・フィリーズ',
  'Pittsburgh Pirates': 'ピッツバーグ・パイレーツ',
  'Texas Rangers': 'テキサス・レンジャーズ',
  'Tampa Bay Rays': 'タンパベイ・レイズ',
  'Boston Red Sox': 'ボストン・レッドソックス',
  'Cincinnati Reds': 'シンシナティ・レッズ',
  'Colorado Rockies': 'コロラド・ロッキーズ',
  'Kansas City Royals': 'カンザスシティ・ロイヤルズ',
  'Detroit Tigers': 'デトロイト・タイガース',
  'Minnesota Twins': 'ミネソタ・ツインズ',
  'Chicago White Sox': 'シカゴ・ホワイトソックス',
  'New York Yankees': 'ニューヨーク・ヤンキース',
};

const JAPANESE_PLAYER_KANJI_MAP: { [key: string]: string } = {
  'Shohei Ohtani': '大谷 翔平',
  'Yoshinobu Yamamoto': '山本 由伸',
  'Yusei Kikuchi': '菊池 雄星',
  'Shintaro Fujinami': '藤浪 晋太郎',
  'Kenta Maeda': '前田 健太',
  'Masataka Yoshida': '吉田 正尚',
  'Seiya Suzuki': '鈴木 誠也',
  'Kodai Senga': '千賀 滉大',
  'Yu Darvish': 'ダルビッシュ 有',
};

const FOREIGN_PLAYER_KATAKANA_MAP: { [key: string]: string } = {
  'Mookie Betts': 'ムーキー・ベッツ',
  'Freddie Freeman': 'フレディ・フリーマン',
  'Aaron Judge': 'アーロン・ジャッジ',
  'Gerrit Cole': 'ゲリット・コール',
  'Mike Trout': 'マイク・トラウト',
  'Ronald Acuña Jr.': 'ロナルド・アクーニャ・ジュニア',
  'Corbin Carroll': 'コービン・キャロル',
  'Corey Seager': 'コーリー・シーガー',
  'Marcus Semien': 'マーカス・セミエン',
  'Juan Soto': 'フアン・ソト',
  'Fernando Tatis Jr.': 'フェルナンド・タティス・ジュニア',
  'Bobby Witt Jr.': 'ボビー・ウィット・ジュニア',
  'Bryce Harper': 'ブライス・ハーパー',
  'Trea Turner': 'トレイ・ターナー',
  'Gunnar Henderson': 'ガナー・ヘンダーソン',
  'Adley Rutschman': 'アドリー・ラッチマン',
  'Julio Rodríguez': 'フリオ・ロドリゲス',
  'Clayton Kershaw': 'クレイトン・カーショウ',
  'Justin Verlander': 'ジャスティン・バーランダー',
  'Lars Nootbaar': 'ラーズ・ヌートバー',
  'Teoscar Hernández': 'テオスカー・ヘルナンデス'
};

const playResultMapping = [
    // Order matters: more specific descriptions first
    { regex: /homers/, japanese: '本', isHit: true, isAtBat: true },
    { regex: /triples/, japanese: '三', isHit: true, isAtBat: true },
    { regex: /doubles/, japanese: '二', isHit: true, isAtBat: true },
    { regex: /singles/, japanese: '安', isHit: true, isAtBat: true },
    { regex: /walks/, japanese: '四球', isHit: false, isAtBat: false },
    { regex: /hit by pitch/, japanese: '死球', isHit: false, isAtBat: false },
    { regex: /strikes out swinging/, japanese: '空三振', isHit: false, isAtBat: true },
    { regex: /strikes out looking/, japanese: '見三振', isHit: false, isAtBat: true },
    { regex: /strikes out/, japanese: '三振', isHit: false, isAtBat: true },
    { regex: /grounds out/, japanese: 'ゴロ', isHit: false, isAtBat: true },
    { regex: /lines out/, japanese: '直', isHit: false, isAtBat: true },
    { regex: /flies out/, japanese: '飛', isHit: false, isAtBat: true },
    { regex: /reaches on a fielding error/, japanese: '失', isHit: false, isAtBat: true },
    { regex: /reaches on a dropped fly/, japanese: '失', isHit: false, isAtBat: true },
    { regex: /sac fly/, japanese: '犠飛', isHit: false, isAtBat: false },
    { regex: /sac bunt/, japanese: '犠打', isHit: false, isAtBat: false },
    { regex: /bunts/, japanese: 'バント', isHit: false, isAtBat: true }, // A bunt for an out is an AB
];

const fielderMapping = [
    { regex: /pitcher/, japanese: '投' },
    { regex: /catcher/, japanese: '捕' },
    { regex: /first baseman/, japanese: '一' },
    { regex: /second baseman/, japanese: '二' },
    { regex: /third baseman/, japanese: '三' },
    { regex: /shortstop/, japanese: '遊' },
    { regex: /left fielder/, japanese: '左' },
    { regex: /center fielder/, japanese: '中' },
    { regex: /right fielder/, japanese: '右' },
];

/**
 * Translates an English MLB play description into a concise Japanese format.
 * @param description The English play description from the API.
 * @returns A concise Japanese representation of the play result.
 */
function translatePlayResultToJapanese(description: string | undefined): BatterGameLog | null {
    if (!description || typeof description !== 'string') {
        return null;
    }
    
    let result = '';
    let isHit = false;
    let isAtBat = false;
    let fielder = '';
    const descLower = description.toLowerCase();

    for (const mapping of fielderMapping) {
        if (mapping.regex.test(descLower)) {
            fielder = mapping.japanese;
            break;
        }
    }
    
    for (const mapping of playResultMapping) {
        if (mapping.regex.test(descLower)) {
            result = mapping.japanese;
            isHit = mapping.isHit;
            isAtBat = mapping.isAtBat;
            break;
        }
    }

    if (!result) return null;
    
    let finalResultText = '';
    if (['ゴロ', '直', '飛', '安', '二', '三'].includes(result)) {
        finalResultText = fielder + result;
    } else {
        finalResultText = result;
    }
    
    return { result: finalResultText, isHit, isAtBat };
}


/**
 * Translates an English MLB team name to Japanese.
 * @param englishName The English team name from the API.
 * @returns The Japanese team name, or the original name if not found.
 */
export function translateTeamName(englishName: string): string {
    return TEAM_NAME_MAP_JA[englishName] || englishName;
}

/**
 * Translates a player's English name to the correct Japanese format.
 * Japanese players are returned in Kanji.
 * Foreign players are returned in Katakana.
 * @param englishName The English player name from the API.
 * @returns The Japanese name, or the original name if not found in maps.
 */
export function getPlayerNameInJapaneseFormat(englishName: string): string {
    if (JAPANESE_PLAYER_KANJI_MAP[englishName]) {
        return JAPANESE_PLAYER_KANJI_MAP[englishName];
    }
    if (FOREIGN_PLAYER_KATAKANA_MAP[englishName]) {
        return FOREIGN_PLAYER_KATAKANA_MAP[englishName];
    }
    return englishName; // Fallback to original name
}

/**
 * DateオブジェクトからJSTでの'YYYY-MM-DD'形式の文字列を生成します。
 */
export function toJstDateStr(date: Date): string {
  // 'sv-SE'ロケールはYYYY-MM-DD形式を生成します
  return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

/**
 * JST基準で指定された日数だけ日付を変更します。
 */
export function addDaysJst(date: Date, days: number): Date {
  const newDate = new Date(date);
  // Simply add days. toJstDateStr handles the timezone conversion.
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * MLB Stats APIのスケジュールレスポンスから試合リストを抽出します。
 */
export function extractGameList(data: MLBScheduleResponse | null): GameListItem[] {
  if (!data || !data.dates || data.dates.length === 0) {
    return [];
  }
  return data.dates.flatMap(dateEntry =>
    dateEntry.games.map(game => ({
      gamePk: game.gamePk,
      awayName: translateTeamName(game.teams.away.team.name),
      homeName: translateTeamName(game.teams.home.team.name),
      status: game.status.detailedState,
      gameDateISO: game.gameDate,
    }))
  );
}

/**
 * JSTの「今日」に試合時間が含まれるゲームのみをフィルタリングします。
 */
export function filterGamesToJstToday(games: GameListItem[]): GameListItem[] {
  const todayJSTStr = toJstDateStr(new Date());

  return games.filter(game => {
    const gameDateUTC = new Date(game.gameDateISO);
    const gameDateJSTStr = toJstDateStr(gameDateUTC);
    return gameDateJSTStr === todayJSTStr;
  });
}

/**
 * Converts an innings pitched string (e.g., "5.1") to total outs.
 * @param ip The innings pitched string.
 * @returns The total number of outs.
 */
function ipToOuts(ip: string | undefined): number {
    if (!ip) return 0;
    const parts = ip.split('.');
    const fullInnings = parseInt(parts[0], 10) || 0;
    const partialInnings = parseInt(parts[1], 10) || 0;
    return (fullInnings * 3) + partialInnings;
}


/**
 * MLB Stats APIのライブゲームレスポンスをLiveGame型にマッピングします。
 */
export function mapLiveGameData(data: MLBLiveGameResponse): LiveGame {
  const currentPlay = data.liveData?.plays?.currentPlay;
  const linescore = data.liveData?.linescore;
  const boxscore = data.liveData?.boxscore;
  
  const gameType = data.gameData?.game?.type;
  // More robustly identify postseason games based on official game type codes.
  const isPostseason = gameType ? ['F', 'D', 'L', 'W'].includes(gameType) : false;
  
  const isLive = data.gameData?.status?.detailedState === 'In Progress' || data.gameData?.status?.detailedState === 'Live';
  const isTopInning = linescore?.inningHalf === 'Top' ? true : linescore?.inningHalf === 'Bottom' ? false : null;

  const playEvents = currentPlay?.playEvents;
  const lastEvent = playEvents && playEvents.length > 0 ? playEvents[playEvents.length - 1] : null;

  const balls = lastEvent?.count?.balls ?? currentPlay?.count?.balls ?? 0;
  const strikes = lastEvent?.count?.strikes ?? currentPlay?.count?.strikes ?? 0;
  const outs = linescore?.outs ?? 0;

  const offense = linescore?.offense;
  const bases = {
    first: !!offense?.first,
    second: !!offense?.second,
    third: !!offense?.third,
  };

  const batterId = currentPlay?.matchup?.batter?.id;
  
  // Calculate game log first, as it's needed for real-time stats
  let batterGameLog: BatterGameLog[] | null = null;
  const allPlays = data.liveData?.plays?.allPlays;
  if (isLive && batterId && allPlays) {
    const batterAtBats = allPlays.filter(play => play.matchup?.batter?.id === batterId);
    if (batterAtBats.length > 0) {
        batterGameLog = batterAtBats
            .map(play => translatePlayResultToJapanese(play.result?.description))
            .filter((log): log is BatterGameLog => log !== null && log.result !== '');
    }
  }

  let pitcherStats: LiveGame['pitcherStats'] = null;
  const pitcherId = currentPlay?.matchup?.pitcher?.id;
  if (isLive && pitcherId && boxscore) {
    const pitchingTeam = isTopInning ? boxscore.teams.home : boxscore.teams.away;
    const pitcherBoxscore: PlayerStats | undefined = pitchingTeam.players[`ID${pitcherId}`];
    
    if (pitcherBoxscore) {
      const gamePitchingStats = pitcherBoxscore.stats?.pitching;
      let finalEra: string;

      const preGameStats = isPostseason
        ? pitcherBoxscore.postseasonStats?.pitching
        : pitcherBoxscore.seasonStats?.pitching;

      const preGameER = preGameStats?.earnedRuns ?? 0;
      const preGameOuts = ipToOuts(preGameStats?.inningsPitched);
      
      const gameER = gamePitchingStats?.earnedRuns ?? 0;
      const gameOuts = ipToOuts(gamePitchingStats?.inningsPitched);

      const totalER = preGameER + gameER;
      const totalOuts = preGameOuts + gameOuts;

      if (totalOuts === 0) {
          finalEra = totalER > 0 ? '---' : '0.00';
      } else {
          const calculatedEra = (totalER * 27) / totalOuts;
          finalEra = calculatedEra.toFixed(2);
      }

      pitcherStats = {
        pitchCount: gamePitchingStats?.pitchesThrown ?? 0,
        battersFaced: gamePitchingStats?.battersFaced ?? 0,
        era: finalEra,
      };
    }
  }

  let batterStats: LiveGame['batterStats'] = null;
  if (isLive && batterId && boxscore) {
    const battingTeam = isTopInning ? boxscore.teams.away : boxscore.teams.home;
    const batterBoxscore: PlayerStats | undefined = battingTeam.players[`ID${batterId}`];
    
    if (batterBoxscore) {
      let avg: string;
      
      const gameHits = batterGameLog?.filter(log => log.isHit).length ?? 0;
      const gameAtBats = batterGameLog?.filter(log => log.isAtBat).length ?? 0;

      const preGameStats = isPostseason
        ? batterBoxscore.postseasonStats?.batting
        : batterBoxscore.seasonStats?.batting;

      const preGameHits = preGameStats?.hits ?? 0;
      const preGameAtBats = preGameStats?.atBats ?? 0;
      
      const totalHits = preGameHits + gameHits;
      const totalAtBats = preGameAtBats + gameAtBats;

      if (totalAtBats > 0) {
          const calculatedAvg = totalHits / totalAtBats;
          avg = calculatedAvg.toFixed(3).substring(1); // Format to .XXX
      } else {
          avg = '.000';
      }
      
      batterStats = {
        avg: avg.startsWith('0.') ? avg.substring(1) : avg,
        hits: gameHits,
        atBats: gameAtBats,
      };
    }
  }

  return {
    gamePk: data.gamePk,
    inning: linescore?.currentInning || null,
    isTopInning: isTopInning,
    awayName: translateTeamName(data.gameData.teams.away.name),
    homeName: translateTeamName(data.gameData.teams.home.name),
    awayRuns: linescore?.teams?.away?.runs || 0,
    homeRuns: linescore?.teams?.home?.runs || 0,
    batterName: currentPlay?.matchup?.batter?.fullName ? getPlayerNameInJapaneseFormat(currentPlay.matchup.batter.fullName) : null,
    batterStats: batterStats,
    batterGameLog: batterGameLog,
    pitcherName: currentPlay?.matchup?.pitcher?.fullName ? getPlayerNameInJapaneseFormat(currentPlay.matchup.pitcher.fullName) : null,
    count: isLive ? {
      balls: balls,
      strikes: strikes,
      outs: outs,
    } : null,
    bases: bases,
    pitcherStats: pitcherStats,
    status: data.gameData?.status?.detailedState || 'Unknown',
    lastUpdated: Date.now(),
  };
}

/**
 * ステータス文字列を日本語に変換します。
 */
export function getJstStatusText(status: string): string {
  switch (status) {
    case 'Scheduled':
    case 'Pre-Game':
      return '未開始';
    case 'In Progress':
    case 'Live':
      return '試合中';
    case 'Final':
    case 'Game Over':
      return '試合終了';
    default:
      return status; // 未知のステータスはそのまま表示
  }
}

/**
 * Epochミリ秒をJSTのHH:MM:SS形式にフォーマットします。
 */
export function formatTimeInJST(epochMs: number): string {
  const date = new Date(epochMs);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}
