
const BASE_URL = 'https://statsapi.mlb.com';

export async function fetchMLBData(endpoint: string): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetail = `Status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetail += `, Message: ${errorBody.message || JSON.stringify(errorBody)}`;
      } catch {
        try {
          errorDetail += `, Body: ${await response.text()}`;
        } catch {
            // Ignore if text() also fails
        }
      }
      throw new Error(`APIリクエスト失敗: ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('ネットワークエラーが発生しました。インターネット接続をご確認ください。またはCORSの問題の可能性があります。');
    }
    throw error;
  }
}
