<img width="860" height="838" alt="image" src="https://github.com/user-attachments/assets/fc2e2501-17e9-448c-8e84-6a5795abc6e0" />


# mlb-live-score

MLBのスコアをリアルタイムで表示するシンプルなウェブアプリケーションです。  
A simple web app that displays MLB live scores in real time.

---

## 主な特徴 / Features

- リアルタイムでMLBの試合スコアを表示 / Shows live MLB scores in real time
- 複数試合の一覧表示 / Lists multiple games
- 自動更新（ポーリング／WebSocketに対応可能） / Auto-updates (polling or WebSocket)
- TypeScript で実装 / Built with TypeScript
- レスポンシブ UI / Responsive UI for mobile and desktop

---

## クイックスタート / Quick Start

### 日本語

1. 依存関係をインストール  
   ```
   npm install
   ```
2. .env.local に GEMINI_API_KEY を設定  
   プロジェクトルートの `.env.local` に Gemini の API キーを `GEMINI_API_KEY` として設定してください。
3. アプリを起動  
   ```
   npm run dev
   ```

### English

1. Install dependencies  
   ```
   npm install
   ```
2. Set the GEMINI_API_KEY in .env.local to your Gemini API key  
   Create a `.env.local` file in the project root and add:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Run the app  
   ```
   npm run dev
   ```

---

## 要求環境 / Requirements

- Node.js >= 16
- npm または yarn

---

## ローカル開発 / Development

開発サーバーを起動してホットリロードで確認できます（package.json のスクリプトに依存）。

```
npm run dev
# または
yarn dev
```

ブラウザで http://localhost:3000（またはコンソールに表示される URL）を開いて動作を確認してください。

---

## ビルドとデプロイ / Build & Deploy

```
npm run build
# または
yarn build
```

ビルド成果物を静的ホスティングサービス（Vercel、Netlify、GitHub Pages など）や任意のサーバーにデプロイしてください。

--

## ライセンス / License

MIT
