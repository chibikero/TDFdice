# 🎲 Random Dice Clone - Web Tower Defense

[![CI Build](https://github.com/your-username/random-dice-clone/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/random-dice-clone/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

[**English**](#english) | [**日本語**](#日本語)

---

## 日本語

『Random Dice Clone』は、大人気の協力・対戦型タワーディフェンスゲーム『Random Dice（ランダムダイス）』のゲームメカニクスをブラウザ上で深く再現した、美しくレスポンシブな Web タワーディフェンスゲームです。

ダイスの召喚、同じ目（Pips）と種類の自動合成、アップグレードシステム、本格的な戦闘ウェーブを完全にシミュレートしています。さらに最新のアップデートにより、お好みのゲーム体験に合わせて調整できる**多段階の戦闘速度ブースト（1x / 1.5x / 2x / 3x 倍速）**機能が追加されました！

### 🌟 主な特徴

1. **豊富なダイス特性システム（全20種類以上）**
   - **成長系**: 「成長（Growth）」「ランダム成長（Random Growth）」「壊れた成長（Broken Growth）」「種（Seed）」などの自動進化。
   - **攻撃・特殊効果系**: 「光の剣（LightSword）」「錆びた剣（RustSword）」「原子（Atomic）」「軌道（Orbit）」「サイス（Scythe）」「虹（Rainbow）」などの割合ダメージや即死効果。
   - **状態異常系**: 「吹雪（Snowy）」「ロック（Lock）」「クレヨン（Crayon）」「時間（Time）」などの移動速度低下、拘束、毒付与。
   - **SP収集系**: 「パラサイト（Parasite）」などの撃破時ボーナス。
   2. **本格的なカードゲーム的ビルド要素**
   - デッキ編成システム（デッキから5個選択可能）。
   - ゲーム内通貨SPを消費してダイスを召喚・合成。
   - ディフェンスバトルを乗り越えて進むウェーブラウンド制（敵の体力はラウンド毎に増加）。
3. **⚡ 戦闘速度ブースト（新規追加！）**
   - ウェーブ待機中や戦闘中に、戦闘速度を **1x（通常）**、**1.5x**、**2x**、**3x （超高速）** から自在に切り替え可能。
   - プレイスタイルやゲーム展開のテンポに合わせて軽快に遊ぶことができます。
4. **永続的な強化＆ガチャ要素**
   - ガチャでダイスカードを集め、各ダイスのステータスを永続的にレベルアップ。
   - ショップで、初期SP量の底上げやダイス合成時に時々SPを還元するなどのパッシブスキルを永久強化可能。

### 🛠️ 技術スタック

- **フロントエンド:** React 19, TypeScript
- **ビルドツール:** Vite 6
- **アニメーション:** Motion (Framer Motion)
- **アイコン:** Lucide-React
- **スタイリング:** Tailwind CSS v4 (エレガントでサイバーなダークテーマデザイン)

---

## English

**Random Dice Clone** is a highly polished, responsive web-based tower defense simulator inspired by the core mechanics of the classic multiplayer game *Random Dice*. 

Features real-time dice spawning, type/pip merging, leveling up, and relentless waves of enemies. The latest feature update introduces a customizable **Combat Speed Boost system (1x, 1.5x, 2x, 3x)** to let you control the pacing of your gameplay!

### 🌟 Core Features

1. **Diverse Dice Synergy (20+ types)**
   - **Progression (Growth)**: *Growth*, *RandomGrowth*, *BrokenGrowth*, and *Seed* path for automated upgrade triggers over time.
   - **High-Impact Damage**: *LightSword*, *RustSword*, *Atomic*, *Orbit*, *Scythe*, *Rainbow*, and *Death* which offer execute status, percentage-based damage, and instant slays.
   - **Crowd Control**: *Snowy*, *Lock*, *Crayon*, and *Time* to slow down, freeze, or poison targets, and *Whirlwind* for blow-back actions.
2. **True Deck & SP Economy Simulator**
   - Select and customize your 5-dice deck layout before initiating combat.
   - Spawn dice dynamically with SP, then drag and drop identical pips of the same type to merge them.
   - Upgrade dice grades in-battle using SP to multiply specific damage types.
3. **⚡ Customizable Combat Speeds**
   - Seamlessly cycle between **1x**, **1.5x**, **2x**, and **3x** timers during waves or intervals to speed up idle gameplay or manage high-intensity rounds.
4. **Permanent Upgrades & Gacha Shop**
   - Spend earned currencies on random Gacha rolls to gather dice cards and raise permanent individual dice ranks.
   - Spend gold to upgrade passive talents (e.g., initial start SP boosts, merge cashbacks).

---

## 🚀 導入方法・ローカルでの実行方法 (Getting Started)

ローカル環境にリポジトリをクローンして、簡単にアプリケーションを起動できます。

### 前提条件 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (Node Package Manager)

### インストール & 起動手順 (Installation & Run)

```bash
# 1. 依存関係のインストール
npm install

# 2. 開発サーバーの起動 (Port: 3000)
npm run dev
```

ブラウザで `http://localhost:3000` を開くとゲームが起動します。

### ビルド方法 (Production Build)

```bash
# プロダクションビルドを実行して dist/ ディレクトリに静的ファイルを書き出します
npm run build

# ビルドしたアプリのプレビュー
npm run preview
```

---

## 📂 プロジェクト構造 (Repository Layout)

```
.
├── .github/workflows/   # GitHub Actions (CIパイプライン)
│   └── ci.yml
├── src/                 # アプリケーションソースコード
│   ├── App.tsx          # メインのゲーム盤面、合成システム、戦闘ロジック
│   ├── index.css        # Tailwind CSS グローバルスタイル
│   └── main.tsx         # エントリーポイント
├── index.html           # アプリのHTMLベーステンプレート
├── vite.config.ts       # Viteコンフィギュレーション
├── package.json         # 依存関係パッケージおよびスクリプト
└── README.md            # 本ドキュメント
```

## 📄 ライセンス (License)

このプロジェクトは [MIT ライセンス](LICENSE) の元で公開されています。開発・学習用クローンとしてご自由にお使いください。
