import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dice, Cell, DiceType, Enemy } from './types';

const GRID_SIZE = 15;

const generateId = () => Math.random().toString(36).substring(2, 9);

// All 61 unique dice specified by user + 3 new premium dice + 5 expansion dice + 15 new inferior/junior dice
export const ALL_DICE_TYPES: DiceType[] = [
  'Basic', 'Fire', 'Electric', 'Wind', 'Poison', 'Ice', 'Iron', 'Broken', 'Gamble', 'Lock',
  'Light', 'Thorn', 'Melee', 'Mine', 'LightSpeed', 'Absorb', 'Laser', 'Wave', 'StrongWind', 'Hurricane',
  'Switch', 'Teleport', 'ModElectric', 'Infect', 'Death', 'Sacrifice', 'Clone', 'Bounty', 'Berserker', 'Joker',
  'Growth', 'RandomGrowth', 'BrokenGrowth', 'Nutrition', 'Summon', 'Rewind', 'Solar', 'YinYang', 'Typhoon', 'Combo',
  'Atomic', 'LightSword', 'Overheat', 'Charge', 'Soul', 'Gun', 'Moon', 'Scope', 'Blizzard', 'Sand',
  'Flow', 'Shield', 'Snowball', 'Compressor', 'Bubble', 'Hell', 'Guardian', 'Ignite', 'Assassination', 'Royal', 'Nuclear',
  'Ninja', 'Rainbow', 'CherryBlossom', 'Star', 'Metastasis', 'Phoenix', 'BlackHole', 'CloneKing', 'Saikoro',
  'Tornado', 'Prism', 'Vampire', 'Time', 'Meteor',
  'Imitator', 'MiniCombo', 'Sprout', 'Line', 'Firecracker',
  'Orbit', 'Scythe', 'Snowy', 'Seed', 'RustSword', 'Parasite', 'Breeze', 'Crayon', 'Dagger', 'Whirlwind'
];

interface DiceInfo {
  nameJa: string;
  role: string;
  desc: string;
  rarity: 'Common' | 'Rare' | 'Unique' | 'Legendary';
}

export const DICE_DETAILS: Record<DiceType, DiceInfo> = {
  Basic: { nameJa: '基本のダイス', role: '火力', desc: '安定した基本の攻撃を放つシンプルなダイス。', rarity: 'Common' },
  Fire: { nameJa: '火のダイス', role: '火力 (範囲)', desc: '基本攻撃が命中すると、ターゲットとその周囲の敵に爆発範囲ダメージを与える。', rarity: 'Rare' },
  Electric: { nameJa: '電気のダイス', role: '火力 (連鎖)', desc: '基本攻撃が命中すると、ターゲットを含めた最大3体の敵へダメージが連鎖する。', rarity: 'Rare' },
  Wind: { nameJa: '風のダイス', role: '火力 (単体速射)', desc: '常に攻撃速度が一定の割合で上昇している、手数の多い単体アタッカー。', rarity: 'Rare' },
  Poison: { nameJa: '毒のダイス', role: '持続ダメージ', desc: '攻撃が命中した敵を毒状態にし、1秒ごとに継続的な持続ダメージを与える。', rarity: 'Common' },
  Ice: { nameJa: '氷のダイス', role: '妨害 (遅延)', desc: '攻撃が命中した敵の移動速度を永続的に減少（鈍足化）させる。', rarity: 'Common' },
  Iron: { nameJa: '鉄のダイス', role: '火力 (ボス優先)', desc: '残りHP（数値）が一番高い敵（ボスやミニボスなど）を最優先で狙い撃ちする。', rarity: 'Rare' },
  Broken: { nameJa: '壊れたダイス', role: '火力 (ランダム)', desc: '攻撃対象が常に完全ランダムに切り替わる代わりに、基本攻撃力が少し高めに設定されている。', rarity: 'Common' },
  Gamble: { nameJa: 'ギャンブルのダイス', role: '火力 (確率変動)', desc: '攻撃するたびに、ダメージが最低値からクリティカルダメージの間のランダムな値に変動する。', rarity: 'Rare' },
  Lock: { nameJa: 'ロックダイス', role: '妨害 (拘束)', desc: '攻撃した敵を一定確率でその場に固定し、一時的に移動を完全に封じる。', rarity: 'Rare' },
  Light: { nameJa: '光のダイス', role: '攻撃速度バフ', desc: '自身の攻撃能力は持たないが、上下左右（十字方向）に隣接するダイスの攻撃速度を上昇させるバフを与える。', rarity: 'Unique' },
  Thorn: { nameJa: 'トゲのダイス', role: 'トラップ設置', desc: '敵が通る道の上に一定周期でトゲを設置し、その上を踏んだ敵全体に範囲ダメージを与える。', rarity: 'Unique' },
  Melee: { nameJa: '近接のダイス', role: '火力 (ピンチ強化)', desc: 'ターゲットとの距離が近いほど攻撃力が上昇する。自陣の防衛ライン（ゴール付近）に追い詰められるほど高火力を発揮する。', rarity: 'Unique' },
  Mine: { nameJa: '地雷のダイス', role: 'トラップ爆発', desc: '道の上に特殊な地雷を設置する。モンスターが地雷を踏むと爆発し、強力な範囲ダメージを与える。', rarity: 'Unique' },
  LightSpeed: { nameJa: '光速のダイス', role: '火力 (確率加速)', desc: '基本攻撃中、一定確率で一定時間超高速で弾を連射する「光速モード」に突入する。', rarity: 'Unique' },
  Absorb: { nameJa: '吸収のダイス', role: 'SP獲得', desc: '攻撃が命中した敵から一定時間ごとにSP（召喚ポイント）を吸収し、自分の資源を増やす。', rarity: 'Unique' },
  Laser: { nameJa: 'レーザーのダイス', role: '火力 (段階上昇)', desc: '同じ敵をターゲットとして攻撃し続ける時間に応じて、段階的にレーザーのダメージが上昇（最大5倍）する。', rarity: 'Unique' },
  Wave: { nameJa: '波動のダイス', role: '火力 (密集強化)', desc: '攻撃が命中した瞬間、ターゲットの周囲にいる敵の数（密集度）が多いほど、爆発的にダメージが跳ね上がる。', rarity: 'Unique' },
  StrongWind: { nameJa: '強風のダイス', role: '火力 (形態変化)', desc: '風の上位互換。一定周期で第2形態（強風状態）に変身し、攻撃速度が飛躍的にアップする。', rarity: 'Unique' },
  Hurricane: { nameJa: '狂風のダイス', role: '火力 (変身限界加熱)', desc: '強風をさらに尖らせた性能。定期的に攻撃速度が限界突破（マックス状態）に達し、超高速連射する。', rarity: 'Legendary' },
  Switch: { nameJa: 'スイッチのダイス', role: '位置調整サポート', desc: '盤面にある他の任意のダイスと位置を自由に入れ替えることができる（タップして対象を選択）。', rarity: 'Rare' },
  Teleport: { nameJa: 'テレポートのダイス', role: '位置巻き戻し', desc: '攻撃した敵を自分の盤面に吸収（ストック）し、合成した瞬間にまとめてスタート地点へ引き戻す。', rarity: 'Unique' },
  ModElectric: { nameJa: '改造電気のダイス', role: '火力 (複数連鎖)', desc: '自身の目の数（ランク）と同じ数だけの敵に同時に高電圧電気を連鎖させて攻撃する範囲アタッカー。', rarity: 'Unique' },
  Infect: { nameJa: '感染のダイス', role: '持続毒ガス', desc: '攻撃した敵を感染状態にする。感染した敵が倒れるとその場にガスを発生させ、踏んだ敵に範囲持続ダメージを与える。', rarity: 'Unique' },
  Death: { nameJa: '死のダイス', role: '確率即死', desc: '基本攻撃が命中した際、ボスやミニボス以外の一般モンスターを低確率(5%)で一撃で即死させる。', rarity: 'Unique' },
  Sacrifice: { nameJa: '生贄のダイス', role: '即時SP獲得', desc: 'このダイス同士を合成した瞬間に、多量なSP（出目×100 SP）を即座に獲得できる。', rarity: 'Rare' },
  Clone: { nameJa: '複製のダイス', role: '自動盤面構築', desc: '盤面に配置されている間、一定時間（20秒）ごとに自身の目の数と同じ星のダイスを空いているマスに自動生成する。', rarity: 'Legendary' },
  Bounty: { nameJa: '賞金稼ぎのダイス', role: '討伐ボーナス', desc: '敵に「賞金（マーク）」を付与する。マークされた敵を倒すと追加でSPを獲得する。', rarity: 'Rare' },
  Berserker: { nameJa: 'バーサーカーのダイス', role: '防衛ラストスタンド', desc: '敵が防衛ラインの半分（中間地点）を超えて侵入してくると、攻撃力と攻撃速度が3倍に跳ね上がるピンチ救済型。', rarity: 'Unique' },
  Joker: { nameJa: 'ジョーカーのダイス', role: '万能コピー', desc: '盤面上の同じ星のダイスへドラッグ（合成操作）すると、変身してそのダイスと全く同じものになれる。', rarity: 'Legendary' },
  Growth: { nameJa: '成長のダイス', role: '自動進化', desc: '盤面に召喚されてから約10秒が経過すると、確定で出目が1つ上のランダムなダイスに自動進化する。', rarity: 'Legendary' },
  RandomGrowth: { nameJa: 'ランダム成長', role: '一撃ジャンプ', desc: '進化までに長く（15秒）かかるが、運が良いと最大で「出目7」まで一気にランダムジャンプアップ進化する。', rarity: 'Legendary' },
  BrokenGrowth: { nameJa: '壊れた成長', role: 'リスク進化', desc: '一定時間経過で自動進化を試みるが、確率で進化に失敗しランクが下がってしまうリスクがある。', rarity: 'Rare' },
  Nutrition: { nameJa: '栄養のダイス', role: 'ランク増加素材', desc: '同じランクの他のダイスと合成することで、相手の種類を変えずにランクだけを1つ上げることができる。', rarity: 'Legendary' },
  Summon: { nameJa: '召喚のダイス', role: '即時追加召喚', desc: '他のダイスと合成した際、自陣の空いているマスにランダムなダイスを1体無料で即座に召喚する。', rarity: 'Legendary' },
  Rewind: { nameJa: 'リワインドのダイス', role: '妨害 (巻き戻し)', desc: '合成した瞬間、一番前を進む敵全体の進行時間・位置を2秒半分（後方へ）強制的に巻き戻す。', rarity: 'Legendary' },
  Solar: { nameJa: '太陽のダイス', role: '極大活性化', desc: '盤面にあるこのダイスの総数が「1、4、9個」の時だけ活性化。大範囲爆発と、同じ敵を攻撃し続けると乗算上昇。', rarity: 'Legendary' },
  YinYang: { nameJa: '陰陽のダイス', role: '完全調和', desc: '縦一列、または横一列に綺麗に並べて揃えることで「調和」が発動。攻撃速度と威力が最高潮になる。', rarity: 'Legendary' },
  Typhoon: { nameJa: '台風のダイス', role: '火力 (確定クリ)', desc: '一定周期ごとに極限超連射し、その間すべての攻撃が確定クリティカル（3倍ダメージ）になる極火力。', rarity: 'Legendary' },
  Combo: { nameJa: 'コンボのダイス', role: '無限成長', desc: 'このダイス同士を合成した回数（コンボ数）が増えるほど、ゲーム中ずっと永久にメイン攻撃力が上昇し続ける。', rarity: 'Legendary' },
  Atomic: { nameJa: '原子のダイス', role: '割合現在HP', desc: 'ダイスの周囲を回る原子球（元素）が、触れた敵の現在の残りHPの4%を継続して削り取る。外周配置推奨。', rarity: 'Legendary' },
  LightSword: { nameJa: '光の剣のダイス', role: '割合天罰', desc: '基本攻撃の際、10%の確率で「天界の剣」を召喚し、敵の現在HPの半分（割合）を一気に削り落とす。', rarity: 'Legendary' },
  Overheat: { nameJa: '過熱のダイス', role: 'SPバースト火力', desc: 'SPを消費して一時的に「過熱状態」に切り替える。過熱状態の問、全過熱ダイスの火力が3倍に爆発する。', rarity: 'Legendary' },
  Charge: { nameJa: 'チャージのダイス', role: '無限強化貯蓄', desc: 'アタックモードと、SPを吸収して自身の専用チャージレベル（攻撃力）を永続的に上げるモードを任意で切り替え。', rarity: 'Legendary' },
  Soul: { nameJa: '魂のダイス', role: '魂収集火力', desc: '敵を倒した際に出る「魂（ソウル）」を吸い取るほど、基本攻撃力が永続的に上昇していく（全ソウル共有）。', rarity: 'Legendary' },
  Gun: { nameJa: '銃のダイス', role: '武器変幻', desc: '星（ランク）が上がるにつれて武器が（ピストル→ショットガン→狙撃銃）へ変化。星7で極大狙撃手。', rarity: 'Legendary' },
  Moon: { nameJa: '月のダイス', role: '極限バフ', desc: '隣接する（上下左右）のダイスに、攻撃速度、クリティカル率を最大まで引き上げる爆発的バフを配布。', rarity: 'Legendary' },
  Scope: { nameJa: 'スコープのダイス', role: '拡散バフ', desc: '隣接するダイスに、メインターゲット以外の他の敵を自動で追撃して複数同時射撃させる追加能力を与える。', rarity: 'Legendary' },
  Blizzard: { nameJa: '吹雪のダイス', role: '画面全体遅延', desc: '一定周期ごとに吹雪を巻き起こし、画面全体のすべての敵を永続的(最大3スタック)に遅延拘束する。', rarity: 'Legendary' },
  Sand: { nameJa: '砂のダイス', role: '妨害 (高遅延)', desc: '攻撃が当たるたびに、敵の進行移動速度を強烈（最大70%スロー）に引き落として固める。', rarity: 'Unique' },
  Flow: { nameJa: 'フローのダイス', role: '全体常時遅延', desc: '盤面に配置して維持しているだけで、敵全体の進軍速度を常時1.5%ずつ引き落としてスローダウンさせる。', rarity: 'Legendary' },
  Shield: { nameJa: '盾のダイス', role: '物理足止め', desc: '敵の進軍路上に一時的な「光の盾」を設置する。敵は盾が破壊されるまで進めなくなり、物理停止する。', rarity: 'Unique' },
  Snowball: { nameJa: 'スノーボール', role: '段階凍結スタン', desc: '同一敵へ弾が命中するたびに氷結ゲージが蓄積。3回蓄積すると2秒間完全に足を停止させて気絶させる。', rarity: 'Unique' },
  Compressor: { nameJa: 'コンプレッサー', role: '引き寄せ密集', desc: '流れてくる敵を引き寄せて自発的に1箇所に中心密集させ、周囲の範囲ダメージダイスで一掃しやすくする。', rarity: 'Legendary' },
  Bubble: { nameJa: 'バブルのダイス', role: 'クリティカル加算', desc: '自陣の配置ダイス全体にクリーンバブルを付与。クリティカル発生率と、特殊妨害防御を1回提供。', rarity: 'Legendary' },
  Hell: { nameJa: '地獄のダイス', role: '即死バフ配布', desc: '上下左右に隣接するアタッカー達に、一般敵（ボス・ミニボスを除く）を低確率で即座に昇天（即死）させる呪いを付与。', rarity: 'Legendary' },
  Guardian: { nameJa: '守護者のダイス', role: '連鎖育成火力', desc: '自身の周囲マスで他のダイスが進化・マージするたびに攻撃スタック(最大10)を溜め込み、飛躍的に輝く。', rarity: 'Legendary' },
  Ignite: { nameJa: '点火のダイス', role: '延焼感染火炎', desc: '攻撃時に相手を永続炎上させ、その炎上した敵が前後の他の敵へ接近することで、隣の次へ炎を次々燃え移す。', rarity: 'Legendary' },
  Assassination: { nameJa: '暗殺のダイス', role: '支援ミサイル', desc: '合成時、高威力かつ複数へホーミングする「暗殺ミサイル」を空から呼び寄せ、前方高耐久の敵を瞬時に削る。', rarity: 'Legendary' },
  Royal: { nameJa: 'ロイヤルのダイス', role: 'タクティカル変化', desc: '合成時、自分のお手元の低ランク・不揃いダイス達をランダム別ダイス種にシャッフルし、新たな布陣に変身させる。', rarity: 'Legendary' },
  Nuclear: { nameJa: '核のダイス', role: '緊急マップ爆破', desc: '合成時、マップ全域へ壊滅的な原子力を誘発。画面中すべて並んでいる敵全体の現HPを一瞬で50%爆砕削減する。', rarity: 'Legendary' },
  Ninja: { nameJa: '忍者のダイス', role: '火力 (貫通手裏剣)', desc: '鋭い貫通手裏剣を放つ。攻撃が命中すると、そのターゲットとその直後にいる敵にも同時ダメージを与える。', rarity: 'Legendary' },
  Rainbow: { nameJa: '虹のダイス', role: '全属性攻撃', desc: '七色の弾を放ち、攻撃時に確率で「火(爆破)」「毒」「氷(強スロー)」のすべてを追加かつ強力に同時付与する。', rarity: 'Legendary' },
  CherryBlossom: { nameJa: '桜のダイス', role: '隣接アプバフ＆全体散華', desc: '上下左右に隣接するアタッカー達の与ダメージを1.5倍にする。さらに3秒ごとに、画面全体の敵へサクラの華麗な舞微ダメージを与える。', rarity: 'Legendary' },
  Star: { nameJa: '星のダイス', role: '火力 (隕石落下)', desc: '宇宙からのエネルギー！攻撃時に非常に高い確率（25%）で巨大な流れ星を落とし、大爆発の壊滅的範囲ダメージ（5倍）を与える。', rarity: 'Legendary' },
  Metastasis: { nameJa: '転移のダイス', role: 'SP獲得（マージ）', desc: '合成（マージ）した瞬間に、超高速で移動するゴールド級の「転移エイリアン」をルート上に召喚。討伐すると即座に300SPを追加獲得！', rarity: 'Legendary' },
  Phoenix: { nameJa: '不死鳥のダイス', role: '火力（第2形態変身）', desc: '通常は炎ショット。一定周期（4秒中4秒間）で熱狂の「不死鳥・第2形態」に変身し、全攻撃を3倍にしつつ強烈な広範囲持続炎上を巻き起こす！', rarity: 'Legendary' },
  BlackHole: { nameJa: 'ブラックホール', role: '強力吸引・妨害（超重力）', desc: '攻撃時に、ターゲットを中心に極大重力場を発生。周囲15マス内の全エネミーを中心点にギュッと吸い寄せて超鈍足スローダウン（80%）させる。', rarity: 'Legendary' },
  CloneKing: { nameJa: '複製王のダイス', role: '無限複製＆自動融合', desc: '盤面にいるだけで、一定時間ごとに自マスと同じ出目の自分のクローンを自動生成。さらに盤面に4体以上並ぶすると、自動で上位へと融合進化する複製王。', rarity: 'Legendary' },
  Saikoro: { nameJa: 'サイコロのダイス', role: '火力（ギャンブル超倍撃）', desc: '攻撃のたびに１〜６の目をダイスロール！出目の数字に応じて、そのショットの威力が最大９倍に跳ね上がる超ギャンブル型ダイス。伝説級。', rarity: 'Legendary' },
  Tornado: { nameJa: '竜巻のダイス', role: '妨害・範囲撃破 (Tornado)', desc: '一定確率で敵を巻き込んで空中へ浮かび上がらせ、高確率で追加の持続竜巻旋風を周囲にばら撒く。', rarity: 'Legendary' },
  Prism: { nameJa: 'プリズムのダイス', role: '火力・反射 (Prism)', desc: '放たれる光線がターゲットを貫通し、さらに隣接する他の最大4体の敵に対しても70%の威力で反射連鎖して降り注ぐ精密弾。', rarity: 'Legendary' },
  Vampire: { nameJa: '吸血のダイス', role: 'SP獲得・吸収 (Vampire)', desc: '攻撃命中時に敵から吸収するエネルギーをSPに変換。さらにターゲットの残りHPが高いほど、与えるダメージが1.5倍に増加する。', rarity: 'Unique' },
  Time: { nameJa: '時間のダイス', role: '妨害・時間遅延 (Time)', desc: '3秒ごとに画面全体のすべての敵の進行時間を0.5秒間完全に時止め（ストップ）し、一定確率で敵全体の速度を大きく減少（2秒間50%減）させる。', rarity: 'Legendary' },
  Meteor: { nameJa: '流星のダイス', role: '火力・隕石 (Meteor)', desc: '強烈な炎をまとった流星群を盤面から敵に向けて召喚する。弾数が非常に多く、敵が密集したゾーンで大爆発を起こす。', rarity: 'Legendary' },
  Imitator: { nameJa: 'イミテーターのダイス', role: '確率コピーサポート', desc: '同じ星 of ダイスへ合成すると、70%の確率でそのダイスに変身コピーできる、ジョーカーの下位互換ダイス。風変わり。', rarity: 'Rare' },
  MiniCombo: { nameJa: 'プチコンボのダイス', role: '制限コンボ火力', desc: '合成するたびに累積コンボ数が増え威力が上昇するが、最大10コンボまで（1コンボにつき威力+2）しか蓄積できない、コンボの下位互換。', rarity: 'Rare' },
  Sprout: { nameJa: '新芽のダイス', role: '確率追加召喚', desc: '他のダイスと合成した際、50%の確率で空きマスにランダムなダイスを1体追加召喚する、召喚の下位互換。', rarity: 'Rare' },
  Line: { nameJa: 'ラインのダイス', role: '整列活性化', desc: '縦一列または横一列に3体以上並んだ時だけ活性化し、自身の攻撃速度が1.5倍になる、陰陽の下位互換。', rarity: 'Rare' },
  Firecracker: { nameJa: '爆竹のダイス', role: '近接爆破削り', desc: '合成した瞬間に、ターゲットの周囲の敵に現在HPの15%の割合ダメージを与える、核の下位互換。一般級。', rarity: 'Common' },
  Orbit: { nameJa: 'オービットのダイス', role: '割合現在HP (プチ原子)', desc: 'ダイスの周囲を小さく回る電子弾が、触れたエネミーの現在の残りHPの1%を少しずつ削り出す、原子の下位互換。', rarity: 'Rare' },
  Scythe: { nameJa: '小鎌のダイス', role: '確率即死 (プチ死神)', desc: '基本攻撃が命中した際、一般モンスター(ボス以外)を非常に低い確率(1.5%)で即死させる、死の下位互換。', rarity: 'Common' },
  Snowy: { nameJa: '粉雪のダイス', role: '妨害 (プチ遅延/吹雪)', desc: '攻撃命中時に15%の確率で、そのターゲットを少しの間スローダウン（25%遅延、1.5秒）させる、吹雪・氷の下位互換。', rarity: 'Common' },
  Seed: { nameJa: '種のダイス', role: '遅延進化 (プチ成長)', desc: '盤面に召喚されてから25秒が経過すると、次の出目へとゆっくり自動進化するが、星3までしか成長できない、成長の下位互換。', rarity: 'Common' },
  RustSword: { nameJa: '錆びた剣のダイス', role: '割合ダメージ (プチ剣)', desc: '基本攻撃の際、8%の確率で「プチ錆び剣」を召喚し、敵の現在HPの15%（割合）を割合カットする、光の剣の下位互換。', rarity: 'Rare' },
  Parasite: { nameJa: '寄生虫のダイス', role: 'マージSP獲得 (プチ転移)', desc: '合成した瞬間に、体力の非常に低いおやつ級の「寄生虫エイリアン」をルートに召喚、倒すと50SPを追加獲得する、転移の下位互換。', rarity: 'Common' },
  Breeze: { nameJa: '微風のダイス', role: '確率小加速 (プチ台風)', desc: '基本攻撃中、5秒ごとに25%の確率で「微風バースト状態（1秒間攻撃速度が1.5倍）」に突入する、台風や強風の下位互換。', rarity: 'Common' },
  Crayon: { nameJa: 'クレヨンのダイス', role: '多属性攻撃 (プチ虹)', desc: '赤(爆音)・青(氷結)・緑(毒)のクレヨン弾をランダムで放ち、10%の確率でそれぞれのミニ効果を誘発する、虹の下位互換。', rarity: 'Rare' },
  Dagger: { nameJa: '短剣のダイス', role: 'マージ射撃ダメージ (プチ暗殺)', desc: '合成した瞬間に、一番先頭を走る敵に向けて高速の投げナイフを連射し、180ダメージを与える、暗殺の下位互換。', rarity: 'Common' },
  Whirlwind: { nameJa: 'つむじ風のダイス', role: '微巻き戻し (プチ竜巻・テレポート)', desc: '基本攻撃が命中した際、4%の確率でその敵を微少に巻き戻す（進行度1%後退）そよ風。竜巻・テレポートの下位互換。', rarity: 'Rare' },
};

const getDiceColor = (type: DiceType) => {
  const base = 'bg-slate-800 border-slate-700 text-slate-400';
  const colors: Record<DiceType, string> = {
    Basic: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    Fire: 'bg-red-500/20 border-red-500/50 text-red-400',
    Electric: 'bg-yellow-600/20 border-yellow-600/50 text-yellow-300',
    Wind: 'bg-sky-500/20 border-sky-500/50 text-sky-400',
    Poison: 'bg-green-700/20 border-green-700/50 text-green-400',
    Ice: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
    Iron: 'bg-slate-500/20 border-slate-500/50 text-slate-300',
    Broken: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    Gamble: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
    Lock: 'bg-gray-500/20 border-gray-500/50 text-gray-400',
    Light: 'bg-yellow-200/20 border-yellow-200/50 text-yellow-200',
    Thorn: 'bg-emerald-800/20 border-emerald-800/50 text-emerald-600',
    Melee: 'bg-red-800/20 border-red-800/50 text-red-600',
    Mine: 'bg-amber-900/20 border-amber-900/50 text-amber-700',
    LightSpeed: 'bg-blue-300/20 border-blue-300/50 text-blue-300',
    Absorb: 'bg-teal-500/20 border-teal-500/50 text-teal-400',
    Laser: 'bg-rose-500/20 border-rose-500/50 text-rose-400',
    Wave: 'bg-blue-800/20 border-blue-800/50 text-blue-600',
    StrongWind: 'bg-sky-700/20 border-sky-700/50 text-sky-500',
    Hurricane: 'bg-sky-900/20 border-sky-900/50 text-sky-700',
    Switch: 'bg-lime-500/20 border-lime-500/50 text-lime-400',
    Teleport: 'bg-indigo-700/20 border-indigo-700/50 text-indigo-500',
    ModElectric: 'bg-yellow-700/20 border-yellow-700/50 text-yellow-600',
    Infect: 'bg-green-900/20 border-green-900/50 text-green-700',
    Death: 'bg-neutral-900/40 border-neutral-700 text-neutral-300',
    Sacrifice: 'bg-red-950/20 border-red-950/50 text-red-900',
    Clone: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    Bounty: 'bg-yellow-400/20 border-yellow-400/50 text-yellow-500',
    Berserker: 'bg-red-700/20 border-red-700/50 text-red-500',
    Joker: 'bg-violet-600/20 border-violet-600/50 text-violet-400',
    Growth: 'bg-pink-500/20 border-pink-500/50 text-pink-400',
    RandomGrowth: 'bg-pink-700/20 border-pink-700/50 text-pink-600',
    BrokenGrowth: 'bg-pink-900/20 border-pink-900/50 text-pink-800',
    Nutrition: 'bg-orange-300/20 border-orange-300/50 text-orange-200',
    Summon: 'bg-emerald-300/20 border-emerald-300/50 text-emerald-200',
    Rewind: 'bg-slate-300/20 border-slate-300/50 text-slate-200',
    Solar: 'bg-amber-400/20 border-amber-400/50 text-amber-300',
    YinYang: 'bg-white/20 border-white/50 text-white',
    Typhoon: 'bg-cyan-700/20 border-cyan-700/50 text-cyan-500',
    Combo: 'bg-indigo-400/20 border-indigo-400/50 text-indigo-300',
    Atomic: 'bg-red-400/20 border-red-400/50 text-red-300',
    LightSword: 'bg-yellow-100/20 border-yellow-100/50 text-yellow-100',
    Overheat: 'bg-orange-800/20 border-orange-800/50 text-orange-600',
    Charge: 'bg-blue-900/20 border-blue-900/50 text-blue-700',
    Soul: 'bg-purple-900/20 border-purple-900/50 text-purple-700',
    Gun: 'bg-slate-700/20 border-slate-700/50 text-slate-500',
    Moon: 'bg-blue-200/20 border-blue-200/50 text-blue-100',
    Scope: 'bg-green-400/20 border-green-400/50 text-green-300',
    Blizzard: 'bg-blue-400/20 border-blue-400/50 text-blue-300',
    Sand: 'bg-yellow-800/20 border-yellow-800/50 text-yellow-600',
    Flow: 'bg-sky-400/20 border-sky-400/50 text-sky-300',
    Shield: 'bg-cyan-800/20 border-cyan-800/50 text-cyan-600',
    Snowball: 'bg-white/40 border-white/80 text-white',
    Compressor: 'bg-zinc-600/20 border-zinc-600/50 text-zinc-400',
    Bubble: 'bg-sky-200/20 border-sky-200/50 text-sky-100',
    Hell: 'bg-red-950/40 border-red-950/80 text-red-700',
    Guardian: 'bg-yellow-700/40 border-yellow-700/80 text-yellow-500',
    Ignite: 'bg-red-600/40 border-red-600/80 text-red-400',
    Assassination: 'bg-black/60 border-neutral-700 text-gray-400',
    Royal: 'bg-amber-500/40 border-amber-500/80 text-yellow-300',
    Nuclear: 'bg-emerald-900/60 border-emerald-900/90 text-emerald-500',
    Ninja: 'bg-zinc-900/80 border-purple-500/50 text-indigo-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]',
    Rainbow: 'bg-gradient-to-br from-red-500/20 via-green-500/10 to-blue-500/25 border-pink-400 text-pink-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]',
    CherryBlossom: 'bg-pink-500/15 border-pink-400 text-pink-200 shadow-[0_0_8px_rgba(236,72,153,0.35)]',
    Star: 'bg-indigo-950/40 border-purple-500/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    Metastasis: 'bg-emerald-950/40 border-emerald-400/80 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]',
    Phoenix: 'bg-orange-950/40 border-red-500/80 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.5)]',
    BlackHole: 'bg-neutral-950/50 border-indigo-500/85 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
    CloneKing: 'bg-violet-950/45 border-violet-400/80 text-violet-300 shadow-[0_0_12px_rgba(232,121,249,0.5)]',
    Saikoro: 'bg-amber-950/40 border-yellow-500/85 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.65)]',
    Tornado: 'bg-teal-900/30 border-teal-400 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.5)] animate-pulse',
    Prism: 'bg-gradient-to-tr from-pink-500/30 via-sky-500/30 to-yellow-500/30 border-white text-yellow-100 shadow-[0_0_15px_rgba(255,255,255,0.6)]',
    Vampire: 'bg-red-950/50 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.55)]',
    Time: 'bg-indigo-900/45 border-indigo-400 text-indigo-200 shadow-[0_0_12px_rgba(129,140,248,0.5)]',
    Meteor: 'bg-orange-850/40 border-amber-500 text-amber-300 shadow-[0_0_13px_rgba(245,158,11,0.55)]',
    Imitator: 'bg-violet-950/30 border-violet-800/60 text-violet-400',
    MiniCombo: 'bg-indigo-950/25 border-indigo-900/50 text-indigo-400',
    Sprout: 'bg-emerald-950/20 border-emerald-950/50 text-emerald-400',
    Line: 'bg-slate-900/40 border-slate-700/60 text-slate-300',
    Firecracker: 'bg-red-950/15 border-red-950/40 text-red-400',
    Orbit: 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300',
    Scythe: 'bg-neutral-900/30 border-neutral-700/40 text-neutral-400',
    Snowy: 'bg-sky-950/20 border-sky-800/40 text-sky-300',
    Seed: 'bg-amber-950/15 border-amber-900/30 text-amber-500',
    RustSword: 'bg-stone-900/40 border-stone-700/50 text-stone-400',
    Parasite: 'bg-rose-950/20 border-yellow-800/30 text-yellow-500',
    Breeze: 'bg-cyan-950/20 border-cyan-800/30 text-cyan-400',
    Crayon: 'bg-gradient-to-r from-red-500/10 via-green-500/10 to-blue-500/10 border-slate-500 text-purple-300',
    Dagger: 'bg-zinc-850 border-zinc-700/45 text-zinc-300',
    Whirlwind: 'bg-teal-950/15 border-teal-900 text-teal-400',
  };
  return colors[type] || base;
};

export interface UnlockCondition {
  wave?: number;
  kills?: number;
  cost?: number;
  gachaOnly?: boolean;
  label: string;
}

export const DICE_UNLOCK_CONDITIONS: Record<DiceType, UnlockCondition> = {
  Basic: { cost: 0, label: '初期開放' },
  Fire: { cost: 0, label: '初期開放' },
  Electric: { cost: 0, label: '初期開放' },
  Wind: { cost: 0, label: '初期開放' },
  Poison: { cost: 0, label: '初期開放' },
  Ice: { cost: 0, label: '初期開放' },
  Iron: { cost: 0, label: '初期開放' },
  Broken: { cost: 0, label: '初期開放' },
  Gamble: { cost: 0, label: '初期開放' },
  Lock: { cost: 0, label: '初期開放' },
  Growth: { cost: 0, label: '初期開放' },
  
  // Condition/Achievement Dice (Strictly unlocked by wave or kills, no shard cost)
  Light: { wave: 5, label: '到達ウェーブ 5 以上で自動解放' },
  Thorn: { kills: 100, label: '累計 100キル達成で自動解放' },
  Melee: { wave: 6, label: '到達ウェーブ 6 以上で自動解放' },
  Mine: { kills: 250, label: '累計 250キル達成で自動解放' },
  LightSpeed: { wave: 8, label: '到達ウェーブ 8 以上で自動解放' },
  Absorb: { wave: 6, label: '到達ウェーブ 6 以上で自動解放' },
  Laser: { wave: 9, label: '到達ウェーブ 9 以上で自動解放' },
  Wave: { wave: 10, label: '到達ウェーブ 10 以上で自動解放' },
  StrongWind: { wave: 7, label: '到達ウェーブ 7 以上で自動解放' },
  Switch: { wave: 5, label: '到達ウェーブ 5 以上で自動解放' },
  Teleport: { wave: 8, label: '到達ウェーブ 8 以上で自動解放' },
  ModElectric: { wave: 7, label: '到達ウェーブ 7 以上で自動解放' },
  Infect: { wave: 9, label: '到達ウェーブ 9 以上で自動解放' },
  Death: { wave: 12, label: '到達ウェーブ 12 以上で自動解放' },
  BrokenGrowth: { wave: 7, label: '到達ウェーブ 7 以上で自動解放' },
  Sand: { wave: 11, label: '到達ウェーブ 11 以上で自動解放' },
  Shield: { wave: 8, label: '到達ウェーブ 8 以上で自動解放' },
  Snowball: { wave: 10, label: '到達ウェーブ 10 以上で自動解放' },
  Compressor: { wave: 11, label: '到達ウェーブ 11 以上で自動解放' },
  Bubble: { wave: 13, label: '到達ウェーブ 13 以上で自動解放' },
  Berserker: { wave: 14, label: '到達ウェーブ 14 以上で自動解放' },
  Rewind: { wave: 15, label: '到達ウェーブ 15 以上で自動解放' },
  Charge: { wave: 16, label: '到達ウェーブ 16 以上で自動解放' },
  Soul: { wave: 17, label: '到達ウェーブ 17 以上で自動解放' },
  Ignite: { wave: 18, label: '到達ウェーブ 18 以上で自動解放' },
  Hurricane: { wave: 20, label: '到達ウェーブ 20 以上で自動解放' },

  // Gacha Dedicated Premium Dice
  Sacrifice: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Clone: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Bounty: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Joker: { gachaOnly: true, label: '🌌 ガチャ限定' },
  RandomGrowth: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Nutrition: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Summon: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Solar: { gachaOnly: true, label: '🌌 ガチャ限定' },
  YinYang: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Typhoon: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Combo: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Atomic: { gachaOnly: true, label: '🌌 ガチャ限定' },
  LightSword: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Overheat: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Gun: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Moon: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Scope: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Blizzard: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Flow: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Hell: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Guardian: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Assassination: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Royal: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Nuclear: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Ninja: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Rainbow: { gachaOnly: true, label: '🌌 ガチャ限定' },
  CherryBlossom: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Star: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Metastasis: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Phoenix: { gachaOnly: true, label: '🌌 ガチャ限定' },
  BlackHole: { gachaOnly: true, label: '🌌 ガチャ限定' },
  CloneKing: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Saikoro: { gachaOnly: true, label: '🌌 ガチャ限定' },
  Tornado: { gachaOnly: true, label: '🌌 ガチャ限定・ショップ限定' },
  Prism: { gachaOnly: true, label: '🌌 ガチャ限定・ショップ限定' },
  Vampire: { gachaOnly: true, label: '🌌 ガチャ限定・ショップ限定' },
  Time: { gachaOnly: true, label: '🌌 ガチャ限定・ショップ限定' },
  Meteor: { gachaOnly: true, label: '🌌 ガチャ限定・ショップ限定' },
  Imitator: { wave: 4, label: '到達ウェーブ 4 以上で自動解放' },
  MiniCombo: { wave: 6, label: '到達ウェーブ 6 以上で自動解放' },
  Sprout: { wave: 5, label: '到達ウェーブ 5 以上で自動解放' },
  Line: { wave: 7, label: '到達ウェーブ 7 以上で自動解放' },
  Firecracker: { cost: 0, label: '初期開放' },
  Orbit: { wave: 3, label: '到達ウェーブ 3 以上で自動解放' },
  Scythe: { cost: 0, label: '初期開放' },
  Snowy: { cost: 0, label: '初期開放' },
  Seed: { cost: 0, label: '初期開放' },
  RustSword: { wave: 4, label: '到達ウェーブ 4 以上で自動解放' },
  Parasite: { wave: 2, label: '到達ウェーブ 2 以上で自動解放' },
  Breeze: { cost: 0, label: '初期開放' },
  Crayon: { wave: 5, label: '到達ウェーブ 5 以上で自動解放' },
  Dagger: { wave: 3, label: '到達ウェーブ 3 以上で自動解放' },
  Whirlwind: { wave: 4, label: '到達ウェーブ 4 以上で自動解放' },
};

export const getDiceRelations = (type: DiceType): { inferiors: DiceType[]; superiors: DiceType[] } => {
  const relations: Partial<Record<DiceType, { inferiors: DiceType[]; superiors: DiceType[] }>> = {
    Basic: { inferiors: [], superiors: ['Fire', 'Electric', 'Wind', 'Poison', 'Ice', 'Iron', 'Broken', 'Gamble', 'Imitator', 'MiniCombo', 'Sprout', 'Line', 'Firecracker', 'Orbit', 'Scythe', 'Snowy', 'Seed', 'RustSword', 'Parasite', 'Breeze', 'Crayon', 'Dagger', 'Whirlwind'] },
    Wind: { inferiors: ['Basic', 'Breeze'], superiors: ['StrongWind'] },
    StrongWind: { inferiors: ['Wind'], superiors: ['Hurricane'] },
    Hurricane: { inferiors: ['StrongWind'], superiors: ['Typhoon'] },
    Typhoon: { inferiors: ['Hurricane'], superiors: ['Tornado'] },
    Tornado: { inferiors: ['Typhoon', 'Whirlwind'], superiors: [] },
    Ice: { inferiors: ['Basic', 'Snowy'], superiors: ['Blizzard', 'Sand'] },
    Blizzard: { inferiors: ['Ice'], superiors: ['Snowball'] },
    Snowball: { inferiors: ['Blizzard'], superiors: ['Flow'] },
    Flow: { inferiors: ['Snowball'], superiors: ['Time'] },
    Time: { inferiors: ['Flow'], superiors: [] },
    Sand: { inferiors: ['Ice'], superiors: ['Flow'] },
    Fire: { inferiors: ['Basic'], superiors: ['Overheat', 'Ignite'] },
    Overheat: { inferiors: ['Fire'], superiors: ['Ignite', 'Solar'] },
    Ignite: { inferiors: ['Overheat'], superiors: ['Phoenix'] },
    Phoenix: { inferiors: ['Ignite'], superiors: ['Meteor'] },
    Solar: { inferiors: ['Overheat'], superiors: ['Meteor'] },
    Meteor: { inferiors: ['Phoenix', 'Solar'], superiors: [] },
    Electric: { inferiors: ['Basic'], superiors: ['ModElectric'] },
    ModElectric: { inferiors: ['Electric'], superiors: ['Prism'] },
    Prism: { inferiors: ['ModElectric', 'Star'], superiors: [] },
    Poison: { inferiors: ['Basic'], superiors: ['Infect'] },
    Infect: { inferiors: ['Poison'], superiors: [] },
    Switch: { inferiors: ['Basic'], superiors: ['Joker'] },
    Joker: { inferiors: ['Switch', 'Imitator'], superiors: ['Nutrition', 'Summon', 'Royal'] },
    Nutrition: { inferiors: ['Joker'], superiors: [] },
    Summon: { inferiors: ['Joker', 'Sprout'], superiors: [] },
    Royal: { inferiors: ['Joker'], superiors: [] },
    Growth: { inferiors: ['Basic', 'Seed'], superiors: ['RandomGrowth', 'BrokenGrowth'] },
    BrokenGrowth: { inferiors: ['Growth'], superiors: [] },
    RandomGrowth: { inferiors: ['Growth'], superiors: ['CloneKing'] },
    CloneKing: { inferiors: ['RandomGrowth'], superiors: [] },
    Absorb: { inferiors: ['Basic'], superiors: ['Sacrifice', 'Bounty'] },
    Sacrifice: { inferiors: ['Absorb'], superiors: ['Metastasis'] },
    Bounty: { inferiors: ['Absorb'], superiors: ['Metastasis'] },
    Metastasis: { inferiors: ['Sacrifice', 'Bounty', 'Parasite'], superiors: ['Vampire'] },
    Vampire: { inferiors: ['Metastasis'], superiors: [] },
    Thorn: { inferiors: ['Basic'], superiors: ['Mine', 'Shield'] },
    Mine: { inferiors: ['Thorn'], superiors: ['Nuclear'] },
    Shield: { inferiors: ['Thorn'], superiors: ['Compressor'] },
    Compressor: { inferiors: ['Shield'], superiors: [] },
    Nuclear: { inferiors: ['Mine', 'Firecracker'], superiors: [] },
    Melee: { inferiors: ['Basic'], superiors: ['Berserker', 'Guardian'] },
    Berserker: { inferiors: ['Melee'], superiors: ['Hell'] },
    Guardian: { inferiors: ['Melee'], superiors: [] },
    Hell: { inferiors: ['Berserker'], superiors: [] },
    Laser: { inferiors: ['Basic'], superiors: ['Wave', 'Gun'] },
    Wave: { inferiors: ['Laser'], superiors: ['Star'] },
    Gun: { inferiors: ['Laser'], superiors: ['Scope'] },
    Star: { inferiors: ['Wave'], superiors: ['Prism'] },
    Scope: { inferiors: ['Gun'], superiors: [] },
    Teleport: { inferiors: ['Basic'], superiors: ['Rewind', 'BlackHole'] },
    Rewind: { inferiors: ['Teleport'], superiors: [] },
    BlackHole: { inferiors: ['Teleport'], superiors: [] },
    Gamble: { inferiors: ['Basic'], superiors: ['Saikoro', 'Bubble'] },
    Saikoro: { inferiors: ['Gamble'], superiors: [] },
    Bubble: { inferiors: ['Gamble'], superiors: [] },
    Imitator: { inferiors: ['Basic'], superiors: ['Joker'] },
    MiniCombo: { inferiors: ['Basic'], superiors: ['Combo'] },
    Sprout: { inferiors: ['Basic'], superiors: ['Summon'] },
    YinYang: { inferiors: ['Line'], superiors: [] },
    Line: { inferiors: ['Basic'], superiors: ['YinYang'] },
    Combo: { inferiors: ['MiniCombo'], superiors: [] },
    Firecracker: { inferiors: ['Basic'], superiors: ['Nuclear'] },
    Orbit: { inferiors: ['Basic'], superiors: ['Atomic'] },
    Atomic: { inferiors: ['Orbit'], superiors: [] },
    Scythe: { inferiors: ['Basic'], superiors: ['Death'] },
    Death: { inferiors: ['Scythe'], superiors: [] },
    Snowy: { inferiors: ['Basic'], superiors: ['Ice', 'Blizzard'] },
    Seed: { inferiors: ['Basic'], superiors: ['Growth'] },
    RustSword: { inferiors: ['Basic'], superiors: ['LightSword'] },
    LightSword: { inferiors: ['RustSword'], superiors: [] },
    Parasite: { inferiors: ['Basic'], superiors: ['Metastasis'] },
    Breeze: { inferiors: ['Basic'], superiors: ['Wind', 'StrongWind'] },
    Crayon: { inferiors: ['Basic'], superiors: ['Rainbow'] },
    Rainbow: { inferiors: ['Crayon'], superiors: [] },
    Dagger: { inferiors: ['Basic'], superiors: ['Assassination'] },
    Assassination: { inferiors: ['Dagger'], superiors: [] },
    Whirlwind: { inferiors: ['Basic'], superiors: ['Tornado'] },
  };

  const defaultRelations = { inferiors: [] as DiceType[], superiors: [] as DiceType[] };
  const result = relations[type] || { ...defaultRelations };
  
  if (result.inferiors.length === 0) {
    const list: DiceType[] = [];
    Object.entries(relations).forEach(([k, val]) => {
      if (val.superiors.includes(type)) {
        list.push(k as DiceType);
      }
    });
    if (list.length > 0) {
      result.inferiors = list;
    } else if (type !== 'Basic') {
      result.inferiors = ['Basic'];
    }
  }
  
  if (result.superiors.length === 0) {
    const list: DiceType[] = [];
    Object.entries(relations).forEach(([k, val]) => {
      if (val.inferiors.includes(type)) {
        list.push(k as DiceType);
      }
    });
    if (list.length > 0) {
      result.superiors = list;
    }
  }

  return result;
};

export const getRandomDiceTypeByRarity = (): DiceType => {
  const randVal = Math.random() * 100;
  let targetRarity: 'Common' | 'Rare' | 'Unique' | 'Legendary' = 'Common';
  
  if (randVal < 7) {
    targetRarity = 'Legendary';
  } else if (randVal < 7 + 18) {
    targetRarity = 'Unique';
  } else if (randVal < 7 + 18 + 30) {
    targetRarity = 'Rare';
  } else {
    targetRarity = 'Common';
  }
  
  const candidates = ALL_DICE_TYPES.filter(type => {
    const info = DICE_DETAILS[type];
    return info && info.rarity === targetRarity;
  });
  
  if (candidates.length === 0) {
    return ALL_DICE_TYPES[Math.floor(Math.random() * ALL_DICE_TYPES.length)];
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export const formatDamageDealt = (dmg: number): string => {
  if (!dmg) return '0';
  if (dmg < 1000) return Math.round(dmg).toString();
  if (dmg < 1000000) return (dmg / 1000).toFixed(1) + 'K';
  return (dmg / 1000000).toFixed(1) + 'M';
};

export const getRandomDiceTypeByCustomRates = (rates: { Common: number; Rare: number; Unique: number; Legendary: number }): DiceType => {
  const randVal = Math.random() * 100;
  let targetRarity: 'Common' | 'Rare' | 'Unique' | 'Legendary' = 'Common';
  
  if (randVal < rates.Legendary) {
    targetRarity = 'Legendary';
  } else if (randVal < rates.Legendary + rates.Unique) {
    targetRarity = 'Unique';
  } else if (randVal < rates.Legendary + rates.Unique + rates.Rare) {
    targetRarity = 'Rare';
  } else {
    targetRarity = 'Common';
  }
  
  const candidates = ALL_DICE_TYPES.filter(type => {
    const info = DICE_DETAILS[type];
    return info && info.rarity === targetRarity;
  });
  
  if (candidates.length === 0) {
    return ALL_DICE_TYPES[Math.floor(Math.random() * ALL_DICE_TYPES.length)];
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export interface PremiumGachaConfig {
  id: string;
  name: string;
  cost: number;
  totalPieces: number;
  desc: string;
  badge: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  ratesText: string;
  poolText?: string;
  getRandomDice: () => DiceType;
}

export const PREMIUM_GACHA_LIST: PremiumGachaConfig[] = [
  {
    id: 'legendary_guaranteed',
    name: '🌟 伝説極星・超越招喚',
    cost: 5000,
    totalPieces: 150,
    desc: '伝説の輝き！伝説(Legendary)の排出率が【50%】まで超高確率アップした驚愕のガシャ。特例・特別も高確率で排出されます。',
    badge: '伝説50%',
    badgeBg: 'bg-amber-500/25 border border-amber-400 text-amber-300',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    textColor: 'text-amber-400',
    ratesText: '伝説(Legendary): 50% | 特別(Unique): 40% | 希少(Rare): 10% | 一般: 0%',
    getRandomDice: () => getRandomDiceTypeByCustomRates({ Common: 0, Rare: 10, Unique: 40, Legendary: 50 })
  },
  {
    id: 'attacker_selection',
    name: '⚔️ 殺戮烈火・強襲火力選抜',
    cost: 3500,
    totalPieces: 120,
    desc: '相手を粉砕する「火力型」ダイスのみを100%厳選排出！台風、星、不死鳥、サイコロなどの主役を集約。',
    badge: '火力特化',
    badgeBg: 'bg-rose-500/25 border border-rose-400 text-rose-300',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    textColor: 'text-rose-400',
    ratesText: '対象アタッカー19種から均等確率',
    poolText: '台風, コンボ, 太陽, 不死鳥, サイコロ, 星, 忍者, 強風, 狂風, 過熱, 銃, 波動, レーザー, 火, 雷, 改造電気, 近接, 狂戦士, 桜',
    getRandomDice: () => {
      const pool: DiceType[] = [
        'Fire', 'Electric', 'Wind', 'StrongWind', 'Hurricane', 'Typhoon', 'Combo', 'Overheat', 'Solar', 
        'Gun', 'Star', 'Phoenix', 'Saikoro', 'Ninja', 'Laser', 'Wave', 'Melee', 'Berserker', 'ModElectric', 'CherryBlossom'
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'support_selection',
    name: '✨ 絶対調和・盤面複製支援',
    cost: 3500,
    totalPieces: 120,
    desc: 'ジョーカーや成長、複製などの強力な「盤面構築・バフ・支援系」のダイスだけを100%限定排出します。',
    badge: '支援・複製',
    badgeBg: 'bg-emerald-500/25 border border-emerald-400 text-emerald-300',
    borderColor: 'border-emerald-500/50 hover:border-emerald-400',
    textColor: 'text-emerald-400',
    ratesText: '対象支援型14種から均等確率',
    poolText: 'ジョーカー, 成長, ランダム成長, 壊れた成長, 複製, 複製王, 栄養, 召喚, 範囲, 吸収, 生贄, 賞金, 位置入替, 光',
    getRandomDice: () => {
      const pool: DiceType[] = [
        'Joker', 'Growth', 'RandomGrowth', 'BrokenGrowth', 'Clone', 'CloneKing', 'Nutrition', 'Summon', 
        'Switch', 'Light', 'Scope', 'Absorb', 'Bounty', 'Sacrifice'
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'debuff_selection',
    name: '❄️ 深淵監獄・妨害地獄狂宴',
    cost: 3200,
    totalPieces: 110,
    desc: '吹雪、ブラックホール、盾などの「鈍足・遅延・即死・トラップ系」ダイスのかけらだけを均等に排出！',
    badge: '遅延・妨害',
    badgeBg: 'bg-cyan-500/25 border border-cyan-400 text-cyan-300',
    borderColor: 'border-cyan-500/50 hover:border-cyan-400',
    textColor: 'text-cyan-400',
    ratesText: '対象妨害型21種から均等確率',
    poolText: '吹雪, 盾, 砂, テレポート, ブラックホール, 死神, 地獄, 原子, 暗殺, 氷, 毒, 感染, トゲ, 地雷, 引き寄せ, ロイヤル, 核, 氷結気絶, バブル, リワインド',
    getRandomDice: () => {
      const pool: DiceType[] = [
        'Blizzard', 'Shield', 'Sand', 'Teleport', 'BlackHole', 'Death', 'Hell', 'Nuclear', 'Assassination', 
        'Lock', 'Ice', 'Poison', 'Infect', 'Thorn', 'Mine', 'Compressor', 'Rewind', 'Snowball', 'Bubble', 'Royal', 'Atomic'
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'mythic_celestial',
    name: '☄️ 天臨降魔・極限伝説五倍',
    cost: 6000,
    totalPieces: 200,
    desc: '「光の剣、星、月、太陽、ブラックホール、ソウル、サイコロ」の最高峰伝説の排出確率が通常のなんと【5倍】！',
    badge: '特選5倍',
    badgeBg: 'bg-indigo-500/25 border border-indigo-400 text-indigo-300',
    borderColor: 'border-indigo-500/50 hover:border-indigo-400',
    textColor: 'text-indigo-400',
    ratesText: '極選最高峰伝説(45%) | その他(55%)',
    poolText: '光の剣, 星, 月, 太陽, ブラックホール, ソウル, サイコロ (特選枠45%)',
    getRandomDice: () => {
      if (Math.random() < 0.45) {
        const specials: DiceType[] = ['LightSword', 'Star', 'Moon', 'Solar', 'BlackHole', 'Soul', 'Saikoro'];
        return specials[Math.floor(Math.random() * specials.length)];
      }
      return getRandomDiceTypeByRarity();
    }
  },
  {
    id: 'gamble_roll',
    name: '🎲 豪運賭博・サイコロ倍乗',
    cost: 2000,
    totalPieces: 100,
    desc: 'ベースは単発10回分(100個)。引き当てた瞬間にサイコロが回転！出た目の倍数(1〜6倍)に総かけら数が極大爆増！',
    badge: '最大6倍',
    badgeBg: 'bg-pink-500/25 border border-pink-400 text-pink-300',
    borderColor: 'border-pink-500/50 hover:border-pink-400',
    textColor: 'text-pink-450',
    ratesText: '一般: 45% | 希少: 30% | 特別: 18% | 伝説: 7% (サイコロで量1〜6倍)',
    getRandomDice: () => getRandomDiceTypeByRarity()
  },
  {
    id: 'oriental_blossom',
    name: '🌸 陰陽和合・桜花東洋秘術',
    cost: 4500,
    totalPieces: 150,
    desc: '「陰陽のダイス」や「桜のダイス」を含む、特定の東洋・東方テーマの美しく強力なダイスだけが100%排出されます！',
    badge: '東洋テーマ',
    badgeBg: 'bg-rose-450/20 border border-rose-400 text-rose-300',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    textColor: 'text-rose-400',
    ratesText: 'テーマ対象7種から均等確率',
    poolText: '陰陽, 桜, 虹, コンボ, 波動, 改造電気, 基本',
    getRandomDice: () => {
      const pool: DiceType[] = ['YinYang', 'CherryBlossom', 'Rainbow', 'Combo', 'Wave', 'ModElectric', 'Basic'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'infinity_volume',
    name: '📦 極光加速・メガウェーブパック',
    cost: 8000,
    totalPieces: 300,
    desc: '圧倒的大盛りパック！合計300個のかけらを一挙獲得。通常より高レアリティが出るようにブーストされています。',
    badge: '大容量300個',
    badgeBg: 'bg-indigo-500/25 border border-indigo-400 text-indigo-300',
    borderColor: 'border-indigo-500/50 hover:border-indigo-400',
    textColor: 'text-indigo-400',
    ratesText: '伝説(Legendary): 15% | 特別(Unique): 35% | 希少(Rare): 30% | 一般: 20%',
    getRandomDice: () => getRandomDiceTypeByCustomRates({ Common: 20, Rare: 30, Unique: 35, Legendary: 15 })
  },
  {
    id: 'ultimate_legendary',
    name: '👑 神話創世・全伝説全特別',
    cost: 18000,
    totalPieces: 220,
    desc: '最高峰のみ。排出される220個の全かけらが「伝説」または「特別」のダイスのみという、極限に豪華な超究極ガチャ。',
    badge: '最高峰100%',
    badgeBg: 'bg-gradient-to-r from-amber-400/20 via-pink-400/20 to-purple-400/20 border border-amber-400 text-amber-200',
    borderColor: 'border-yellow-500/50 hover:border-yellow-300',
    textColor: 'text-yellow-300 font-black',
    ratesText: '伝説(Legendary): 60% | 特別(Unique): 40% | 希少(Rare): 0% | 一般: 0%',
    getRandomDice: () => getRandomDiceTypeByCustomRates({ Common: 0, Rare: 0, Unique: 40, Legendary: 60 })
  },
];

export const CHEAP_GACHA_LIST: PremiumGachaConfig[] = [
  {
    id: 'cheap_common',
    name: '🥬 平民の恵み・一般常設ガチャ',
    cost: 15,
    totalPieces: 3,
    desc: '超絶エコノミー！一般(Common)のダイスのかけらだけを抽出し、お財布に極めて優しい入門ガチャ。',
    badge: '一般100%',
    badgeBg: 'bg-slate-500/20 border border-slate-400 text-slate-300',
    borderColor: 'border-slate-800 hover:border-slate-600',
    textColor: 'text-slate-300',
    ratesText: '一般 (Common): 100%',
    getRandomDice: () => {
      const commons = ALL_DICE_TYPES.filter(t => {
        const info = DICE_DETAILS[t];
        return info && info.rarity === 'Common';
      });
      return commons[Math.floor(Math.random() * commons.length)];
    }
  },
  {
    id: 'cheap_bronze',
    name: '🥉 鋼鉄の進撃・一般希少特化ガチャ',
    cost: 30,
    totalPieces: 5,
    desc: '手軽に戦力アップ！一般(Common)と希少(Rare)等級 of ダイスのみが排出されるリーズナブルなガシャ。',
    badge: '一般・希少',
    badgeBg: 'bg-orange-500/15 border border-orange-500/30 text-orange-400',
    borderColor: 'border-orange-950/40 hover:border-orange-850',
    textColor: 'text-orange-400',
    ratesText: '一般: 70% | 希少: 30%',
    getRandomDice: () => getRandomDiceTypeByCustomRates({ Common: 70, Rare: 30, Unique: 0, Legendary: 0 })
  },
  {
    id: 'cheap_starter',
    name: '⚔️ 初心者の書・基本戦闘パック',
    cost: 40,
    totalPieces: 6,
    desc: 'ド級の初心者用！基礎を支える初期ダイス群のかけらをピンポイントで一挙に補充できます。',
    badge: '初期編・限定',
    badgeBg: 'bg-blue-500/15 border border-blue-500/30 text-blue-400',
    borderColor: 'border-blue-950/40 hover:border-blue-850',
    textColor: 'text-blue-400',
    ratesText: '基本, 火, 氷, 風, 毒, ロック, 地雷, 光の8種均等',
    poolText: '基本, 火, 氷, 風, 毒, 鍵・ロック, 地雷, 光',
    getRandomDice: () => {
      const pool: DiceType[] = ['Basic', 'Fire', 'Ice', 'Wind', 'Poison', 'Lock', 'Mine', 'Light'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'cheap_clutter',
    name: '💎 原石発掘・破格お試しガチャ',
    cost: 50,
    totalPieces: 8,
    desc: '常設の半額コストで回せる掘り出し物ガチャ！若干一般が出やすいですが、豪運次第で伝説のダイス片も！？',
    badge: '一攫千金',
    badgeBg: 'bg-purple-500/15 border border-purple-500/30 text-purple-400',
    borderColor: 'border-purple-950/40 hover:border-purple-855',
    textColor: 'text-purple-450',
    ratesText: '一般: 60% | 希少: 25% | 特別: 13% | 伝説: 2%',
    getRandomDice: () => getRandomDiceTypeByCustomRates({ Common: 60, Rare: 25, Unique: 13, Legendary: 2 })
  },
  {
    id: 'cheap_wind_poison',
    name: '🍃 疾風猛毒・速度状態異常ガチャ',
    cost: 35,
    totalPieces: 5,
    desc: '攻撃速度アップや状態異常・持続ダメージダイスに特化！風や毒マニアにお勧めのお手頃ガチャ。',
    badge: '速度・異常',
    badgeBg: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
    borderColor: 'border-emerald-950/40 hover:border-emerald-855',
    textColor: 'text-emerald-450',
    ratesText: '風, 強風, 狂風, 毒, 感染, トゲの6種均等',
    poolText: '風, 強風, 狂風, 毒, 感染, トゲ',
    getRandomDice: () => {
      const pool: DiceType[] = ['Wind', 'StrongWind', 'Hurricane', 'Poison', 'Infect', 'Thorn'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'cheap_defensive',
    name: '🧱 防壁防衛・地縛制御ガチャ',
    cost: 35,
    totalPieces: 5,
    desc: '敵を足止め・遅延・吸引することに特化した防衛支援型。タワーディフェンスの要となるダイスを集約！',
    badge: '防衛・鈍足',
    badgeBg: 'bg-teal-500/15 border border-teal-500/30 text-teal-400',
    borderColor: 'border-teal-950/40 hover:border-teal-855',
    textColor: 'text-teal-450',
    ratesText: '氷, 盾, 砂, テレポート, 引き寄せの5種均等',
    poolText: '氷, 盾, 砂, テレポート, 引き寄せ(Compressor)',
    getRandomDice: () => {
      const pool: DiceType[] = ['Ice', 'Shield', 'Sand', 'Teleport', 'Compressor'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'cheap_yin_yang_starter',
    name: '☯️ 陰陽極意・初心者お試し調和',
    cost: 70,
    totalPieces: 10,
    desc: '基本、陰陽、光、位置入替(Switch)に特化した、盤面の調和・属性統一を重視したリーズナブルなガチャ。陰陽の最初のピース集めに最適！',
    badge: '陰陽・調和',
    badgeBg: 'bg-slate-700/20 border border-slate-500 text-slate-300',
    borderColor: 'border-slate-800 hover:border-slate-600',
    textColor: 'text-slate-300',
    ratesText: '基本, 陰陽, 光, 位置入替の4種均等排出',
    poolText: '基本(Basic), 陰陽(YinYang), 光(Light), 位置入替(Switch)',
    getRandomDice: () => {
      const pool: DiceType[] = ['Basic', 'YinYang', 'Light', 'Switch'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  },
  {
    id: 'cheap_box_of_chips',
    name: '📦 驚天動地・ジャンク端切れ寄せ集め',
    cost: 120,
    totalPieces: 30,
    desc: '信じられない大ボリューム！1回のガチャで一般(Common)のかけらがなんと30個も一挙に凝縮されたジャンクパック。とにかく数の暴力で攻めたい貴方に！',
    badge: '大容量30個',
    badgeBg: 'bg-stone-500/15 border border-stone-300 text-stone-300',
    borderColor: 'border-stone-800 hover:border-stone-600',
    textColor: 'text-stone-300',
    ratesText: '一般 (Common): 100% (ただし獲得量が圧倒的)',
    poolText: '一般(Common)クラスの全ダイス',
    getRandomDice: () => {
      const commons = ALL_DICE_TYPES.filter(t => {
        const info = DICE_DETAILS[t];
        return info && info.rarity === 'Common';
      });
      return commons[Math.floor(Math.random() * commons.length)];
    }
  },
  {
    id: 'cheap_electric_shock',
    name: '⚡ 迅雷疾風・放電バチバチパック',
    cost: 50,
    totalPieces: 8,
    desc: '雷、改造電気、およびおまけ範囲バフ(Scope)のかけらだけが100%バチバチ高熱排出！電気系統のダイスを高速昇格！',
    badge: '雷電特化',
    badgeBg: 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-300',
    borderColor: 'border-yellow-950/40 hover:border-yellow-855',
    textColor: 'text-yellow-400',
    ratesText: '雷, 改造電気, 範囲の3種から均等確率',
    poolText: '雷(Electric), 改造電気(ModElectric), 範囲(Scope)',
    getRandomDice: () => {
      const pool: DiceType[] = ['Electric', 'ModElectric', 'Scope'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
];

export const generateShopFeaturedDeals = (): { type: DiceType, count: number, cost: number, bought: boolean }[] => {
  const selected: DiceType[] = [];
  const pool = [...ALL_DICE_TYPES];
  while (selected.length < 3 && pool.length > 0) {
    const rndIdx = Math.floor(Math.random() * pool.length);
    const candidate = pool.splice(rndIdx, 1)[0];
    selected.push(candidate);
  }

  return selected.map((type) => {
    const info = DICE_DETAILS[type];
    const isLegendary = info?.rarity === 'Legendary';
    const isUnique = info?.rarity === 'Unique';
    const count = isLegendary ? 5 : isUnique ? 12 : 25;
    const cost = isLegendary ? 300 : isUnique ? 150 : 80;
    return { type, count, cost, bought: false };
  });
};

export default function App() {
  const [cells, setCells] = useState<Cell[]>(
    Array.from({ length: GRID_SIZE }, (_, i) => ({ id: i, dice: null }))
  );
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<{ id: string; targetId: string; fromCell: number; color?: string; label?: string }[]>([]);
  const [sp, setSp] = useState(250);
  const [deck, setDeck] = useState<DiceType[]>(['Basic', 'Fire', 'Ice', 'Wind', 'Growth']);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'deck' | 'guide' | 'gacha' | 'shop'>('board');
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1);

  // Shop Permanent Passive Upgrades (Levels 0 to 5)
  const [shopStartSpLvl, setShopStartSpLvl] = useState<number>(() => {
    const saved = localStorage.getItem('shop_start_sp_lvl');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [shopLivesLvl, setShopLivesLvl] = useState<number>(() => {
    const saved = localStorage.getItem('shop_lives_lvl');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [shopDmgPremiumLvl, setShopDmgPremiumLvl] = useState<number>(() => {
    const saved = localStorage.getItem('shop_dmg_lvl');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [shopGemBonusLvl, setShopGemBonusLvl] = useState<number>(() => {
    const saved = localStorage.getItem('shop_gem_lvl');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Daily Featured Shards / Pieces rotation state
  const [shopFeaturedDeals, setShopFeaturedDeals] = useState<{ type: DiceType, count: number, cost: number, bought: boolean }[]>(() => {
    const saved = localStorage.getItem('shop_featured_deals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return generateShopFeaturedDeals();
  });

  // Save Shop states to localStorage
  useEffect(() => {
    localStorage.setItem('shop_start_sp_lvl', shopStartSpLvl.toString());
  }, [shopStartSpLvl]);

  useEffect(() => {
    localStorage.setItem('shop_lives_lvl', shopLivesLvl.toString());
  }, [shopLivesLvl]);

  useEffect(() => {
    localStorage.setItem('shop_dmg_lvl', shopDmgPremiumLvl.toString());
  }, [shopDmgPremiumLvl]);

  useEffect(() => {
    localStorage.setItem('shop_gem_lvl', shopGemBonusLvl.toString());
  }, [shopGemBonusLvl]);

  useEffect(() => {
    localStorage.setItem('shop_featured_deals', JSON.stringify(shopFeaturedDeals));
  }, [shopFeaturedDeals]);
  const [waveSpawnCount, setWaveSpawnCount] = useState(0);
  const [showWaveClearBanner, setShowWaveClearBanner] = useState<number | null>(null);
  const [mergeEffects, setMergeEffects] = useState<Record<number, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const nextVal = !isFullscreen;
    setIsFullscreen(nextVal);

    const elem = document.getElementById('app-container');
    if (elem) {
      if (nextVal) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {
            console.log("Real fullscreen request failed/blocked. Using simulated fullscreen.");
          });
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
  };

  // New Gacha & Blossom state hooks
  const [gachaRolling, setGachaRolling] = useState(false);
  const [gachaPiecesResult, setGachaPiecesResult] = useState<{ type: DiceType; count: number }[] | null>(null);
  const [specialGachaFeedback, setSpecialGachaFeedback] = useState<string | null>(null);
  const [cherryParticlesActive, setCherryParticlesActive] = useState(false);
  const [diceDamageDealt, setDiceDamageDealt] = useState<Record<string, number>>({});

  // Stats
  const [lives, setLives] = useState(10);
  const [wave, setWave] = useState(1);
  const [waveProgress, setWaveProgress] = useState(0);
  const [defeatedCount, setDefeatedCount] = useState(0);

  // Shards (Currency to unlock other dice)
  const [shards, setShards] = useState<number>(() => {
    const saved = localStorage.getItem('dice_shards');
    return saved ? parseInt(saved, 10) : 100;
  });

  // Keep track of maximum wave reached historically for unlock check
  const [maxWaveReached, setMaxWaveReached] = useState<number>(() => {
    const saved = localStorage.getItem('dice_max_wave');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Cumulative kills for unlocks
  const [totalKills, setTotalKills] = useState<number>(() => {
    const saved = localStorage.getItem('dice_total_kills');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Unlocked dice list state
  const [unlockedTypes, setUnlockedTypes] = useState<DiceType[]>(() => {
    const saved = localStorage.getItem('dice_unlocked_types');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default starter pack unlocked
    return ['Basic', 'Fire', 'Electric', 'Wind', 'Poison', 'Ice', 'Iron', 'Broken', 'Gamble', 'Lock', 'Growth'];
  });

  // Unique dice fragments / shards collected per type
  const [dicePieces, setDicePieces] = useState<Record<DiceType, number>>(() => {
    const saved = localStorage.getItem('dice_pieces');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {} as Record<DiceType, number>;
  });

  // Permanent piece upgrade levels on each dice type
  const [dicePieceLevels, setDicePieceLevels] = useState<Record<DiceType, number>>(() => {
    const saved = localStorage.getItem('dice_piece_levels');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {} as Record<DiceType, number>;
  });

  useEffect(() => {
    localStorage.setItem('dice_pieces', JSON.stringify(dicePieces));
  }, [dicePieces]);

  useEffect(() => {
    localStorage.setItem('dice_piece_levels', JSON.stringify(dicePieceLevels));
  }, [dicePieceLevels]);

  const getPieceLevel = (type: DiceType) => {
    if (dicePieceLevels[type] !== undefined) {
      return dicePieceLevels[type];
    }
    return unlockedTypes.includes(type) ? 1 : 0;
  };

  const getUpgradeCost = (type: DiceType) => {
    const lvl = getPieceLevel(type);
    const rarity = DICE_DETAILS[type]?.rarity || 'Common';
    let base = 10;
    let step = 5;
    if (rarity === 'Common') { base = 5; step = 3; }
    else if (rarity === 'Rare') { base = 10; step = 5; }
    else if (rarity === 'Unique') { base = 20; step = 8; }
    else if (rarity === 'Legendary') { base = 40; step = 15; }
    return lvl === 0 ? base : lvl * step + base;
  };

  const upgradeDiceWithPieces = (type: DiceType) => {
    const currentLvl = getPieceLevel(type);
    const cost = getUpgradeCost(type);
    const hasPieces = dicePieces[type] || 0;
    if (hasPieces < cost) return;

    setDicePieces(prev => ({
      ...prev,
      [type]: (prev[type] || 0) - cost
    }));

    const nextLvl = currentLvl + 1;
    setDicePieceLevels(prev => ({
      ...prev,
      [type]: nextLvl
    }));

    if (currentLvl === 0 && !unlockedTypes.includes(type)) {
      setUnlockedTypes(prev => [...prev, type]);
    }
  };

  useEffect(() => {
    localStorage.setItem('dice_shards', shards.toString());
  }, [shards]);

  useEffect(() => {
    localStorage.setItem('dice_max_wave', maxWaveReached.toString());
  }, [maxWaveReached]);

  useEffect(() => {
    localStorage.setItem('dice_total_kills', totalKills.toString());
  }, [totalKills]);

  useEffect(() => {
    localStorage.setItem('dice_unlocked_types', JSON.stringify(unlockedTypes));
  }, [unlockedTypes]);

  // Trigger automatic unlock checking on mount / achievement growth
  useEffect(() => {
    let changed = false;
    const newUnlocked = [...unlockedTypes];
    
    ALL_DICE_TYPES.forEach(type => {
      if (!newUnlocked.includes(type)) {
        const cond = DICE_UNLOCK_CONDITIONS[type];
        if (cond) {
          const autoUnlocked = 
            (!cond.gachaOnly && cond.wave && maxWaveReached >= cond.wave) || 
            (!cond.gachaOnly && cond.kills && totalKills >= cond.kills) || 
            (cond.cost === 0);
          if (autoUnlocked) {
            newUnlocked.push(type);
            changed = true;
          }
        }
      }
    });
    
    if (changed) {
      setUnlockedTypes(newUnlocked);
    }
  }, [maxWaveReached, totalKills, unlockedTypes]);

  const rollPiecesGacha = (pullCount: number) => {
    const cost = pullCount === 1 ? 100 : pullCount === 10 ? 1000 : 10000;
    if (shards < cost || gachaRolling) return;

    const finalPullsCount = pullCount === 1 ? 1 : pullCount === 10 ? 11 : 120;
    const totalPiecesToGenerate = finalPullsCount * 10;

    setShards(s => s - cost);
    setGachaRolling(true);
    setGachaPiecesResult(null);

    setTimeout(() => {
      const newObtained: { type: DiceType; count: number }[] = [];
      const tempPieces = { ...dicePieces };

      for (let i = 0; i < totalPiecesToGenerate; i++) {
        const selected = getRandomDiceTypeByRarity();
        tempPieces[selected] = (tempPieces[selected] || 0) + 1;

        const existing = newObtained.find(item => item.type === selected);
        if (existing) {
          existing.count += 1;
        } else {
          newObtained.push({ type: selected, count: 1 });
        }
      }

      newObtained.sort((a, b) => b.count - a.count);

      setDicePieces(tempPieces);
      setGachaPiecesResult(newObtained);
      setGachaRolling(false);
    }, 1500);
  };

  const rollSpecialGacha = (configId: string, pullCount: 1 | 10 | 100) => {
    const cfg = PREMIUM_GACHA_LIST.find(c => c.id === configId) || CHEAP_GACHA_LIST.find(c => c.id === configId);
    if (!cfg || gachaRolling) return;

    const actualCost = cfg.cost * pullCount;
    if (shards < actualCost) return;

    setShards(s => s - actualCost);
    setGachaRolling(true);
    setGachaPiecesResult(null);
    setSpecialGachaFeedback(null);

    const pullMultiplier = pullCount === 1 ? 1 : pullCount === 10 ? 11 : 120;

    setTimeout(() => {
      const newObtained: { type: DiceType; count: number }[] = [];
      const tempPieces = { ...dicePieces };

      let gambleMultiplier = 1;
      let rollResultValue = 1;
      if (cfg.id === 'gamble_roll') {
        rollResultValue = Math.floor(Math.random() * 6) + 1;
        gambleMultiplier = rollResultValue;
      }

      const totalPiecesToGenerate = cfg.totalPieces * pullMultiplier * gambleMultiplier;

      for (let i = 0; i < totalPiecesToGenerate; i++) {
        const selected = cfg.getRandomDice();
        tempPieces[selected] = (tempPieces[selected] || 0) + 1;

        const existing = newObtained.find(item => item.type === selected);
        if (existing) {
          existing.count += 1;
        } else {
          newObtained.push({ type: selected, count: 1 });
        }
      }

      newObtained.sort((a, b) => b.count - a.count);

      setDicePieces(tempPieces);
      setGachaPiecesResult(newObtained);
      setGachaRolling(false);
      
      if (cfg.id === 'gamble_roll') {
        setSpecialGachaFeedback(`🎲 サイコロの目は [${rollResultValue}] でした！獲得かけらが ${rollResultValue}倍 (${totalPiecesToGenerate}個) に爆増しました！(内訳: 通常 ${cfg.totalPieces * pullMultiplier}個 × サイコロの目 ${rollResultValue}倍 / ${pullCount === 1 ? '単発' : pullCount === 10 ? '11連分' : '120連分'})`);
      } else {
        setSpecialGachaFeedback(`🎉 「${cfg.name}」(${pullCount === 1 ? '単発' : pullCount === 10 ? '10連/11連分' : '100連/120連分'})から合計 ${totalPiecesToGenerate}個 のかけらを抽出しました！`);
      }
    }, 1500);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetGameData = () => {
    localStorage.removeItem('dice_shards');
    localStorage.removeItem('dice_max_wave');
    localStorage.removeItem('dice_total_kills');
    localStorage.removeItem('dice_unlocked_types');
    localStorage.removeItem('dice_pieces');
    localStorage.removeItem('dice_piece_levels');
    
    setShards(100);
    setMaxWaveReached(1);
    setTotalKills(0);
    const starterPack: DiceType[] = ['Basic', 'Fire', 'Electric', 'Wind', 'Poison', 'Ice', 'Iron', 'Broken', 'Gamble', 'Lock', 'Growth'];
    setUnlockedTypes(starterPack);
    setDicePieces({} as Record<DiceType, number>);
    setDicePieceLevels({} as Record<DiceType, number>);
    setGachaPiecesResult(null);
    setDeck(['Basic', 'Fire', 'Ice', 'Wind', 'Growth']);
    
    // Reset active game states to initial baseline
    setLives(10 + shopLivesLvl);
    setWave(1);
    setWaveProgress(0);
    setDefeatedCount(0);
    setCells(Array.from({ length: GRID_SIZE }, (_, i) => ({ id: i, dice: null })));
    setEnemies([]);
    setProjectiles([]);
    setSp(250 + shopStartSpLvl * 100);
    setComboCount(0);
    setMiniComboCount(0);
    setSoulPoints(0);
    setPermanentChargeLevel(0);
    setChargeModeActive({});
    setOverheatDuration(0);
    setGuardianStacks({});
    setLaserTargets({});
    setSpecialActionState(null);
    setTraps([]);
    setGasClouds([]);
    setCooldowns({});
    setGrowthTimer({});
    setDiceLevels(Object.fromEntries(ALL_DICE_TYPES.map(t => [t, 1])) as Record<DiceType, number>);

    setShowResetConfirm(false);
  };

  // Global modifiers / states for complex dice
  const [comboCount, setComboCount] = useState(0);
  const [miniComboCount, setMiniComboCount] = useState(0);
  const [soulPoints, setSoulPoints] = useState(0);
  const [permanentChargeLevel, setPermanentChargeLevel] = useState(0);
  const [chargeModeActive, setChargeModeActive] = useState<Record<number, boolean>>({}); // charge state toggle for cells
  const [saikoroRolls, setSaikoroRolls] = useState<Record<number, number>>({}); // recent roll values for Saikoro dice
  const [overheatDuration, setOverheatDuration] = useState(0); // in ticks
  const [guardianStacks, setGuardianStacks] = useState<Record<number, number>>({}); // cell to stack map
  const [laserTargets, setLaserTargets] = useState<Record<number, { enemyId: string; ticks: number }>>({}); // lasers focus counting

  // Board Special Action Triggering state (e.g. Switch, Joker, Nutrition)
  const [specialActionState, setSpecialActionState] = useState<{
    type: 'Switch' | 'Joker' | 'Nutrition';
    fromCellId: number;
  } | null>(null);

  // Road Traps
  const [traps, setTraps] = useState<{ id: string; type: 'Thorn' | 'Mine' | 'Shield'; position: number; healthOrCharges: number }[]>([]);
  const [gasClouds, setGasClouds] = useState<{ id: string; position: number; duration: number }[]>([]);

  // Individual cells weapon fire cooldowns list (ticks remaining)
  const [cooldowns, setCooldowns] = useState<Record<number, number>>({});
  const [growthTimer, setGrowthTimer] = useState<Record<number, number>>({}); // Ticks left to evolve

  // Level Up upgrades mapping
  const [diceLevels, setDiceLevels] = useState<Record<DiceType, number>>(
    Object.fromEntries(ALL_DICE_TYPES.map(t => [t, 1])) as Record<DiceType, number>
  );

  const getAdjacentCellIndices = (index: number): number[] => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push((row - 1) * 5 + col);
    if (row < 2) neighbors.push((row + 1) * 5 + col);
    if (col > 0) neighbors.push(row * 5 + col - 1);
    if (col < 4) neighbors.push(row * 5 + col + 1);
    return neighbors;
  };

  // Wave manager / Spawner ticking
  useEffect(() => {
    const timer = setInterval(() => {
      // Game Over state bypass or Battle Inactive bypass
      if (lives <= 0 || !isBattleActive) return;

      // 1. Process Overheat timer decay
      if (overheatDuration > 0) {
        setOverheatDuration(prev => prev - 1);
      }

      // Cherry Blossom special global damage (CherryBlossom: 3s tick = 15 ticks of 200ms)
      const cherryPips = cells.reduce((acc, cell) => {
        if (cell.dice?.type === 'CherryBlossom') acc += cell.dice.pips;
        return acc;
      }, 0);
      if (cherryPips > 0 && waveProgress % 15 === 0) {
        setCherryParticlesActive(true);
        setTimeout(() => setCherryParticlesActive(false), Math.round(1200 / gameSpeed));
        const blossomDmg = Math.round(cherryPips * 10 * (diceLevels['CherryBlossom'] || 1) * (1 + wave * 0.1));
        
        setEnemies(currEnemies => {
          let totalDealt = 0;
          const updated = currEnemies.map(e => {
            const actual = Math.min(e.hp, blossomDmg);
            totalDealt += actual;
            return { ...e, hp: e.hp - blossomDmg };
          });
          if (totalDealt > 0) {
            const cbCells = cells.filter(c => c.dice?.type === 'CherryBlossom');
            if (cbCells.length > 0) {
              setDiceDamageDealt(prev => {
                const next = { ...prev };
                cbCells.forEach(c => {
                  if (c.dice) {
                    const share = (c.dice.pips / cherryPips) * totalDealt;
                    next[c.dice.id] = (next[c.dice.id] || 0) + Math.round(share);
                  }
                });
                return next;
              });
            }
          }
          return updated;
        });
      }

      // 2. Spawn and increment wave progress
      const nextProgress = waveProgress + 1;
      setWaveProgress(nextProgress);

      const maxSpawnsCount = 8 + wave * 2;

      // Spawn normal and bosses occasionally
      if (nextProgress % 5 === 0) {
        setWaveSpawnCount(c => {
          if (c >= maxSpawnsCount) return c;
          const nextCount = c + 1;
          const isBoss = (nextCount === maxSpawnsCount) && wave > 1;
          // Make the first few waves (1, 2, 3) significantly easier by lowering the base HP baseline dynamically,
          // while preserving the core scaling factor (multiplier) for later stage alignment.
          const earlyGameDiscount = wave === 1 ? 0.5 : wave === 2 ? 0.7 : wave === 3 ? 0.85 : 1.0;
          const multiplier = Math.pow(1.22, wave - 1);
          const hpVal = Math.max(1, Math.round((isBoss ? 150 : 15) * earlyGameDiscount * multiplier));
          setEnemies(prev => [
            ...prev,
            {
              id: generateId(),
              hp: hpVal,
              maxHp: hpVal,
              position: 0,
              speed: isBoss ? 0.6 : 1.0,
              slowed: false,
              poisoned: 0,
            }
          ]);
          return nextCount;
        });
      }

      // 3. Poison DOT ticks and Gas cloud ticks
      setEnemies(prev =>
        prev.map(e => {
          let updatedHp = e.hp;
          if (e.poisoned > 0) {
            updatedHp -= Math.round(5 * (1 + wave * 0.1));
          }
          // Gas cloud steps check
          const passedClouds = gasClouds.filter(cloud => Math.abs(cloud.position - e.position) < 6);
          if (passedClouds.length > 0) {
            updatedHp -= Math.round(7 * passedClouds.length * (1 + wave * 0.05));
          }
          return { ...e, hp: updatedHp, poisoned: Math.max(0, e.poisoned - 1) };
        })
      );

      // Gas decay
      setGasClouds(prev => prev.map(g => ({ ...g, duration: g.duration - 1 })).filter(g => g.duration > 0));

      // Trap/Shield interaction & Enemy moves
      let currentSlowFromFlow = 1.0;
      // Calculate active flow dice
      const flowCellPips = cells.reduce((acc, cell) => {
        if (cell.dice?.type === 'Flow') acc += cell.dice.pips;
        return acc;
      }, 0);
      if (flowCellPips > 0) {
        // Slow down enemy speed dynamically
        currentSlowFromFlow = Math.max(0.5, 1.0 - (flowCellPips * 0.025));
      }

      setEnemies(prev => {
        return prev.map(enemy => {
          let movementThisTick = (enemy.slowed ? 0.8 : 1.6) * currentSlowFromFlow;
          
          // Sand slow factor
          const hasBigSlow = false; // logic resolved in hit

          // Shield block check
          const activeShields = traps.filter(t => t.type === 'Shield' && Math.abs(t.position - enemy.position) < 4);
          if (activeShields.length > 0) {
            // Stops motion, damages shield
            movementThisTick = 0;
            // Subtract health
            setTraps(currTraps => currTraps.map(ct => {
              if (ct.type === 'Shield' && ct.id === activeShields[0].id) {
                return { ...ct, healthOrCharges: ct.healthOrCharges - 1 };
              }
              return ct;
            }).filter(ct => ct.healthOrCharges > 0));
          }

          // Spikes/Thorn interaction
          const activeThorns = traps.filter(t => t.type === 'Thorn' && Math.abs(t.position - enemy.position) < 5);
          if (activeThorns.length > 0) {
            const actThorn = activeThorns[0] as any;
            const actualDmg = Math.min(enemy.hp, 4);
            enemy.hp -= 4; // Spike base hit
            if (actualDmg > 0 && actThorn.sourceDiceId) {
              setDiceDamageDealt(prev => ({
                ...prev,
                [actThorn.sourceDiceId]: (prev[actThorn.sourceDiceId] || 0) + actualDmg
              }));
            }
            setTraps(currTraps => currTraps.map(ct => {
              if (ct.type === 'Thorn' && ct.id === actThorn.id) {
                return { ...ct, healthOrCharges: ct.healthOrCharges - 1 };
              }
              return ct;
            }).filter(ct => ct.healthOrCharges > 0));
          }

          // Landmine interaction
          const activeMines = traps.filter(t => t.type === 'Mine' && Math.abs(t.position - enemy.position) < 4);
          if (activeMines.length > 0) {
            const actMine = activeMines[0] as any;
            const actualDmg = Math.min(enemy.hp, 150);
            // Explosive AOE detonator
            enemy.hp -= 150;
            if (actualDmg > 0 && actMine.sourceDiceId) {
              setDiceDamageDealt(prev => ({
                ...prev,
                [actMine.sourceDiceId]: (prev[actMine.sourceDiceId] || 0) + actualDmg
              }));
            }
            // Trigger explosion visual effect on neighbours
            setTraps(currTraps2 => currTraps2.filter(ct => ct.id !== actMine.id));
          }

          return { ...enemy, position: enemy.position + movementThisTick };
        }).filter(enemy => {
          if (enemy.position >= 100) {
            // Leaked to defense line!
            setLives(l => Math.max(0, l - 1));
            return false;
          }
          if (enemy.hp <= 0) {
            // Dead
            setDefeatedCount(d => d + 1);
            setTotalKills(tk => tk + 1);
            const killShardAmount = Math.random() < (shopGemBonusLvl * 0.15) ? 2 : 1;
            setShards(sh => sh + killShardAmount);
            if (enemy.isGoldAlien) {
              setSp(s => s + 300); // Metastasis bonus drop!
            } else {
              setSp(s => s + 6); // Base kill bonus (Increased by +1 SP from 5 to 6)
            }
            setSoulPoints(prev => prev + 1); // for Soul dice
            return false;
          }
          return true;
        });
      });

      // 4. Periodically place traps / make Clones
      // Clone check (every 12 seconds)
      if (waveProgress % 20 === 0) {
        cells.forEach((cell, idx) => {
          if (cell.dice?.type === 'Clone') {
            const emptyCells = cells.filter(c => c.dice === null);
            if (emptyCells.length > 0) {
              const spawnTarget = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              const cloneDice: Dice = {
                id: generateId(),
                type: 'Clone',
                pips: 1
              };
              setCells(curr => curr.map(c => c.id === spawnTarget.id ? { ...c, dice: cloneDice } : c));
            }
          }
          if (cell.dice?.type === 'CloneKing') {
            const emptyCells = cells.filter(c => c.dice === null);
            if (emptyCells.length > 0) {
              const spawnTarget = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              const cloneDice: Dice = {
                id: generateId(),
                type: 'CloneKing',
                pips: cell.dice.pips
              };
              setCells(curr => curr.map(c => c.id === spawnTarget.id ? { ...c, dice: cloneDice } : c));
            }
          }
        });
      }

      // CloneKing auto-fusion logic
      const cloneKings = cells.filter(c => c.dice?.type === 'CloneKing');
      if (cloneKings.length >= 4) {
        const sorted = [...cloneKings].sort((a,b) => a.dice!.pips - b.dice!.pips);
        const first = sorted[0];
        const second = sorted[1];
        if (first && second) {
          const newPipVal = Math.max(first.dice!.pips, second.dice!.pips) + 1;
          const nextRandomType = deck[Math.floor(Math.random() * deck.length)];
          setCells(curr => curr.map(c => {
            if (c.id === second.id) {
              return { ...c, dice: { id: generateId(), type: nextRandomType, pips: newPipVal } };
            }
            if (c.id === first.id) {
              return { ...c, dice: null };
            }
            return c;
          }));
          setMergeEffects(prev => ({ ...prev, [second.id]: true }));
        }
      }

      // Check automatically growth evo updates (Decrements evolve ticks)
      setCells(currCells => {
        return currCells.map(cell => {
          if (cell.dice && (cell.dice.type === 'Growth' || cell.dice.type === 'RandomGrowth' || cell.dice.type === 'BrokenGrowth' || cell.dice.type === 'Seed')) {
            const currentTicksLeft = growthTimer[cell.id] ?? (cell.dice.type === 'Seed' ? 75 : 30); // seeds take 75 ticks = 15s
            if (currentTicksLeft <= 1) {
              // Evolve trigger!
              let newPips = cell.dice.pips;
              let nextType = deck[Math.floor(Math.random() * deck.length)];
              
              if (cell.dice.type === 'Growth') {
                newPips = newPips + 1;
              } else if (cell.dice.type === 'Seed') {
                if (newPips < 3) {
                  newPips = newPips + 1;
                } else {
                  newPips = 3;
                }
              } else if (cell.dice.type === 'RandomGrowth') {
                newPips = Math.floor(Math.random() * (cell.dice.pips + 3)) + 1; // scale random factor with current rank
              } else if (cell.dice.type === 'BrokenGrowth') {
                if (Math.random() < 0.6) {
                  newPips = newPips + 1;
                } else {
                  newPips = Math.max(1, newPips - 1); // Evolt fallback downgrade risk
                }
              }

              // Update cell
              return {
                ...cell,
                dice: {
                  id: generateId(),
                  type: nextType,
                  pips: newPips
                }
              };
            } else {
              // decrease evolve countdown
              growthTimer[cell.id] = currentTicksLeft - 1;
            }
          }
          return cell;
        });
      });

      // 5. Automatic Dice Weapon firing updates
      cells.forEach(cell => {
        if (!cell.dice) return;

        // Check buffer Light / Moon proximity bonuses
        const adjacentCells = getAdjacentCellIndices(cell.id);
        const adjacentLight = adjacentCells.some(idx => cells[idx]?.dice?.type === 'Light');
        const adjacentMoon = adjacentCells.some(idx => cells[idx]?.dice?.type === 'Moon');
        const adjacentScope = adjacentCells.some(idx => cells[idx]?.dice?.type === 'Scope');
        const adjacentHell = adjacentCells.some(idx => cells[idx]?.dice?.type === 'Hell');
        const adjacentCherry = adjacentCells.some(idx => cells[idx]?.dice?.type === 'CherryBlossom');

        // Check specific passive buffs / forms
        const isHurricaneMode = cell.dice.type === 'Hurricane' && (waveProgress % 10 < 4);
        const isStrongWindMode = cell.dice.type === 'StrongWind' && (waveProgress % 7 < 3);
        const isTyphoonCritMode = cell.dice.type === 'Typhoon' && (waveProgress % 8 < 3);
        const isBreezeMode = cell.dice.type === 'Breeze' && (waveProgress % 5 < 1.5);
        const isLightSpeedActive = cell.dice.type === 'LightSpeed' && Math.random() < 0.25;

        // Base fire rate calculations (ticks required to pass before firing again)
        let cdTicksRequired = 6; // Standard delay
        if (cell.dice.type === 'Wind') cdTicksRequired = 3;
        else if (isHurricaneMode) cdTicksRequired = 1;
        else if (isStrongWindMode) cdTicksRequired = 2;
        else if (isTyphoonCritMode) cdTicksRequired = 1.5;
        else if (isLightSpeedActive) cdTicksRequired = 1;
        else if (isBreezeMode) cdTicksRequired = 4;

        if (adjacentMoon) cdTicksRequired *= 0.45; // Moon accelerates fire interval by 55%
        else if (adjacentLight) cdTicksRequired *= 0.70; // Light accelerates fire interval by 30%

        if (cell.dice.type === 'YinYang') {
          // Check alignment
          const rowIdx = Math.floor(cell.id / 5);
          const colIdx = cell.id % 5;
          const isRowYY = [0,1,2,3,4].every(cOffset => cells[rowIdx * 5 + cOffset]?.dice?.type === 'YinYang');
          const isColYY = [0,1,2].every(rOffset => cells[rOffset * 5 + colIdx]?.dice?.type === 'YinYang');
          if (isRowYY || isColYY) {
            cdTicksRequired *= 0.3; // Hyper speed Harmony!
          }
        }

        if (cell.dice.type === 'Line') {
          const rowIdx = Math.floor(cell.id / 5);
          const colIdx = cell.id % 5;
          // Column YY equivalent: all 3 spaces in col of 3x5 grid are Line dice
          const isColLine = [0, 1, 2].every(rOffset => cells[rOffset * 5 + colIdx]?.dice?.type === 'Line');
          // Row partial YY equivalent: at least 3 of 5 spaces are Line dice
          const rowLines = [0, 1, 2, 3, 4].filter(cOffset => cells[rowIdx * 5 + cOffset]?.dice?.type === 'Line');
          const isRowLine = rowLines.length >= 3;
          
          if (isColLine || isRowLine) {
            cdTicksRequired *= 0.66; // 1.5x attack rate boost (reduced cooldown delay)
          }
        }

        const currentCd = cooldowns[cell.id] || 0;
        if (currentCd > 0) {
          setCooldowns(prev => ({ ...prev, [cell.id]: currentCd - 1 }));
          return;
        }

        // Reset cooldown
        setCooldowns(prev => ({ ...prev, [cell.id]: Math.max(1, Math.round(cdTicksRequired)) }));

        // Fire target selection sorting
        let targets = [...enemies].filter(e => e.hp > 0);
        if (targets.length === 0) return;

        let mainTarget = targets.sort((a, b) => b.position - a.position)[0]; // default: front-most

        if (cell.dice.type === 'Iron') {
          // boss/highest HP priority strategy
          mainTarget = targets.sort((a, b) => b.hp - a.hp)[0];
        } else if (cell.dice.type === 'Broken') {
          // completely randomized targeting
          mainTarget = targets[Math.floor(Math.random() * targets.length)];
        }

        if (!mainTarget) return;

        // Custom Charge Mode skip: If charge mode is activated, doesn't attack, instead absorbs SP!
        if (cell.dice.type === 'Charge' && chargeModeActive[cell.id]) {
          if (sp >= 3) {
            setSp(s => s - 3);
            setPermanentChargeLevel(prev => prev + 1);
          }
          return; // Skip attack
        }

        let currentSaikoroRollValue = 1;
        if (cell.dice.type === 'Saikoro') {
          currentSaikoroRollValue = Math.floor(Math.random() * 6) + 1;
          setSaikoroRolls(prev => ({ ...prev, [cell.id]: currentSaikoroRollValue }));
        }

        // Projectile visual draw
        const newProjId = generateId();
        let bulletColor = 'bg-yellow-400';
        let bulletLabel = '';
        if (cell.dice.type === 'Fire') bulletColor = 'bg-red-500';
        if (cell.dice.type === 'Ice' || cell.dice.type === 'Blizzard') bulletColor = 'bg-cyan-300';
        if (cell.dice.type === 'Poison' || cell.dice.type === 'Infect') bulletColor = 'bg-emerald-400';
        if (cell.dice.type === 'Ninja') bulletColor = 'bg-zinc-400 border border-zinc-200 shadow-md animate-spin';
        if (cell.dice.type === 'Rainbow') bulletColor = 'bg-gradient-to-r from-red-400 via-green-400 to-blue-400 shadow-[0_0_6px_rgba(236,72,153,0.8)]';
        if (cell.dice.type === 'CherryBlossom') bulletColor = 'bg-pink-400 border border-pink-200 shadow-md';
        if (cell.dice.type === 'Tornado') bulletColor = 'bg-teal-400 border border-teal-200 animate-bounce';
        if (cell.dice.type === 'Prism') bulletColor = 'bg-gradient-to-r from-teal-200 via-pink-200 to-yellow-200 shadow-[0_0_8px_rgba(255,255,255,1)]';
        if (cell.dice.type === 'Vampire') bulletColor = 'bg-red-800 border border-red-500 rounded';
        if (cell.dice.type === 'Time') bulletColor = 'bg-indigo-300 border border-indigo-100 shadow-[0_0_6px_rgba(129,140,248,0.8)]';
        if (cell.dice.type === 'Meteor') bulletColor = 'bg-gradient-to-b from-orange-400 to-red-600 shadow-[0_0_10px_rgba(249,115,22,0.9)] rounded-full h-4 w-4';
        if (cell.dice.type === 'Snowy') bulletColor = 'bg-sky-200 border border-sky-100 shadow-[0_0_4px_rgba(186,230,253,0.5)] h-2.5 w-2.5 rounded-full';
        if (cell.dice.type === 'Scythe') bulletColor = 'bg-stone-600 border border-stone-800 shadow-[0_0_4px_rgba(75,85,99,0.5)] h-2 w-3 animate-spin rounded-sm';
        if (cell.dice.type === 'Dagger') bulletColor = 'bg-zinc-650 shadow-sm border border-zinc-500 rounded-sm h-1.5 w-3.5';
        if (cell.dice.type === 'RustSword') bulletColor = 'bg-amber-800/80 border border-amber-600 shadow-[0_0_5px_rgba(146,64,14,0.5)] h-3 w-1.5 rounded-sm';
        if (cell.dice.type === 'Orbit') bulletColor = 'bg-emerald-400/85 shadow-md rounded-full border border-emerald-300 h-2 w-2';
        if (cell.dice.type === 'Whirlwind') bulletColor = 'bg-teal-300 border border-teal-100 animate-pulse h-2 w-2.5 rounded';
        if (cell.dice.type === 'Crayon') {
          const crayonColors = ['bg-red-400', 'bg-cyan-300', 'bg-emerald-400'];
          bulletColor = crayonColors[Math.floor(Math.random() * crayonColors.length)] + ' border border-slate-200 rounded-sm h-2 w-2';
        }
        if (cell.dice.type === 'Saikoro') {
          bulletColor = 'bg-yellow-500 border border-amber-300 font-mono text-slate-950 font-black shadow-[0_0_8px_rgba(234,179,8,0.8)] text-center flex items-center justify-center text-md rounded-md leading-none h-6 w-6';
          bulletLabel = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][currentSaikoroRollValue - 1];
        }

        setProjectiles(prev => [...prev, { id: newProjId, targetId: mainTarget.id, fromCell: cell.id, color: bulletColor, label: bulletLabel }]);
        setTimeout(() => {
          setProjectiles(prev => prev.filter(p => p.id !== newProjId));
        }, Math.round(300 / gameSpeed));

        // Trap installations processes
        if (cell.dice.type === 'Thorn' && Math.random() < 0.3) {
          setTraps(prev => [
            ...prev,
            { id: generateId(), type: 'Thorn', position: Math.round(20 + Math.random() * 60), healthOrCharges: cell.dice!.pips * 4, sourceDiceId: cell.dice!.id }
          ]);
        }
        if (cell.dice.type === 'Mine' && Math.random() < 0.25) {
          setTraps(prev => [
            ...prev,
            { id: generateId(), type: 'Mine', position: Math.round(15 + Math.random() * 65), healthOrCharges: 1, sourceDiceId: cell.dice!.id }
          ]);
        }
        if (cell.dice.type === 'Shield' && Math.random() < 0.15) {
          setTraps(prev => [
            ...prev,
            { id: generateId(), type: 'Shield', position: Math.round(enemyAveragePosition(targets)), healthOrCharges: cell.dice!.pips * 5, sourceDiceId: cell.dice!.id }
          ]);
        }

        // Calculate dynamic Damage Output
        let dmgFactor = 1.0;
        if (cell.dice.type === 'Saikoro') {
          dmgFactor *= (currentSaikoroRollValue * 1.5);
        }
        if (overheatDuration > 0 && cell.dice.type === 'Overheat') {
          dmgFactor *= 3.5; // active screen wide Overheat
        }
        if (cell.dice.type === 'Berserker') {
          const hasBreachedHalf = enemies.some(e => e.position > 50);
          if (hasBreachedHalf) dmgFactor *= 4.0;
        }

        // Adjacent Buff Multipliers
        if (adjacentMoon) dmgFactor *= 1.8; // double critical
        if (adjacentCherry) dmgFactor *= 1.5; // Cherry Blossom increases ally damage by 50%!

        const permanentPieceLvl = Math.max(1, getPieceLevel(cell.dice.type));
        const permanentPieceMultiplier = 1.0 + (permanentPieceLvl - 1) * 0.15;
        const shopDmgBonusMultiplier = 1.0 + shopDmgPremiumLvl * 0.10;

        let cellDmg = Math.round(
          (cell.dice.pips * 12) * (diceLevels[cell.dice.type] || 1) * dmgFactor * permanentPieceMultiplier * shopDmgBonusMultiplier
        );

        // Add stacking/combo indices values
        if (cell.dice.type === 'Combo') {
          cellDmg += comboCount * 15;
        }
        if (cell.dice.type === 'MiniCombo') {
          cellDmg += miniComboCount * 2;
        }
        if (cell.dice.type === 'Soul') {
          cellDmg += Math.floor(soulPoints * 1.5);
        }
        if (cell.dice.type === 'Charge') {
          cellDmg += Math.floor(permanentChargeLevel * 1.2);
        }

        // Special dynamic calculations
        if (cell.dice.type === 'Gamble') {
          // fluctuated rate
          cellDmg = Math.round(cellDmg * (0.3 + Math.random() * 2.5));
        }
        if (cell.dice.type === 'Melee') {
          // scales based on target proximity
          cellDmg = Math.round(cellDmg * (1.0 + (mainTarget.position / 40)));
        }
        if (cell.dice.type === 'Wave') {
          // scales based on density concentration
          const packCount = enemies.filter(e => Math.abs(e.position - mainTarget.position) < 15).length;
          cellDmg = Math.round(cellDmg * (1.0 + packCount * 0.4));
        }
        if (cell.dice.type === 'Laser') {
          const lastRecord = laserTargets[cell.id];
          if (lastRecord && lastRecord.enemyId === mainTarget.id) {
            const nextTicks = Math.min(10, lastRecord.ticks + 1);
            laserTargets[cell.id] = { enemyId: mainTarget.id, ticks: nextTicks };
            cellDmg = Math.round(cellDmg * (1.0 + nextTicks * 0.4));
          } else {
            laserTargets[cell.id] = { enemyId: mainTarget.id, ticks: 1 };
          }
        }

        const isPhoenixActive = cell.dice.type === 'Phoenix' && (waveProgress % 8 < 4);
        if (cell.dice.type === 'Phoenix' && isPhoenixActive) {
          cellDmg = Math.round(cellDmg * 3.0);
        }

        if (cell.dice.type === 'Vampire') {
          const hpRatio = mainTarget.hp / mainTarget.maxHp;
          if (hpRatio > 0.6) {
            cellDmg = Math.round(cellDmg * 1.5);
          }
        }
        if (cell.dice.type === 'Meteor') {
          const packCount = enemies.filter(e => Math.abs(e.position - mainTarget.position) < 15).length;
          cellDmg = Math.round(cellDmg * (1.0 + packCount * 0.5));
        }
        if (cell.dice.type === 'Tornado') {
          cellDmg = Math.round(cellDmg * 1.4);
        }

        // Apply Hits / Debuffs immediately
        let totalDamageDealtThisShot = 0;
        setEnemies(prev => {
          return prev.map(enemy => {
            if (enemy.id !== mainTarget.id) {
              // Splash or multi-hit checks
              let targetSplashDmg = 0;
              if (cell.dice?.type === 'Fire') {
                const distToMain = Math.abs(enemy.position - mainTarget.position);
                if (distToMain < 12) targetSplashDmg = Math.round(cellDmg * 0.5);
              }
              else if (cell.dice?.type === 'Electric') {
                const secondaryHit = targets.slice(1, 3).some(s => s.id === enemy.id);
                if (secondaryHit) targetSplashDmg = Math.round(cellDmg * 0.4);
              }
              else if (cell.dice?.type === 'ModElectric') {
                const limitCount = cell.dice.pips;
                const matchesChain = targets.slice(1, limitCount + 1).some(s => s.id === enemy.id);
                if (matchesChain) targetSplashDmg = Math.round(cellDmg * 0.6);
              }
              else if (cell.dice?.type === 'Ninja') {
                const behindTargets = targets.filter(t => t.id !== mainTarget.id && t.position < mainTarget.position).sort((a, b) => b.position - a.position);
                if (behindTargets.length > 0 && behindTargets[0].id === enemy.id) targetSplashDmg = Math.round(cellDmg * 0.8);
              }
              else if (cell.dice?.type === 'Star') {
                const distToMain = Math.abs(enemy.position - mainTarget.position);
                if (distToMain < 15) targetSplashDmg = Math.round(cellDmg * 1.5);
              }
              else if (cell.dice?.type === 'Phoenix' && isPhoenixActive) {
                const distToMain = Math.abs(enemy.position - mainTarget.position);
                if (distToMain < 12) {
                  const pDmg = Math.round(cellDmg * 0.8);
                  const actual = Math.min(enemy.hp, pDmg);
                  totalDamageDealtThisShot += actual;
                  return { ...enemy, hp: enemy.hp - pDmg, poisoned: Math.max(enemy.poisoned, 8) };
                }
              }
              else if (cell.dice?.type === 'BlackHole') {
                const distToMain = Math.abs(enemy.position - mainTarget.position);
                if (distToMain < 15) {
                  const pullTarget = mainTarget.position;
                  const newPos = enemy.position + (pullTarget - enemy.position) * 0.35;
                  return { ...enemy, position: newPos, slowed: true };
                }
              }
              else if (cell.dice?.type === 'Prism') {
                const secondaryHit = targets.slice(1, 5).some(s => s.id === enemy.id);
                if (secondaryHit) targetSplashDmg = Math.round(cellDmg * 0.7);
              }
              else if (cell.dice?.type === 'Meteor') {
                const distToMain = Math.abs(enemy.position - mainTarget.position);
                if (distToMain < 12) targetSplashDmg = Math.round(cellDmg * 0.75);
              }
              else if (cell.dice?.type === 'Tornado' && Math.random() < 0.25) {
                const distToMain = Math.abs(enemy.position - mainTarget.position);
                if (distToMain < 15) {
                  const newPos = Math.max(0, enemy.position - 4.5);
                  return { ...enemy, position: newPos, slowed: true };
                }
              }
              else if (cell.dice?.type === 'Crayon') {
                // Crayons have a 10% chance to flash a splash red mark
                if (Math.random() < 0.1) {
                  const distToMain = Math.abs(enemy.position - mainTarget.position);
                  if (distToMain < 10) targetSplashDmg = Math.round(cellDmg * 0.35);
                }
              }

              if (targetSplashDmg > 0) {
                const actual = Math.min(enemy.hp, targetSplashDmg);
                totalDamageDealtThisShot += actual;
                return { ...enemy, hp: enemy.hp - targetSplashDmg };
              }

              return enemy;
            }

            // Directly attacking target parameters updates
            let baseDamageToTarget = cellDmg;
            let tempHp = enemy.hp - baseDamageToTarget;
            let currentPosition = enemy.position;

            // LightSword instant percent damage
            if (cell.dice?.type === 'LightSword' && Math.random() < 0.12) {
              tempHp = Math.round(tempHp * 0.5); // cut remaining health
            }

            // RustSword instant lower level percent damage (LightSword's junior)
            if (cell.dice?.type === 'RustSword' && Math.random() < 0.08) {
              tempHp = Math.round(tempHp * 0.85); // cut remaining health by 15%
            }

            // Atomic rotation continuous percent hits
            if (cell.dice?.type === 'Atomic') {
              tempHp = Math.min(tempHp, Math.round(enemy.hp - (enemy.maxHp * 0.05)));
            }

            // Orbit lower level percent hits (Atomic's junior)
            if (cell.dice?.type === 'Orbit') {
              tempHp = Math.min(tempHp, Math.round(enemy.hp - (enemy.maxHp * 0.01)));
            }

            // Rainbow epic damage multiplier
            if (cell.dice?.type === 'Rainbow') {
              tempHp = enemy.hp - Math.round(cellDmg * 1.3);
            }

            if (cell.dice?.type === 'Star') {
              tempHp = enemy.hp - Math.round(cellDmg * 2.5);
            }

            // Death instant execution
            if (cell.dice?.type === 'Death' && Math.random() < 0.05) {
              tempHp = 0; // slaying
            }

            // Scythe instant lower execution (Death's junior)
            if (cell.dice?.type === 'Scythe' && Math.random() < 0.015) {
              tempHp = 0; // slaying general mob
            }

            // Whirlwind blow back slightly (Tornado's junior)
            if (cell.dice?.type === 'Whirlwind' && Math.random() < 0.04) {
              currentPosition = Math.max(0, currentPosition - 1.0);
            }

            const finalDamageToTarget = Math.max(0, enemy.hp - tempHp);
            totalDamageDealtThisShot += finalDamageToTarget;

            let applySlow = enemy.slowed;
            let currentPoisonVal = enemy.poisoned;

            if (cell.dice?.type === 'Ice') applySlow = true;
            if (cell.dice?.type === 'Sand') applySlow = true;
            if (cell.dice?.type === 'BlackHole') applySlow = true;
            if (cell.dice?.type === 'Poison') currentPoisonVal = 5;
            if (cell.dice?.type === 'Phoenix') {
              currentPoisonVal = isPhoenixActive ? 10 : 4;
            }
            if (cell.dice?.type === 'Rainbow') {
              applySlow = true;
              currentPoisonVal = 5;
            }
            if (cell.dice?.type === 'Snowy' && Math.random() < 0.2) {
              applySlow = true;
            }
            if (cell.dice?.type === 'Crayon') {
              const r = Math.random();
              if (r < 0.2) applySlow = true;
              else if (r < 0.4) currentPoisonVal = Math.max(currentPoisonVal, 3);
            }

            // Lock / Bind status
            if (cell.dice?.type === 'Lock' && Math.random() < 0.35) {
              applySlow = true; 
            }

            // Absorb SP Gain
            if (cell.dice?.type === 'Absorb') {
              setSp(s => s + Math.max(1, cell.dice!.pips));
            }

            if (cell.dice?.type === 'Vampire') {
              setSp(s => s + Math.max(3, cell.dice!.pips * 4));
            }

            if (cell.dice?.type === 'Parasite') {
              setSp(s => s + Math.max(1, cell.dice!.pips * 2));
            }

            if (cell.dice?.type === 'Time') {
              applySlow = true;
            }

            // Bounty mark configuration
            if (cell.dice?.type === 'Bounty') {
              setSp(s => s + 15);
            }

            // Teleport fallback trigger
            if (cell.dice?.type === 'Teleport' && Math.random() < 0.15) {
              return { ...enemy, position: 0, hp: Math.max(0, tempHp) }; 
            }

            // Snowball stun simulation slowing
            if (cell.dice?.type === 'Snowball') {
              applySlow = true;
            }

            // Infect setup
            if (cell.dice?.type === 'Infect' && tempHp <= 0) {
              setGasClouds(g => [...g, { id: generateId(), position: enemy.position, duration: 15 }]);
            }

            return { ...enemy, position: currentPosition, hp: Math.max(0, tempHp), slowed: applySlow, poisoned: currentPoisonVal };
          });
        });

        // Scope ricochet bullets triggering
        if (adjacentScope && targets.length > 1) {
          const secondTrg = targets[1];
          setEnemies(prev => prev.map(e => {
            if (e.id === secondTrg.id) {
              const scopeDmg = Math.round(cellDmg * 0.5);
              const actual = Math.min(e.hp, scopeDmg);
              totalDamageDealtThisShot += actual;
              return { ...e, hp: e.hp - scopeDmg };
            }
            return e;
          }));
        }

        // Hell instant executor distribute
        if (adjacentHell && Math.random() < 0.04) {
          setEnemies(prev => prev.map(e => {
            if (e.id === mainTarget.id) {
              const actual = e.hp;
              totalDamageDealtThisShot += actual;
              return { ...e, hp: 0 };
            }
            return e;
          }));
        }

        // Now record the damage dealt for this specific dice!
        if (totalDamageDealtThisShot > 0 && cell.dice?.id) {
          const diceId = cell.dice.id;
          setDiceDamageDealt(prev => ({
            ...prev,
            [diceId]: (prev[diceId] || 0) + totalDamageDealtThisShot
          }));
        }
      });
    }, Math.round(200 / gameSpeed));

    return () => clearInterval(timer);
  }, [cells, enemies, traps, waveProgress, diceLevels, overheatDuration, permanentChargeLevel, chargeModeActive, comboCount, miniComboCount, soulPoints, isBattleActive, wave, gameSpeed]);

  const [lockWarning, setLockWarning] = useState<string | null>(null);

  useEffect(() => {
    if (lockWarning) {
      const lockTimer = setTimeout(() => {
        setLockWarning(null);
      }, 3000);
      return () => clearTimeout(lockTimer);
    }
  }, [lockWarning]);

  // Wave clear checker effect
  useEffect(() => {
    if (!isBattleActive || lives <= 0) return;

    const maxSpawnsCount = 8 + wave * 2;
    if (waveSpawnCount >= maxSpawnsCount && enemies.length === 0) {
      // Continuous wave progression: do not set isBattleActive to false!
      setWaveSpawnCount(0);
      setWaveProgress(0);
      setShowWaveClearBanner(wave);

      setProjectiles([]);

      setWave(w => {
        const nw = w + 1;
        setMaxWaveReached(maxW => Math.max(maxW, nw));
        const clearGemsBonus = Math.round(50 * (1.0 + shopGemBonusLvl * 0.15));
        setShards(s => s + clearGemsBonus);
        return nw;
      });

      const bannerTimer = setTimeout(() => {
        setShowWaveClearBanner(null);
      }, 4500);

      return () => clearTimeout(bannerTimer);
    }
  }, [isBattleActive, waveSpawnCount, enemies, wave, lives]);

  const enemyAveragePosition = (t: Enemy[]) => {
    if (t.length === 0) return 30;
    return Math.round(t.reduce((acc, curr) => acc + curr.position, 0) / t.length);
  };

  // Summon flat costs SP logic
  const summonDice = () => {
    if (sp < 10) return;
    const emptyCells = cells.filter(cell => cell.dice === null);
    if (emptyCells.length === 0) return;

    const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const chosenType = deck[Math.floor(Math.random() * deck.length)];
    const newDice: Dice = {
      id: generateId(),
      type: chosenType,
      pips: 1,
    };

    setCells(cells.map(c => c.id === targetCell.id ? { ...c, dice: newDice } : c));
    setSp(sp - 10);

    // Initial triggers for self timing
    if (chosenType === 'Growth' || chosenType === 'RandomGrowth' || chosenType === 'BrokenGrowth') {
      const waitTime = chosenType === 'RandomGrowth' ? 75 : chosenType === 'BrokenGrowth' ? 45 : 35; // ticks counts
      setGrowthTimer(prev => ({ ...prev, [targetCell.id]: waitTime }));
    }
  };

  // Upgrade in-game dice directly via investment
  const upgradeDiceType = (type: DiceType) => {
    const level = diceLevels[type] || 1;
    const cost = level * 100;
    if (sp >= cost) {
      setSp(s => s - cost);
      setDiceLevels(prev => ({ ...prev, [type]: level + 1 }));
    }
  };

  // Manage in-game dynamic interactions (Merge, Joker, Switch, etc.)
  const handleCellClick = (cellId: number) => {
    const clickedCell = cells.find(c => c.id === cellId)!;

    // 1. Handling ACTIVE special actions (Switch, Joker, Nutrition)
    if (specialActionState) {
      const fromCell = cells.find(c => c.id === specialActionState.fromCellId)!;
      
      if (specialActionState.type === 'Switch') {
        // Swap positions directly
        const tempDice = clickedCell.dice;
        setCells(cells.map(c => {
          if (c.id === cellId) return { ...c, dice: fromCell.dice };
          if (c.id === fromCell.id) return { ...c, dice: tempDice };
          return c;
        }));
        setSelectedCellId(null);
        setSpecialActionState(null);
        return;
      }

      if (specialActionState.type === 'Joker') {
        // Transform Joker dice into target species
        if (clickedCell.dice && fromCell.dice && clickedCell.id !== fromCell.id && clickedCell.dice.pips === fromCell.dice.pips) {
          setCells(cells.map(c => {
            if (c.id === fromCell.id) {
              return { ...c, dice: { ...fromCell.dice!, type: clickedCell.dice!.type } };
            }
            return c;
          }));
        }
        setSelectedCellId(null);
        setSpecialActionState(null);
        return;
      }

      if ((specialActionState.type as any) === 'Imitator') {
        // 70% chance of successful copy, 30% chance of failure (downgrades to Basic-1)
        if (clickedCell.dice && fromCell.dice && clickedCell.id !== fromCell.id && clickedCell.dice.pips === fromCell.dice.pips) {
          const success = Math.random() < 0.70;
          setCells(cells.map(c => {
            if (c.id === fromCell.id) {
              if (success) {
                return { ...c, dice: { ...fromCell.dice!, type: clickedCell.dice!.type } };
              } else {
                return { ...c, dice: { id: generateId(), type: 'Basic', pips: 1 } };
              }
            }
            return c;
          }));
          if (success) {
            setLockWarning('✨ イミテート成功！');
          } else {
            setLockWarning('💥 失敗し、基本のダイス（星1）へ退化しました。');
          }
          setTimeout(() => setLockWarning(''), 2500);
        }
        setSelectedCellId(null);
        setSpecialActionState(null);
        return;
      }

      if (specialActionState.type === 'Nutrition') {
        // Upgrade target's pips by 1, consume nutrition dice
        if (clickedCell.dice && clickingAllowedMerge(fromCell, clickedCell)) {
          setCells(cells.map(c => {
            if (c.id === cellId) return { ...c, dice: { ...clickedCell.dice!, pips: clickedCell.dice!.pips + 1 } };
            if (c.id === fromCell.id) return { ...c, dice: null };
            return c;
          }));

          const targetId = cellId;
          setMergeEffects(prev => ({ ...prev, [targetId]: true }));
          setTimeout(() => {
            setMergeEffects(prev => {
              const updated = { ...prev };
              delete updated[targetId];
              return updated;
            });
          }, 600);
        }
        setSelectedCellId(null);
        setSpecialActionState(null);
        return;
      }
    }

    // 2. Normal cell selection or standard Merging
    if (selectedCellId === null) {
      if (clickedCell.dice) {
        setSelectedCellId(cellId);
      }
    } else {
      if (selectedCellId === cellId) {
        setSelectedCellId(null);
        return;
      }
      
      const selectedCell = cells.find(c => c.id === selectedCellId)!;
      
      if (clickedCell.dice && selectedCell.dice && 
          clickedCell.dice.type === selectedCell.dice.type && 
          clickedCell.dice.pips === selectedCell.dice.pips) {
        
        // Success merge!
        const nextType = deck[Math.floor(Math.random() * deck.length)];
        const newDice: Dice = {
          id: generateId(),
          type: nextType,
          pips: selectedCell.dice.pips + 1
        };

        const targetId = cellId;
        setMergeEffects(prev => ({ ...prev, [targetId]: true }));
        setTimeout(() => {
          setMergeEffects(prev => {
            const updated = { ...prev };
            delete updated[targetId];
            return updated;
          });
        }, 600);

        // Trigger special on-merge instant abilities
        if (clickedCell.dice.type === 'Sacrifice') {
          setSp(s => s + Math.round(clickedCell.dice!.pips * 120));
        }
        if (clickedCell.dice.type === 'MiniCombo') {
          setMiniComboCount(p => Math.min(10, p + 1));
        }
        if (clickedCell.dice.type === 'Sprout') {
          if (Math.random() < 0.5) {
            const emptyCells = cells.filter(c => c.id !== cellId && c.id !== selectedCellId && c.dice === null);
            if (emptyCells.length > 0) {
              const sumCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              setTimeout(() => {
                setCells(curr => curr.map(c => c.id === sumCell.id ? {
                  ...c,
                  dice: { id: generateId(), type: deck[Math.floor(Math.random() * deck.length)], pips: 1 }
                } : c));
              }, 100);
            }
          }
        }
        if (clickedCell.dice.type === 'Firecracker') {
          setEnemies(prev => prev.map(e => ({ ...e, hp: Math.round(e.hp * 0.85) })));
          setSp(prev => prev + 10);
        }
        if (clickedCell.dice.type === 'Summon') {
          // automatic double free spawns
          const emptyCells = cells.filter(c => c.id !== cellId && c.id !== selectedCellId && c.dice === null);
          if (emptyCells.length > 0) {
            const sumCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            setTimeout(() => {
              setCells(curr => curr.map(c => c.id === sumCell.id ? {
                ...c,
                dice: { id: generateId(), type: deck[Math.floor(Math.random() * deck.length)], pips: 1 }
              } : c));
            }, 100);
          }
        }
        if (clickedCell.dice.type === 'Rewind') {
          // Push furthest back
          setEnemies(prev => prev.map(e => ({ ...e, position: Math.max(0, e.position - 45) })));
        }
        if (clickedCell.dice.type === 'Combo') {
          setComboCount(prev => prev + 1);
        }
        if (clickedCell.dice.type === 'Assassination') {
          // Shoot atomic bombardment rocket deal 800 dmg to chief
          setEnemies(prev => prev.map((e, idx) => idx === 0 ? { ...e, hp: e.hp - 950 } : e));
        }
        if (clickedCell.dice.type === 'Nuclear') {
          // Devastating instant blast
          setEnemies(prev => prev.map(e => ({ ...e, hp: Math.round(e.hp * 0.45) })));
          setSp(prev => prev + 50);
        }
        if (clickedCell.dice.type === 'Royal') {
          // Shuffle other board low-tier dice
          setCells(curr => curr.map(c => {
            if (c.dice && c.dice.pips === 1) {
              return { ...c, dice: { ...c.dice, type: deck[Math.floor(Math.random() * deck.length)] } };
            }
            return c;
          }));
        }
        if (clickedCell.dice.type === 'Metastasis') {
          setSp(s => s + 100);
          const hpVal = Math.max(20, Math.round(50 * Math.pow(1.18, wave)));
          setEnemies(prev => [
            ...prev,
            {
              id: generateId(),
              hp: hpVal,
              maxHp: hpVal,
              position: 5,
              speed: 1.6,
              slowed: false,
              poisoned: 0,
              isGoldAlien: true,
            }
          ]);
        }

        setCells(cells.map(c => {
          if (c.id === cellId) return { ...c, dice: newDice };
          if (c.id === selectedCellId) return { ...c, dice: null };
          return c;
        }));

        setSelectedCellId(null);
      } else {
        // Different species, click sets primary selection index onwards
        if (clickedCell.dice) {
          setSelectedCellId(cellId);
        } else {
          setSelectedCellId(null);
        }
      }
    }
  };

  const clickingAllowedMerge = (from: Cell, target: Cell) => {
    return from.dice && target.dice && from.id !== target.id && from.dice.pips === target.dice.pips;
  };

  const toggleDeckSelection = (type: DiceType) => {
    if (!unlockedTypes.includes(type)) return; // Check unlock criteria
    if (deck.includes(type)) {
      if (deck.length > 1) {
        setDeck(deck.filter(t => t !== type));
      }
    } else {
      if (deck.length < 5) {
        setDeck([...deck, type]);
      }
    }
  };

  const handleOverheatActivation = () => {
    if (sp >= 50) {
      setSp(s => s - 50);
      setOverheatDuration(prev => prev + 25); // activate for ~5 seconds
    }
  };

  return (
    <div id="app-container" className={`min-h-screen bg-slate-950 text-slate-100 p-4 selection:bg-indigo-500/30 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto w-full h-full p-2 sm:p-6 bg-slate-950' : ''}`}>
      <div className={`mx-auto transition-all duration-300 ${isFullscreen ? 'max-w-5xl bg-slate-950 p-4 sm:p-6 rounded-2xl shadow-2xl relative z-10 border border-slate-800' : 'max-w-4xl'}`}>
        
        {/* Animated Lock Warning Toast */}
        <AnimatePresence>
          {lockWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
              className="fixed top-6 left-1/2 z-50 bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.4)] flex items-center gap-2 border-2 border-yellow-300 pointer-events-none text-sm transition-all whitespace-nowrap"
            >
              <span>{lockWarning}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header section with Japanese Title */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 text-xs font-bold rounded bg-indigo-500/20 text-indigo-400">PVE MULTI-TACTICS</span>
              <span className="px-2 py-1 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400">日本語ローカライズ済</span>
            </div>
            <h1 className="text-3xl font-bold font-sans tracking-tight bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent mt-1">
              ランダム・ダイス・タクティカル (Random Dice)
            </h1>
            <p className="text-slate-500 font-mono text-sm mt-0.5">全64種ダイス・デッキ構築タワーディフェンス</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 font-bold rounded-lg text-sm transition-all ${
                activeTab === 'board' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              戦闘盤 (Fight Grid)
            </button>
            <button
              onClick={() => {
                if (isBattleActive) {
                  setLockWarning("⚠️ 戦闘が終わるまでデッキ編集は行えません！");
                  return;
                }
                setActiveTab('deck');
              }}
              className={`px-4 py-2 font-bold rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                isBattleActive
                  ? 'bg-slate-900/40 border border-slate-900/50 text-slate-600 cursor-not-allowed opacity-50'
                  : activeTab === 'deck'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isBattleActive && <span className="text-xs">🔒</span>}
              デッキ編成 ({deck.length}/5)
            </button>
            <button
              onClick={() => {
                if (isBattleActive) {
                  setLockWarning("⚠️ 戦闘が終わるまでダイスガチャは引けません！");
                  return;
                }
                setActiveTab('gacha' as any);
              }}
              className={`px-4 py-2 font-bold rounded-lg text-sm transition-all relative flex items-center gap-1.5 ${
                isBattleActive
                  ? 'bg-slate-900/40 border border-slate-900/50 text-slate-600 cursor-not-allowed opacity-50'
                  : activeTab === ('gacha' as any)
                    ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md shadow-pink-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-pink-500/30 hover:text-slate-200'
              }`}
            >
              {isBattleActive && <span className="text-xs">🔒</span>}
              🌌 ダイスガチャ (Gacha)
              {!isBattleActive && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 font-bold rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                activeTab === 'shop'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 shadow-lg'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-amber-500/30 hover:text-slate-200'
              }`}
            >
              🛒 ショップ (Shop)
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 font-bold rounded-lg text-sm transition-all ${
                activeTab === 'guide' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              図鑑・ガイド
            </button>
            <button
              onClick={toggleFullscreen}
              className={`px-4 py-2 font-bold rounded-lg text-sm transition-all flex items-center gap-1.5 shadow ${
                isFullscreen 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-905 font-extrabold shadow-amber-500/10' 
                  : 'bg-slate-900 border border-slate-805 hover:bg-slate-800 text-amber-400 hover:border-amber-500/30'
              }`}
              title="全画面表示モードを切り替えます"
            >
              {isFullscreen ? '🗗 通常画面に戻す' : '🖥️ 全画面表示'}
            </button>
          </div>
        </header>

        {/* Global Action Banner & Stat counters */}
        {lives <= 0 ? (
          <div className="bg-red-950/80 border-2 border-red-500/30 p-8 rounded-2xl text-center mb-6">
            <h2 className="text-4xl font-extrabold text-red-400 mb-2">ゲームオーバー (Game Over)</h2>
            <p className="text-slate-300 mb-6 font-medium">防衛ラインを突破されてしまいました。再度挑戦しましょう！</p>
            <button
              onClick={() => {
                setCells(Array.from({ length: GRID_SIZE }, (_, i) => ({ id: i, dice: null })));
                setEnemies([]);
                setLives(10 + shopLivesLvl);
                setWave(1);
                setWaveProgress(0);
                setDefeatedCount(0);
                setSp(250 + shopStartSpLvl * 100);
                setComboCount(0);
                setSoulPoints(0);
                setPermanentChargeLevel(0);
                setTraps([]);
                setGasClouds([]);
                setIsBattleActive(false);
                setWaveSpawnCount(0);
                setShowWaveClearBanner(null);
              }}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              再起動・リスタート (Restart)
            </button>
          </div>
        ) : null}

        {/* Real-time stats header strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 items-stretch">
          <div className="text-center bg-slate-950/40 p-2 rounded border border-slate-800/40 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-mono text-slate-500 block leading-none">ライフ / LIVES</span>
            <span className="text-base font-extrabold text-red-500 mt-1.5 block">❤️ {lives}</span>
          </div>
          <div className="text-center bg-slate-950/40 p-2 rounded border border-slate-800/40 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-mono text-slate-500 block leading-none">ウェーブ / WAVE</span>
            <span className="text-base font-extrabold text-indigo-400 mt-1.5 block">🌊 {wave}</span>
          </div>
          <div className="text-center bg-slate-950/40 p-2 rounded border border-slate-800/40 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-mono text-slate-500 block leading-none">倒した敵 / KILLS</span>
            <span className="text-base font-extrabold text-emerald-400 mt-1.5 block">👾 {defeatedCount}</span>
          </div>
          <div className="text-center bg-yellow-500/10 p-2 rounded border-2 border-yellow-400/60 flex flex-col justify-center shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse">
            <span className="text-[10px] uppercase font-black font-mono text-amber-400 block leading-none">💰 所持 SP / GOLD 💰</span>
            <span className="text-xl font-black text-yellow-300 mt-1 block tracking-wider">💰 {sp}</span>
          </div>
          <div className="text-center bg-slate-950/60 p-2 rounded border-2 border-amber-500/30 text-amber-300 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-mono text-amber-500 block leading-none">ダイスの欠片 / SHARDS</span>
            <span className="text-base font-extrabold text-amber-400 mt-1 block">💎 {shards}</span>
          </div>
        </div>

        {/* Dynamic Wave Clear Banner overlay */}
        <AnimatePresence>
          {showWaveClearBanner !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -15 }}
              className="bg-gradient-to-r from-emerald-600 to-indigo-600 border-2 border-emerald-400/30 p-6 rounded-2xl text-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative overflow-hidden"
            >
              {/* Decorative background visual ambient particles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="text-xs text-emerald-300 font-extrabold tracking-widest uppercase mb-1 drop-shadow font-mono">🌟 WAVE CLEARED / ウェーブ突破！ 🌟</div>
              <h2 className="text-3xl font-black text-white tracking-tight">WAVE {showWaveClearBanner} 突破成功！</h2>
              <p className="text-indigo-100 text-sm mt-2 font-medium">
                ボーナス報酬として <strong className="text-yellow-300 font-extrabold text-base drop-shadow">💎 ダイスの欠片 +50</strong> を安全に格納しました！
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE MODAL ACTIONS BAR (Only renders when special mode is selected) */}
        {selectedCellId !== null && cells.find(c => c.id === selectedCellId)?.dice && (
          <div className="bg-amber-500/10 border-2 border-amber-500/20 p-3 rounded-xl mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-sm font-bold">
                👉 [選定中]: {DICE_DETAILS[cells.find(c => c.id === selectedCellId)!.dice!.type]?.nameJa || 'ダイス'}
              </span>
              <span className="text-[11px] text-slate-400">
                (マージする場合は、同じ目の別の同名ダイスをクリック)
              </span>
            </div>
            <div className="flex gap-2">
              {cells.find(c => c.id === selectedCellId)?.dice?.type === 'Switch' && (
                <button
                  onClick={() => setSpecialActionState({ type: 'Switch', fromCellId: selectedCellId })}
                  className="px-3 py-1 text-xs font-bold bg-lime-600 text-white rounded hover:bg-lime-500"
                >
                  位置スワップ
                </button>
              )}
              {cells.find(c => c.id === selectedCellId)?.dice?.type === 'Joker' && (
                <button
                  onClick={() => setSpecialActionState({ type: 'Joker', fromCellId: selectedCellId })}
                  className="px-3 py-1 text-xs font-bold bg-violet-600 text-white rounded hover:bg-violet-500"
                >
                  ジョーカーコピー
                </button>
              )}
              {cells.find(c => c.id === selectedCellId)?.dice?.type === 'Imitator' && (
                <button
                  onClick={() => setSpecialActionState({ type: 'Imitator' as any, fromCellId: selectedCellId })}
                  className="px-3 py-1 text-xs font-bold bg-violet-850 border border-violet-700 text-white rounded hover:bg-violet-700"
                >
                  イミテート複写 (70%)
                </button>
              )}
              {cells.find(c => c.id === selectedCellId)?.dice?.type === 'Nutrition' && (
                <button
                  onClick={() => setSpecialActionState({ type: 'Nutrition', fromCellId: selectedCellId })}
                  className="px-3 py-1 text-xs font-bold bg-orange-600 text-white rounded hover:bg-orange-500"
                >
                  栄養マージ (星UP)
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedCellId(null);
                  setSpecialActionState(null);
                }}
                className="px-3 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {specialActionState && (
          <div className="bg-indigo-950/60 border border-indigo-400/40 p-2.5 rounded-lg mb-4 text-center text-xs animate-pulse text-indigo-200">
            🚨 <strong>{specialActionState.type === 'Switch' ? '位置入れ替え' : specialActionState.type === 'Joker' ? 'ジョーカー擬態' : (specialActionState.type as any) === 'Imitator' ? 'イミテート複写 (30%で退化リスクあり)' : '栄養吸収'} 対象選択中:</strong> 盤面上の適用させたい他のマスをクリックしてください。
          </div>
        )}

        {/* 1. FIGHT GRID (Primary Gaming arena) */}
        {activeTab === 'board' && (
          <div>
            {/* Phase header control panels */}
            {!isBattleActive ? (
              <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-indigo-950/60 border border-indigo-500/30 p-4 rounded-xl mb-4 text-center animate-fade-in shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="text-indigo-400 text-[10px] font-black font-mono tracking-widest mb-1 uppercase">PREPARATION PHASE • 準備フェーズ</div>
                <p className="text-xs text-slate-400 mb-3 max-w-lg mx-auto leading-relaxed">
                  デッキ編成やダイスガチャで陣形を整えたら、ボタンを押して戦闘を開始してください！
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setIsBattleActive(true);
                      setWaveSpawnCount(0);
                      setWaveProgress(0);
                      setEnemies([]);
                      setShowWaveClearBanner(null);
                    }}
                    className="px-12 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-450 text-white font-extrabold text-sm rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95"
                  >
                    ⚔️ 戦闘を開始する (START WAVE {wave})
                  </button>

                  <div className="flex items-center gap-1.5 bg-slate-950/75 p-1.5 rounded-xl border border-slate-800/40">
                    <span className="text-[10px] font-black font-mono text-slate-400 px-2 tracking-wider">戦闘速度:</span>
                    {[1, 1.5, 2, 3].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setGameSpeed(speed)}
                        className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                          gameSpeed === speed
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                        title={`${speed}x 倍速`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl mb-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="flex h-3.5 w-3.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                  </span>
                  <div className="text-left">
                    <span className="text-[9px] font-black font-mono text-slate-500 uppercase block leading-none tracking-wider">COMBAT ACTIVE / 交戦状態</span>
                    <strong className="text-sm font-extrabold text-red-400 mt-1 block">👿 ウェーブの敵と交戦中! ({waveSpawnCount}/{8 + wave * 2})</strong>
                  </div>
                </div>
                
                {/* Mini progress bar showing wave spawn counts */}
                <div className="w-full sm:w-48 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/60 relative">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-amber-500 h-full transition-all duration-300"
                    style={{ width: `${Math.round((waveSpawnCount / (8 + wave * 2)) * 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/60">
                    <span className="text-[9px] font-bold font-mono text-rose-400 px-1.5 uppercase">⚡ 速度:</span>
                    {[1, 1.5, 2, 3].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setGameSpeed(speed)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                          gameSpeed === speed
                            ? 'bg-rose-500 text-white shadow shadow-rose-500/20'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800/60 whitespace-nowrap">
                    侵入中の敵数: <strong className="text-red-400 font-bold">{enemies.length}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic special global effects indicator */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {overheatDuration > 0 && (
                <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-500 text-white animate-bounce">
                  🔥 オーバーヒート爆発中 ({overheatDuration}s)
                </span>
              )}
              {comboCount > 0 && (
                <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-mono">
                  ✨ コンボバフ: +{comboCount}
                </span>
              )}
              {miniComboCount > 0 && (
                <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-400/80 border border-indigo-500/30 font-mono">
                  🌱 プチコンボ: {miniComboCount}/10
                </span>
              )}
              {soulPoints > 0 && (
                <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/50 font-mono">
                  👻 収集魂: {soulPoints} (Soul DMG UP)
                </span>
              )}
              {permanentChargeLevel > 0 && (
                <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 font-mono">
                  ⚡ 蓄積チャージ: Lvl.{permanentChargeLevel}
                </span>
              )}
              {deck.includes('Overheat') && (
                <button
                  onClick={handleOverheatActivation}
                  className="shrink-0 px-3 py-1 text-xs bg-orange-600 hover:bg-orange-500 rounded font-bold transition-all text-white"
                >
                  💥 画面過熱 (50 SP)
                </button>
              )}
            </div>

            {/* Unified Relative Battlefield Arena (so bullets can fly from dice to enemies) */}
            <div className="relative w-full">
              {/* Battle road visualization path */}
              <div className="relative mb-6 h-16 bg-slate-900/70 rounded-xl border border-slate-800 p-2 overflow-hidden shadow-inner flex items-center">
                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-10 font-bold tracking-widest text-slate-400 select-none text-xs">
                  <span>START</span>
                  <span>◀◀◀ DEFENCE MONSTERS ROAD ▶▶▶</span>
                  <span>GOAL</span>
                </div>

                {/* Grid lanes background vertical marks */}
                <div className="absolute inset-0 flex items-center gap-1 opacity-20 pointer-events-none">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="h-full w-px bg-slate-700" />
                  ))}
                </div>

                {/* Spikes, Traps and Shields renders on top */}
                {traps.map(trap => (
                  <div
                    key={trap.id}
                    style={{ left: `${trap.position}%` }}
                    className={`absolute -translate-x-1/2 px-1 text-[10px] py-0.5 rounded font-mono font-bold border z-20 ${
                      trap.type === 'Mine' ? 'bg-amber-500/80 border-amber-400 text-slate-900' :
                      trap.type === 'Shield' ? 'bg-cyan-500/80 border-cyan-300 text-slate-950 animate-pulse' :
                      'bg-emerald-800/50 border-emerald-500 text-emerald-200'
                    }`}
                  >
                    {trap.type === 'Mine' ? '💣地雷' : trap.type === 'Shield' ? `🛡️盾:${trap.healthOrCharges}` : `📐トゲ:${trap.healthOrCharges}`}
                  </div>
                ))}

                {/* Gas Cloud damage zones */}
                {gasClouds.map(gas => (
                  <div
                    key={gas.id}
                    style={{ left: `${gas.position}%` }}
                    className="absolute -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 animate-ping z-10"
                  />
                ))}

                <AnimatePresence>
                  {enemies.map(enemy => (
                    <motion.div
                      key={enemy.id}
                      initial={{ opacity: 0, left: 0 }}
                      animate={{ opacity: 1, left: `${enemy.position}%` }}
                      exit={{ opacity: 0 }}
                      className={`absolute w-11 h-11 -translate-y-1/2 top-1/2 rounded-full flex flex-col items-center justify-center font-bold shadow-lg border-2 z-15 ${
                        enemy.slowed ? 'bg-cyan-900/90 border-cyan-400 text-cyan-200' : 'bg-red-900/90 border-red-500 text-red-100'
                      }`}
                    >
                      <span className="text-[10px] font-mono leading-none">{enemy.hp}</span>
                      <span className="text-[8px] opacity-60 font-mono leading-none">/ {enemy.maxHp}</span>
                      {enemy.poisoned > 0 && <span className="absolute -top-1 -right-1 text-xs">🧪</span>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Dynamic Interactive Deck Grid */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {cells.map(cell => {
                  const adjList = getAdjacentCellIndices(cell.id);
                  // Active moon buffer check
                  const isUnderMoon = adjList.some(idx => cells[idx]?.dice?.type === 'Moon');
                  const isUnderLight = adjList.some(idx => cells[idx]?.dice?.type === 'Light');
                  const hasEvolveCount = cell.dice && (cell.dice.type === 'Growth' || cell.dice.type === 'RandomGrowth' || cell.dice.type === 'BrokenGrowth');
                  const isChargeActive = cell.dice?.type === 'Charge' && chargeModeActive[cell.id];

                  // Form/Transformation status calculations
                  let nameJa = cell.dice ? (DICE_DETAILS[cell.dice.type]?.nameJa || cell.dice.type) : '';
                  let roleText = cell.dice ? (DICE_DETAILS[cell.dice.type]?.role || '') : '';
                  let customBorderClass = '';
                  let bgOverrideClass = '';
                  let transformationEmoji = '';

                  if (cell.dice) {
                    if (cell.dice.type === 'StrongWind') {
                      const isActive = (waveProgress % 7 < 3);
                      if (isActive) {
                        nameJa = '狂風のダイス (暴風態)';
                        roleText = '🌪️ 攻撃速度 MAX';
                        customBorderClass = 'border-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]';
                        bgOverrideClass = 'bg-sky-950/60';
                        transformationEmoji = '🌪️';
                      }
                    }
                    if (cell.dice.type === 'Hurricane') {
                      const isActive = (waveProgress % 10 < 4);
                      if (isActive) {
                        nameJa = 'ハリケーン (極暴風態)';
                        roleText = '🌀 限界突破 2弾';
                        customBorderClass = 'border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.7)]';
                        bgOverrideClass = 'bg-cyan-950/70';
                        transformationEmoji = '🌀';
                      }
                    }
                    if (cell.dice.type === 'Typhoon') {
                      const isActive = (waveProgress % 8 < 3);
                      if (isActive) {
                        nameJa = '台風のダイス (極限界振)';
                        roleText = '⛈️ 確定クリティカル';
                        customBorderClass = 'border-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.7)]';
                        bgOverrideClass = 'bg-teal-950/70 animate-pulse';
                        transformationEmoji = '⛈️';
                      }
                    }
                    if (cell.dice.type === 'Solar') {
                      const solarCount = cells.filter(c => c.dice?.type === 'Solar').length;
                      const isActive = solarCount === 1 || solarCount === 4 || solarCount === 9;
                      if (isActive) {
                        nameJa = '太陽のダイス (活性化)';
                        roleText = '☀️ 灼熱太陽フレア';
                        customBorderClass = 'border-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.8)]';
                        bgOverrideClass = 'bg-orange-950/80';
                        transformationEmoji = '☀️';
                      }
                    }
                    if (cell.dice.type === 'YinYang') {
                      const rowIdx = Math.floor(cell.id / 5);
                      const colIdx = cell.id % 5;
                      const isRowYY = [0,1,2,3,4].every(cOffset => cells[rowIdx * 5 + cOffset]?.dice?.type === 'YinYang');
                      const isColYY = [0,1,2].every(rOffset => cells[rOffset * 5 + colIdx]?.dice?.type === 'YinYang');
                      const isActive = isRowYY || isColYY;
                      if (isActive) {
                        nameJa = '陰陽のダイス (神和合魂)';
                        roleText = '☯️ 絶対無敵 調和バフ';
                        customBorderClass = 'border-white/90 shadow-[0_0_15px_rgba(255,255,255,0.7)]';
                        bgOverrideClass = 'bg-gradient-to-tr from-slate-900 to-slate-100/30';
                        transformationEmoji = '☯️';
                      }
                    }
                    if (cell.dice.type === 'Phoenix') {
                      const isActive = (waveProgress % 8 < 4);
                      if (isActive) {
                        nameJa = '不死鳥ダイス (灼熱化)';
                        roleText = '🔥🐦 不死鳥 第2形態';
                        customBorderClass = 'border-red-400 shadow-[0_0_18px_rgba(239,68,68,0.9)] animate-pulse';
                        bgOverrideClass = 'bg-gradient-to-br from-red-950/80 via-orange-900/60 to-red-900/70';
                        transformationEmoji = '🔥🐦';
                      }
                    }
                  }

                  const diceColorClasses = cell.dice ? getDiceColor(cell.dice.type) : 'bg-slate-900 border-slate-800 hover:border-slate-700';

                  return (
                    <div
                      key={cell.id}
                      onClick={() => handleCellClick(cell.id)}
                      className={`h-28 w-full rounded-xl border-2 flex flex-col items-center justify-between p-2 cursor-pointer transition-all duration-300 relative select-none ${
                        bgOverrideClass || (cell.dice ? diceColorClasses : 'bg-slate-900 border-slate-800 hover:border-slate-700')
                      } ${customBorderClass || ''} ${selectedCellId === cell.id ? 'ring-2 ring-indigo-500 scale-105 shadow-indigo-500/20 shadow-lg' : 'hover:scale-[1.01]'}`}
                    >
                      {/* Floating total damage overlay badge */}
                      {cell.dice && (
                        <div className="absolute -top-1.5 -right-1.5 text-[8px] bg-slate-950/95 text-rose-300 border border-rose-500/30 rounded-full px-1.5 py-0.5 font-mono font-black shadow-[0_2px_6px_rgba(244,63,94,0.4)] flex items-center gap-0.5 z-20 leading-none">
                          <span>💥</span>
                          <span>{formatDamageDealt(diceDamageDealt[cell.dice.id] || 0)}</span>
                        </div>
                      )}

                      {/* Position and details */}
                      <div className="flex justify-between w-full text-[10px] font-mono opacity-50 px-0.5">
                        <span>#{cell.id + 1}</span>
                        {isUnderMoon && <span className="text-blue-300 animate-pulse font-bold">🌙BUFF</span>}
                        {isUnderLight && !isUnderMoon && <span className="text-yellow-200 font-bold">⚡SPEED</span>}
                      </div>

                      {cell.dice ? (
                        <div className="text-center flex-1 flex flex-col items-center justify-center">
                          <motion.div 
                            className="font-extrabold text-sm font-sans tracking-tight leading-dense flex items-center justify-center gap-1"
                            animate={transformationEmoji ? {
                              scale: [1, 1.08, 1],
                              rotate: [0, 2, -2, 0]
                            } : {}}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {transformationEmoji && <span>{transformationEmoji}</span>}
                            <span>{nameJa}</span>
                          </motion.div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">
                            {roleText}
                          </div>

                          {cell.dice.type === 'Saikoro' && saikoroRolls[cell.id] !== undefined && (
                            <motion.div 
                              key={saikoroRolls[cell.id]}
                              initial={{ scale: 0.6, rotate: -40, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              className="mt-1 px-1.5 py-0.5 text-[10px] rounded-md font-mono font-bold bg-amber-500/20 border border-yellow-400/40 text-yellow-300 flex items-center gap-1 shadow animate-pulse"
                            >
                              <span className="text-sm">
                                {["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][saikoroRolls[cell.id] - 1] || "⚀"}
                              </span>
                              <span>{saikoroRolls[cell.id]}x倍撃</span>
                            </motion.div>
                          )}

                          {/* Interactive toggle specifically for Charge dice */}
                          {cell.dice.type === 'Charge' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setChargeModeActive(prev => ({ ...prev, [cell.id]: !prev[cell.id] }));
                              }}
                              className={`mt-1.5 px-2 py-0.5 text-[8px] rounded border font-mono font-bold transition-all ${
                                isChargeActive ? 'bg-yellow-500 text-slate-950 border-yellow-300' : 'bg-slate-900 border-slate-700 text-slate-300'
                              }`}
                            >
                              {isChargeActive ? '🔋貯蓄モード' : '⚔️攻撃モード'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">空き枠</span>
                      )}

                      {/* Bottom pips info / time progress */}
                      <div className="w-full flex justify-between items-center px-0.5">
                        {cell.dice ? (
                          <>
                            <div className="flex items-center gap-1 font-extrabold">
                              {cell.dice.pips <= 7 ? (
                                <div className="flex gap-0.5">
                                  {Array.from({ length: cell.dice.pips }).map((_, idx) => (
                                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-current" />
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-0.5 text-[9px] bg-amber-500/20 text-yellow-300 font-mono px-1 py-0.5 rounded border border-yellow-500/30">
                                  <span>⭐:{cell.dice.pips}</span>
                                </div>
                              )}
                            </div>
                            {hasEvolveCount && (
                              <span className="text-[9px] text-pink-400 font-mono">
                                ⏳Evo:{growthTimer[cell.id] ?? 0}s
                              </span>
                            )}
                          </>
                        ) : (
                          <div />
                        )}
                      </div>

                      {/* Merge / Upgrade Animation Overlay */}
                      <AnimatePresence>
                        {mergeEffects[cell.id] && (
                          <motion.div
                            initial={{ opacity: 1, scale: 0.8 }}
                            animate={{ opacity: [1, 1, 0], scale: [0.8, 1.2, 1.4] }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-0 pointer-events-none rounded-xl border-4 border-amber-400 bg-amber-400/20 flex items-center justify-center z-30 shadow-[0_0_20px_rgba(251,191,36,0.8)]"
                          >
                            <span className="text-2xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]">✨</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Bullet animation tracing: rendered relative to the "Battlefield Arena" root, so bullets fly from dice directly to enemies! */}
              {projectiles.map(p => {
                const trg = enemies.find(e => e.id === p.targetId);
                if (!trg) return null;
                const colIdx = p.fromCell % 5;
                const rowIdx = Math.floor(p.fromCell / 5);
                const startX = `${colIdx * 20 + 10}%`;
                // Grid top offset = 4rem (h-16) + 1.5rem (mb-6) = 5.5rem.
                // Center Y of row = topOffset + rowIdx * 7.75rem + 3.5rem (half of row height) = 9rem + rowIdx * 7.75rem
                const startY = `${9.0 + rowIdx * 7.75}rem`;
                
                const targetX = `${trg.position}%`;
                const targetY = `2rem`;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ left: startX, top: startY, rotate: 0 }}
                    animate={{ left: targetX, top: targetY, rotate: p.label ? 360 : 0 }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 shadow-lg pointer-events-none transition-all flex items-center justify-center ${
                      p.label 
                        ? 'w-6 h-6 rounded-md text-slate-950 font-extrabold text-xs shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                        : 'w-3 h-3 rounded-full'
                    } ${p.color || 'bg-yellow-400 border border-white/20'}`}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {p.label && <span className="leading-none text-[15px] select-none">{p.label}</span>}
                  </motion.div>
                );
              })}

              {/* Cherry Blossom falling petals animation */}
              {cherryParticlesActive && (
                <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                  {Array.from({ length: 15 }).map((_, i) => {
                    const startX = `${Math.random() * 100}%`;
                    const delay = Math.random() * 0.4;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5, y: -20, x: 0 }}
                        animate={{ 
                          opacity: [0, 0.9, 0.9, 0], 
                          y: ['0px', '250px'], 
                          x: ['0px', `${(Math.random() - 0.5) * 80}px`],
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 1.2, delay, ease: "easeOut" }}
                        className="absolute w-2.5 h-3.5 bg-pink-400/80 rounded-full shadow-[0_0_4px_rgba(236,72,153,0.5)]"
                        style={{ left: startX, top: '10%' }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Operational Summons trigger buttons */}
            <div className="flex gap-4">
              <button
                onClick={summonDice}
                disabled={sp < 10}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 disabled:border leading-tight text-white font-extrabold py-5 rounded-2xl text-lg transition-all shadow-lg shadow-indigo-900/10 hover:scale-[1.01]"
              >
                📥 ダイス召喚 / SUMMON (10 SP)
              </button>
              
              <button
                onClick={() => {
                  const emptyCells = cells.filter(cell => cell.dice === null);
                  if (emptyCells.length > 0) {
                    // Maximum cells we can actually afford with present SP (cost is 10 SP per summoned dice)
                    const maxAffordable = Math.floor(sp / 10);
                    let spawnCount = Math.min(emptyCells.length, maxAffordable);
                    
                    if (spawnCount <= 0) return;

                    // If the board is completely empty and we would spawn an odd number of dice,
                    // round down to an even number to ensure perfect pair merging.
                    const isBoardCompletelyEmpty = emptyCells.length === cells.length;
                    if (spawnCount % 2 !== 0 && isBoardCompletelyEmpty) {
                      spawnCount -= 1;
                    }
                    
                    if (spawnCount <= 0) return;

                    const cost = spawnCount * 10;
                    setSp(s => s - cost);

                    let newCells = [...cells];
                    // We only populate up to spawnCount cells
                    const cellsToFill = emptyCells.slice(0, spawnCount);
                    const newGrowthTimers: Record<number, number> = {};

                    for (let i = 0; i < cellsToFill.length; i += 2) {
                      if (i + 1 < cellsToFill.length) {
                        // Pair up cellsToFill[i] and cellsToFill[i+1] with identical dice (type, pip)
                        const randType = deck[Math.floor(Math.random() * deck.length)];
                        const randPips = 1; // Always 1 pip to match standard summon and make merging 100% possible!
                        
                        const idA = cellsToFill[i].id;
                        const idB = cellsToFill[i+1].id;

                        newCells[idA] = {
                          id: idA,
                          dice: { id: generateId(), type: randType, pips: randPips }
                        };
                        newCells[idB] = {
                          id: idB,
                          dice: { id: generateId(), type: randType, pips: randPips }
                        };

                        if (randType === 'Growth' || randType === 'RandomGrowth' || randType === 'BrokenGrowth') {
                          const waitTime = randType === 'RandomGrowth' ? 75 : randType === 'BrokenGrowth' ? 45 : 35;
                          newGrowthTimers[idA] = waitTime;
                          newGrowthTimers[idB] = waitTime;
                        }
                      } else {
                        // For any odd leftover cell, match its type and pips with some occupied cell.
                        // (Which could be an existing cell or one of the newly filled ones from the loop above).
                        const occupiedCells = newCells.filter(c => c.dice !== null);
                        let randType = deck[Math.floor(Math.random() * deck.length)];
                        let randPips = 1;
                        if (occupiedCells.length > 0) {
                          const refDice = occupiedCells[Math.floor(Math.random() * occupiedCells.length)].dice!;
                          randType = refDice.type;
                          randPips = refDice.pips;
                        }

                        const lastCellId = cellsToFill[i].id;
                        newCells[lastCellId] = {
                          id: lastCellId,
                          dice: { id: generateId(), type: randType, pips: randPips }
                        };

                        if (randType === 'Growth' || randType === 'RandomGrowth' || randType === 'BrokenGrowth') {
                          const waitTime = randType === 'RandomGrowth' ? 75 : randType === 'BrokenGrowth' ? 45 : 35;
                          newGrowthTimers[lastCellId] = waitTime;
                        }
                      }
                    }

                    setCells(newCells);

                    if (Object.keys(newGrowthTimers).length > 0) {
                      setGrowthTimer(prev => ({ ...prev, ...newGrowthTimers }));
                    }
                  }
                }}
                disabled={sp < 10}
                className="px-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono font-bold text-slate-400 hover:text-slate-200 transition-colors"
                title="所持SPの分だけ一括展開して盤面を埋めます（1個につき10 SP消費、必ずマージ可能なペアで配置されます）"
              >
                ⚡ 一括展開 (1体10 SP消費 & 100%マージ保証)
              </button>
            </div>

            {/* In-game upgrading panel */}
            <div className="mt-8 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="font-extrabold text-white text-lg tracking-tight">🔬 アビリティ強化 / Level UP</h3>
                <span className="text-xs text-slate-400">現在セットされているデッキ内のダイスを強化可能。</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {deck.map(type => {
                  const lvl = diceLevels[type] || 1;
                  const cost = lvl * 100;
                  const details = DICE_DETAILS[type];
                  const hasEnoughSp = sp >= cost;
                  return (
                    <button
                      key={type}
                      onClick={() => upgradeDiceType(type)}
                      disabled={sp < cost || lvl >= 5}
                      className={`relative overflow-hidden bg-slate-950 rounded-xl p-3 text-center transition-all disabled:opacity-40 border-2 ${
                        lvl >= 5 
                          ? 'border-indigo-500/20 bg-indigo-950/10' 
                          : hasEnoughSp 
                            ? 'border-yellow-400/50 hover:bg-slate-900/90 shadow-[0_0_12px_rgba(234,179,8,0.15)] cursor-pointer' 
                            : 'border-slate-850 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-500 uppercase">{details?.role || 'FIREPOWER'}</div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">{details?.nameJa || type}</div>
                      <div className="text-lg font-mono font-extrabold text-yellow-400 mt-1">LV {lvl}</div>
                      <div className={`text-[10px] font-mono font-bold mt-2 px-2 py-0.5 rounded-full inline-block leading-none ${
                        lvl >= 5 
                          ? 'bg-indigo-500/20 text-indigo-300' 
                          : hasEnoughSp 
                            ? 'bg-amber-500/20 text-yellow-300 animate-pulse' 
                            : 'bg-slate-900 text-slate-505'
                      }`}>
                        {lvl < 5 ? `🪙 ${cost} SP` : '⚡ MAX'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persistent Floating Game HUD for Battle SP & Quick Action (Only in Battle Tab) */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] px-4 py-2.5 rounded-2xl backdrop-blur-md bg-slate-950/95 border border-yellow-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex justify-between items-center gap-3 animate-fade-in sm:px-5">
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Wave Display */}
                <div>
                  <span className="text-[7.5px] font-mono font-bold text-slate-500 uppercase block leading-none">WAVE</span>
                  <strong className="text-xs font-black text-indigo-400 font-mono">🌊 {wave}</strong>
                </div>
                
                <div className="h-5 w-px bg-slate-800" />
                
                {/* HP/Hearts display */}
                <div>
                  <span className="text-[7.5px] font-mono font-bold text-slate-500 uppercase block leading-none">LIVES</span>
                  <strong className="text-xs font-black text-red-500 font-mono">❤️ {lives}</strong>
                </div>
              </div>

              {/* Massive Glowing SP representation */}
              <div className="flex-1 flex flex-col items-center justify-center bg-yellow-500/5 py-1 px-3 rounded-xl border border-yellow-400/20 shadow-[inset_0_1px_6px_rgba(234,179,8,0.1)]">
                <span className="text-[8px] font-black font-mono text-amber-500 uppercase block leading-none tracking-wide text-center">💸 所持 SP (MONEY)</span>
                <strong className="text-lg font-black font-mono text-yellow-300 mt-0.5 tracking-wider">
                  💰 {sp} <span className="text-[10px] font-normal text-yellow-400">SP</span>
                </strong>
              </div>

              {/* Quick Summon Button */}
              <div className="shrink-0">
                <button
                  onClick={summonDice}
                  disabled={sp < 10}
                  className={`px-3 py-1.5 font-black rounded-lg text-xs transition-all duration-200 flex items-center gap-1 active:scale-95 cursor-pointer ${
                    sp >= 10
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 border border-yellow-300/45 shadow-lg shadow-yellow-500/10'
                      : 'bg-slate-900 border border-slate-800/60 text-slate-600 cursor-not-allowed'
                  }`}
                  title="盤面の空き枠にダイスを1体ランダムに召喚します (10 SP消費)"
                >
                  <span className="font-extrabold text-[11px]">📥 召喚 (10)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. DECK BUILDER TAB */}
        {activeTab === 'deck' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-extrabold text-white">🗂️ デッキ編成 / DECK SETUP</h2>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              バトルにてランダム召喚・強化される持ち込みダイスを<b>最大5個</b>選択してください。
            </p>

            {/* Achievements and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 mb-6 bg-slate-950 rounded-xl border border-slate-800 text-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase leading-none block">最大到達ウェーブ / BEST WAVE</span>
                <span className="text-xl font-extrabold text-indigo-400 mt-1.5 block">🌊 {maxWaveReached} Wave</span>
                <span className="text-[9px] text-slate-400 mt-1">到達すると対応するダイスが自動解放！</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase leading-none block">累計討伐数 / TOTAL KILLS</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1.5 block">👾 {totalKills} 匹</span>
                <span className="text-[9px] text-slate-400 mt-1">たくさん倒すことで自動解放も可能！</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase leading-none block">所持ダイスの欠片 / SHARDS</span>
                <span className="text-xl font-extrabold text-amber-400 mt-1.5 block">💎 {shards} 欠片</span>
                <span className="text-[9px] text-slate-400 mt-1">敵撃破で +1、ウェーブ突破で +50</span>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block leading-none">テスト＆システム / SYSTEM TOOLS</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <button
                      onClick={() => setShards(s => s + 500)}
                      className="px-2 py-1 text-[9px] font-bold bg-amber-600/80 hover:bg-amber-500 text-white rounded transition-colors"
                      title="Add 500 shards"
                    >
                      🔮 欠片+500
                    </button>
                    <button
                      onClick={() => {
                        setMaxWaveReached(w => w + 1);
                        setShards(s => s + 50);
                      }}
                      className="px-2 py-1 text-[9px] font-bold bg-indigo-600/80 hover:bg-indigo-500 text-white rounded transition-colors"
                      title="Increment Max Wave reached"
                    >
                      🌊 W+1記録
                    </button>
                    {!showResetConfirm ? (
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="px-2 py-1 text-[9px] font-bold bg-rose-600 text-white rounded hover:bg-rose-500 transition-colors"
                        title="Reset game progress"
                      >
                        ⚠️ データリセット
                      </button>
                    ) : (
                      <div className="flex gap-1 items-center bg-rose-950/40 p-1 rounded border border-rose-500/30">
                        <span className="text-[8px] text-rose-400 font-bold leading-none px-1">リセット？</span>
                        <button
                          onClick={resetGameData}
                          className="px-1.5 py-0.5 text-[8px] font-extrabold bg-rose-600 text-white rounded hover:bg-rose-500 transition-colors"
                        >
                          はい
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-1.5 py-0.5 text-[8px] font-bold bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                        >
                          いいえ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Active Deck */}
            <div className="mb-8 p-4 bg-slate-950 rounded-xl border border-indigo-500/20">
              <h3 className="text-xs font-mono text-slate-400 mb-3 tracking-widest block uppercase">現在セットされているデッキ / CURRENT DECK</h3>
              <div className="grid grid-cols-5 gap-3">
                {deck.map(type => {
                  const info = DICE_DETAILS[type];
                  return (
                    <div
                      key={type}
                      onClick={() => toggleDeckSelection(type)}
                      className={`cursor-pointer h-24 rounded-lg flex flex-col items-center justify-between p-2 border-2 transition-all hover:scale-105 ${getDiceColor(type)}`}
                    >
                      <span className="text-[8px] font-mono bg-slate-950/40 px-1 py-0.5 rounded leading-none">{info?.role}</span>
                      <strong className="text-xs font-extrabold tracking-tight truncate text-center">{info?.nameJa || type}</strong>
                      <span className="text-[9px] text-red-400 hover:underline">削除 ✕</span>
                    </div>
                  );
                })}
                {Array.from({ length: 5 - deck.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 rounded-lg bg-slate-900/40 border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-500 font-mono text-xs"
                  >
                    枠空き
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable grid representation of all 61 dice */}
            <h3 className="text-lg font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">ダイスキット一覧 / CARD ALBUM (全64種)</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[550px] overflow-y-auto pr-2">
              {ALL_DICE_TYPES.map(type => {
                const info = DICE_DETAILS[type];
                const active = deck.includes(type);
                const colors = getDiceColor(type);
                const unlocked = unlockedTypes.includes(type);
                const cond = DICE_UNLOCK_CONDITIONS[type];
                
                const currentPieceLvl = getPieceLevel(type);
                const upgradeCost = getUpgradeCost(type);
                const currentPieces = dicePieces[type] || 0;
                const canUpgrade = currentPieces >= upgradeCost;

                if (unlocked) {
                  return (
                    <div
                      key={type}
                      id={`deck-card-${type}`}
                      className={`stats-card p-3 rounded-xl border-2 transition-all duration-300 flex flex-col justify-between min-h-[195px] ${
                        active ? `${colors} ring-1 ring-offset-2 ring-offset-slate-900 ring-indigo-500` : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[8px] px-1 py-0.5 bg-indigo-500/30 border border-indigo-400/20 rounded text-indigo-300 font-extrabold leading-none">Lv.{currentPieceLvl}</span>
                          <span className="text-[8px] px-1 py-0.5 bg-slate-800/60 rounded text-slate-400 font-serif leading-none truncate max-w-[50px]">{info?.rarity}</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-100 tracking-tight mt-1.5 truncate">{info?.nameJa || type}</h4>
                        <p className="text-[9px] text-slate-400 line-clamp-2 mt-1 leading-snug text-left">{info?.desc}</p>

                        {/* Upward and Downward compatibilities */}
                        <div className="mt-2 pt-1.5 border-t border-slate-900 flex flex-col gap-1 text-left">
                          {(() => {
                            const rel = getDiceRelations(type);
                            return (
                              <>
                                {rel.inferiors.length > 0 && (
                                  <div className="text-[8px] leading-tight text-slate-400">
                                    <span className="text-blue-400 font-bold">◄ 下位: </span>
                                    <span className="inline-flex flex-wrap gap-0.5">
                                      {rel.inferiors.slice(0, 5).map(inf => {
                                        const subInfo = DICE_DETAILS[inf];
                                        return (
                                          <span 
                                            key={inf} 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const el = document.getElementById(`deck-card-${inf}`);
                                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                            className="px-1 py-0.5 bg-blue-950/60 border border-blue-900/35 text-blue-300 rounded text-[7.5px] hover:bg-blue-900/90 hover:text-white cursor-pointer transition-all leading-none"
                                            title={subInfo?.nameJa || inf}
                                          >
                                            {subInfo?.nameJa || inf}
                                          </span>
                                        );
                                      })}
                                    </span>
                                  </div>
                                )}
                                {rel.superiors.length > 0 && (
                                  <div className="text-[8px] leading-tight text-slate-400">
                                    <span className="text-amber-400 font-bold">▲ 上位: </span>
                                    <span className="inline-flex flex-wrap gap-0.5">
                                      {rel.superiors.slice(0, 5).map(sup => {
                                        const supInfo = DICE_DETAILS[sup];
                                        return (
                                          <span 
                                            key={sup} 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const el = document.getElementById(`deck-card-${sup}`);
                                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                            className="px-1 py-0.5 bg-amber-950/60 border border-amber-900/35 text-amber-300 rounded text-[7.5px] hover:bg-amber-900/90 hover:text-white cursor-pointer transition-all leading-none"
                                            title={supInfo?.nameJa || sup}
                                          >
                                            {supInfo?.nameJa || sup}
                                          </span>
                                        );
                                      })}
                                    </span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-900 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 leading-none">
                          <span className="text-slate-400 font-medium">🧩: {currentPieces}/{upgradeCost}</span>
                          <span className="text-emerald-400 font-bold font-mono">Dmg +{Math.round((currentPieceLvl - 1) * 15)}%</span>
                        </div>
                        <button
                          disabled={!canUpgrade}
                          onClick={(e) => {
                            e.stopPropagation();
                            upgradeDiceWithPieces(type);
                          }}
                          className={`w-full py-1 rounded text-[10px] font-bold transition-all ${
                            canUpgrade 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 active:scale-95 cursor-pointer shadow-md' 
                            : 'bg-slate-900 text-slate-600 border border-slate-800/60 cursor-not-allowed'
                          }`}
                        >
                          {canUpgrade ? '⚡ 強 化 す る' : 'かけら不足'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDeckSelection(type);
                          }}
                          className={`w-full py-1 rounded text-[10px] font-bold transition-all ${
                            active 
                            ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' 
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 cursor-pointer'
                          }`}
                        >
                          {active ? '🗃️ デッキから外す' : '📥 デッキにセット'}
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={type}
                      id={`deck-card-${type}`}
                      className="bg-slate-950/80 border-slate-900 border-2 p-3 rounded-xl flex flex-col justify-between min-h-[195px] relative overflow-hidden"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] px-1 py-0.5 bg-slate-900 rounded text-slate-500 leading-none">LOCKED</span>
                          <span className="text-[9px] text-slate-505 font-bold">🔒 未解放</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-400 tracking-tight mt-1.5 truncate">{info?.nameJa || type}</h4>
                        <p className="text-[9px] text-slate-500 line-clamp-2 mt-1 leading-snug text-left select-none opacity-50">{info?.desc}</p>

                        {/* Upward and Downward compatibilities */}
                        <div className="mt-2 pt-1.5 border-t border-slate-900/40 flex flex-col gap-1 text-left opacity-60">
                          {(() => {
                            const rel = getDiceRelations(type);
                            return (
                              <>
                                {rel.inferiors.length > 0 && (
                                  <div className="text-[8px] leading-tight text-slate-500">
                                    <span className="text-blue-500/80 font-bold">◄ 下位: </span>
                                    <span className="inline-flex flex-wrap gap-0.5">
                                      {rel.inferiors.slice(0, 5).map(inf => {
                                        const subInfo = DICE_DETAILS[inf];
                                        return (
                                          <span 
                                            key={inf} 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const el = document.getElementById(`deck-card-${inf}`);
                                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                            className="px-1 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded text-[7.5px] hover:bg-slate-800 hover:text-white cursor-pointer transition-all leading-none"
                                            title={subInfo?.nameJa || inf}
                                          >
                                            {subInfo?.nameJa || inf}
                                          </span>
                                        );
                                      })}
                                    </span>
                                  </div>
                                )}
                                {rel.superiors.length > 0 && (
                                  <div className="text-[8px] leading-tight text-slate-505">
                                    <span className="text-amber-500/80 font-bold">▲ 上位: </span>
                                    <span className="inline-flex flex-wrap gap-0.5">
                                      {rel.superiors.slice(0, 5).map(sup => {
                                        const supInfo = DICE_DETAILS[sup];
                                        return (
                                          <span 
                                            key={sup} 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const el = document.getElementById(`deck-card-${sup}`);
                                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                            className="px-1 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded text-[7.5px] hover:bg-slate-800 hover:text-white cursor-pointer transition-all leading-none"
                                            title={supInfo?.nameJa || sup}
                                          >
                                            {supInfo?.nameJa || sup}
                                          </span>
                                        );
                                      })}
                                    </span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-900/60 flex flex-col gap-1.5 relative z-20">
                        {cond?.gachaOnly ? (
                          <>
                            <div className="flex justify-between items-center text-[9px] leading-none mb-0.5">
                              <span className="text-pink-400 font-bold">🌌 解放進捗:</span>
                              <span className={`font-mono font-bold ${currentPieces >= upgradeCost ? 'text-green-400' : 'text-slate-400'}`}>
                                {currentPieces} / {upgradeCost} 個
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentPieces >= upgradeCost) {
                                  upgradeDiceWithPieces(type);
                                } else {
                                  setActiveTab('gacha' as any);
                                }
                              }}
                              className={`w-full py-1 rounded text-[10px] font-bold transition-all ${
                                currentPieces >= upgradeCost 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 text-slate-950 active:scale-95 cursor-pointer shadow-md' 
                                : 'bg-pink-600/20 text-pink-400 border border-pink-500/25 hover:bg-pink-600/30 cursor-pointer'
                              }`}
                            >
                              {currentPieces >= upgradeCost ? '🔓 ダイスを解放する！' : 'ガチャで集める ➔'}
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-[9px] text-slate-400 text-center leading-normal bg-slate-900/50 p-2 rounded border border-slate-800">
                              <span className="block text-[8px] text-amber-500 font-bold mb-0.5">🏆 実績条件達成で解放</span>
                              {cond?.label}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* 2.5 GACHA TAB */}
        {activeTab === ('gacha' as any) && (() => {
          const totalGachaDice = ALL_DICE_TYPES.filter(type => DICE_UNLOCK_CONDITIONS[type]?.gachaOnly);
          const lockedGachaDice = totalGachaDice.filter(type => !unlockedTypes.includes(type));
          const unlockedGachaDiceCount = totalGachaDice.length - lockedGachaDice.length;

          return (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              {/* Ambient background glow */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-md">
                  PIECE GACHA SYSTEM v2
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-3">🌌 宿命のダイスかけらガチャ</h2>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed text-left sm:text-center">
                  ガチャからは全64種類の<b>「ダイスのかけら」</b>がランダムに排出されます。
                  かけらを<b>10個集めるとダイスが新規解放</b>され、さらに余分に集めることで<b>与ダメージを永続的に大幅強化（レベルアップ）</b>することができます！
                  <span className="block mt-2 text-pink-400 font-semibold text-xs text-center">
                    💡 10連ガチャは【11連分（110個）】、100連ガチャは【120連分（1200個）】のかけらが手に入り、非常にお得です！
                  </span>
                </p>
                
                {/* Progress tracking indicator */}
                <div className="mt-5 flex items-center justify-center gap-3 text-xs bg-slate-950/60 w-fit mx-auto px-4 py-1.5 rounded-full border border-slate-800 text-slate-300 font-mono">
                  <span>ガチャ専用ダイス収集率:</span>
                  <strong className="text-pink-400">{unlockedGachaDiceCount} / {totalGachaDice.length}</strong>
                  <span className="text-slate-600">|</span>
                  <span>未解放: <strong className="text-amber-400">{lockedGachaDice.length}</strong>種類</span>
                </div>

                {/* Rarity rates board */}
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-850 text-slate-300 font-mono w-full max-w-lg mx-auto shadow-inner">
                  <span className="font-extrabold text-slate-400">✨ 排出率 (Emission Rates):</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500" /> 一般 (Common): <strong className="text-slate-200">45%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> 希少 (Rare): <strong className="text-blue-300">30%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> 特別 (Unique): <strong className="text-purple-300">18%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> 伝説 (Legendary): <strong className="text-amber-300 font-extrabold">7%</strong>
                  </span>
                </div>
              </div>

              {/* Shards tracker display */}
              <div className="flex justify-center mb-6 relative z-10 animate-fade-in">
                <div className="bg-slate-950 px-6 py-4 rounded-xl border border-slate-800 flex items-center gap-4 shadow-xl">
                  <span className="text-2xl">💎</span>
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block leading-none">所持ダイヤ（ガチャ結晶） / CURRENT GEMSTONES</span>
                    <strong className="text-3xl font-mono text-amber-400 mt-1 block">{shards} <span className="text-xs font-normal text-slate-400">💎</span></strong>
                  </div>
                  <button 
                    onClick={() => setShards(s => s + 50000)}
                    className="ml-4 px-2.5 py-1.5 bg-indigo-950/85 hover:bg-indigo-900 border border-indigo-500/30 rounded-lg text-[9px] font-extrabold text-indigo-300 hover:text-white cursor-pointer active:scale-95 transition-all"
                    title="開発テスト用: ダイヤ+50,000"
                  >
                    🚀 テスト💎+50k
                  </button>
                </div>
              </div>

              {/* Gacha Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8 relative z-10">
                {/* 1x Pull */}
                <button
                  onClick={() => rollPiecesGacha(1)}
                  disabled={shards < 100 || gachaRolling}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 shadow-md ${
                    shards >= 100 && !gachaRolling
                    ? 'bg-slate-950 border-slate-800 hover:border-pink-500 text-slate-200 cursor-pointer active:scale-95'
                    : 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-widest text-slate-500">SINGLE PULL</span>
                  <strong className="text-base text-white">✨ 単発ガチャ (100💎)</strong>
                  <span className="text-[9.5px] text-pink-400">かけら10個をランダム入手</span>
                </button>

                {/* 10x Pull */}
                <button
                  onClick={() => rollPiecesGacha(10)}
                  disabled={shards < 1000 || gachaRolling}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 shadow-md relative overflow-hidden ${
                    shards >= 1000 && !gachaRolling
                    ? 'bg-slate-950 border-pink-500/50 hover:border-pink-500 text-slate-200 cursor-pointer active:scale-95 ring-1 ring-pink-500/20'
                    : 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-pink-500 text-white font-mono text-[8px] px-1 font-bold rounded-bl uppercase animate-pulse">
                    +1回分オトク!
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-pink-400">10PULLS ➜ 11VALUE</span>
                  <strong className="text-base text-pink-300">🔥 10連ガチャ (1000💎)</strong>
                  <span className="text-[9.5px] text-amber-300 font-extrabold">かけら110個を大量入手！</span>
                </button>

                {/* 100x Pull */}
                <button
                  onClick={() => rollPiecesGacha(100)}
                  disabled={shards < 10000 || gachaRolling}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 shadow-md relative overflow-hidden ${
                    shards >= 10000 && !gachaRolling
                    ? 'bg-slate-950 border-indigo-500/50 hover:border-indigo-400 text-slate-200 cursor-pointer active:scale-95 ring-1 ring-indigo-500/20'
                    : 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono text-[8px] px-1 font-bold rounded-bl uppercase">
                    +20回分オトク!!
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-indigo-400">100PULLS ➜ 120VALUE</span>
                  <strong className="text-base text-indigo-300">👑 100連ガチャ (10000💎)</strong>
                  <span className="text-[9.5px] text-emerald-400 font-extrabold">かけら1200個を極大入手！！！</span>
                </button>
              </div>

              {/* Cheap Gacha Section Selector */}
              <div className="mt-10 mb-8 relative z-10 border-t border-slate-850 pt-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="h-px bg-slate-800 flex-1 max-w-[80px]" />
                  <span className="text-sm font-extrabold text-teal-400 font-mono tracking-widest uppercase">
                    🟢 お手頃常設・格安特攻ガチャ (全6種類) ✨
                  </span>
                  <span className="h-px bg-slate-800 flex-1 max-w-[80px]" />
                </div>
                <p className="text-[11px] text-slate-400 text-center mb-6 max-w-xl mx-auto leading-relaxed">
                  初心者・一般層にオススメの激安シリーズ！一般〜希少等級のダイス片や、戦闘の基礎を支える特定のダイス片だけを、超リーズナブルな価格でお得に入手できます。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CHEAP_GACHA_LIST.map((cfg) => {
                    return (
                      <div
                        key={cfg.id}
                        className={`bg-slate-950/95 p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${cfg.borderColor} hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/5 shadow-lg`}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-y-0 -left-[100%] w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 pointer-events-none" />

                        <div>
                          {/* Header badges */}
                          <div className="flex justify-between items-center mb-2.5">
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border leading-none ${cfg.badgeBg}`}>
                              {cfg.badge}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-teal-450 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                              <span>💎</span> {cfg.cost.toLocaleString()}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className={`text-xs sm:text-xs font-extrabold tracking-tight ${cfg.textColor} mb-1 flex items-center gap-1.5`}>
                            {cfg.name}
                          </h4>

                          {/* Shard count summary */}
                          <div className="text-[9px] font-black text-teal-400 mb-2 flex items-center gap-1">
                            <span>📦 基礎獲得量:</span>
                            <span>単発 {cfg.totalPieces} 個 のかけら</span>
                          </div>

                          {/* Description */}
                          <p className="text-[9.5px] text-slate-400 leading-relaxed mb-3 text-left">
                            {cfg.desc}
                          </p>

                          {/* Pool restriction list items */}
                          {cfg.poolText && (
                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-900 text-left mb-3">
                              <span className="text-[8px] text-slate-500 font-bold block mb-1">🎯 排出対象ダイス:</span>
                              <p className="text-[8.5px] text-slate-300 leading-normal line-clamp-2">
                                {cfg.poolText}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer details & Action */}
                        <div className="mt-4 pt-3 border-t border-slate-900/85">
                          <div className="text-[8.5px] font-mono text-slate-500 mb-2 text-left truncate animate-pulse" title={cfg.ratesText}>
                            📊 排出仕様: {cfg.ratesText}
                          </div>
                          
                          {/* 3-Tier Multi-Pull Actions */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {/* 1x Button */}
                            <button
                              onClick={() => rollSpecialGacha(cfg.id, 1)}
                              disabled={shards < cfg.cost || gachaRolling}
                              className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                                shards >= cfg.cost && !gachaRolling
                                  ? 'bg-slate-900 border border-slate-800 hover:border-teal-500 text-slate-200 hover:text-white'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-[7.5px] opacity-60 font-mono scale-90">1回 (x1)</span>
                              <span className="font-extrabold">{cfg.cost}💎</span>
                              <span className="text-[7px] text-slate-400 leading-none">+{cfg.totalPieces}個</span>
                            </button>

                            {/* 10x Button */}
                            <button
                              onClick={() => rollSpecialGacha(cfg.id, 10)}
                              disabled={shards < (cfg.cost * 10) || gachaRolling}
                              className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold text-center transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center items-center ${
                                shards >= (cfg.cost * 10) && !gachaRolling
                                  ? 'bg-gradient-to-b from-teal-950 to-teal-900/90 border border-pink-500/30 hover:border-pink-500/80 text-pink-300 hover:text-white'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                              }`}
                            >
                              <div className="absolute top-0 right-0 bg-pink-500 text-white font-mono text-[5.5px] px-0.5 leading-none font-bold rounded-bl uppercase scale-75 origin-top-right">
                                +1倍
                              </div>
                              <span className="text-[7.5px] opacity-75 font-mono scale-90">10連 (x11)</span>
                              <span className="font-extrabold font-mono text-emerald-300">{(cfg.cost * 10)}💎</span>
                              <span className="text-[7px] text-pink-300 font-bold leading-none">+{cfg.totalPieces * 11}個</span>
                            </button>

                            {/* 100x Button */}
                            <button
                              onClick={() => rollSpecialGacha(cfg.id, 100)}
                              disabled={shards < (cfg.cost * 100) || gachaRolling}
                              className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold text-center transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center items-center ${
                                shards >= (cfg.cost * 100) && !gachaRolling
                                  ? 'bg-gradient-to-b from-indigo-950 to-indigo-900/90 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                              }`}
                            >
                              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-mono text-[5.5px] px-0.5 leading-none font-bold rounded-bl uppercase scale-75 origin-top-right">
                                +20倍
                              </div>
                              <span className="text-[7.5px] opacity-75 font-mono scale-90">100連 (x120)</span>
                              <span className="font-extrabold font-mono text-amber-400">{(cfg.cost * 100).toLocaleString()}💎</span>
                              <span className="text-[7px] text-amber-300 font-bold leading-none">+{cfg.totalPieces * 120}個</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Premium Gacha Section Selector */}
              <div className="mt-8 mb-10 relative z-10 border-t border-slate-850 pt-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="h-px bg-slate-800 flex-1 max-w-[80px]" />
                  <span className="text-sm font-extrabold text-indigo-400 font-mono tracking-widest uppercase">
                    🔥 特別仕様・高級プレミアム特攻ガチャ (全9種類) ✨
                  </span>
                  <span className="h-px bg-slate-800 flex-1 max-w-[80px]" />
                </div>
                <p className="text-[11px] text-slate-400 text-center mb-6 max-w-xl mx-auto leading-relaxed">
                  ダイヤを貯めた上級者専用！特定ジャンル(火力、支援、デバフなど)のダイス片だけをピンポイントで厳選抽出したり、伝説枠(Legendary)の排出率を極大ブーストした超高級限定ガシャシリーズ。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PREMIUM_GACHA_LIST.map((cfg) => {
                    return (
                      <div
                        key={cfg.id}
                        className={`bg-slate-950/95 p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${cfg.borderColor} hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 shadow-lg`}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-y-0 -left-[100%] w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 pointer-events-none" />

                        <div>
                          {/* Header badges */}
                          <div className="flex justify-between items-center mb-2.5">
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border leading-none ${cfg.badgeBg}`}>
                              {cfg.badge}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                              <span>💎</span> {cfg.cost.toLocaleString()}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className={`text-xs sm:text-xs font-extrabold tracking-tight ${cfg.textColor} mb-1 flex items-center gap-1.5`}>
                            {cfg.name}
                          </h4>

                          {/* Shard count summary */}
                          <div className="text-[9px] font-black text-emerald-400 mb-2 flex items-center gap-1">
                            <span>📦 基礎獲得量:</span>
                            <span>
                              {cfg.id === 'gamble_roll' 
                                ? '基礎100個 (サイコロの目で最大600個に倍増!!)' 
                                : `単発 ${cfg.totalPieces} 個 のかけら`}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-[9.5px] text-slate-400 leading-relaxed mb-3 text-left">
                            {cfg.desc}
                          </p>

                          {/* Pool restriction list items */}
                          {cfg.poolText && (
                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-900 text-left mb-3">
                              <span className="text-[8px] text-slate-500 font-bold block mb-1">🎯 封入確率対象ダイス:</span>
                              <p className="text-[8.5px] text-slate-300 leading-normal line-clamp-2">
                                {cfg.poolText}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer details & Action */}
                        <div className="mt-4 pt-3 border-t border-slate-900/85">
                          <div className="text-[8.5px] font-mono text-slate-500 mb-2 text-left truncate select-none" title={cfg.ratesText}>
                            📊 排出仕様: {cfg.ratesText}
                          </div>
                          
                          {/* 3-Tier Multi-Pull Actions */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {/* 1x Button */}
                            <button
                              onClick={() => rollSpecialGacha(cfg.id, 1)}
                              disabled={shards < cfg.cost || gachaRolling}
                              className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                                shards >= cfg.cost && !gachaRolling
                                  ? 'bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-200 hover:text-white'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-[7.5px] opacity-60 font-mono scale-90">1回 (x1)</span>
                              <span className="font-extrabold">{cfg.cost}💎</span>
                              <span className="text-[7px] text-slate-400 leading-none">+{cfg.totalPieces}個</span>
                            </button>

                            {/* 10x Button */}
                            <button
                              onClick={() => rollSpecialGacha(cfg.id, 10)}
                              disabled={shards < (cfg.cost * 10) || gachaRolling}
                              className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold text-center transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center items-center ${
                                shards >= (cfg.cost * 10) && !gachaRolling
                                  ? 'bg-gradient-to-b from-indigo-950 to-indigo-900/90 border border-pink-500/30 hover:border-pink-500/80 text-pink-300 hover:text-white'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                              }`}
                            >
                              <div className="absolute top-0 right-0 bg-pink-500 text-white font-mono text-[5.5px] px-0.5 leading-none font-bold rounded-bl uppercase scale-75 origin-top-right">
                                +1倍
                              </div>
                              <span className="text-[7.5px] opacity-75 font-mono scale-90">10連 (x11)</span>
                              <span className="font-extrabold font-mono text-emerald-305">{(cfg.cost * 10).toLocaleString()}💎</span>
                              <span className="text-[7px] text-pink-300 font-bold leading-none">+{cfg.totalPieces * 11}個</span>
                            </button>

                            {/* 100x Button */}
                            <button
                              onClick={() => rollSpecialGacha(cfg.id, 100)}
                              disabled={shards < (cfg.cost * 100) || gachaRolling}
                              className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold text-center transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center items-center ${
                                shards >= (cfg.cost * 100) && !gachaRolling
                                  ? 'bg-gradient-to-b from-violet-950 to-violet-900/90 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                              }`}
                            >
                              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-mono text-[5.5px] px-0.5 leading-none font-bold rounded-bl uppercase scale-75 origin-top-right">
                                +20倍
                              </div>
                              <span className="text-[7.5px] opacity-75 font-mono scale-90">100連 (x120)</span>
                              <span className="font-extrabold font-mono text-amber-400">{(cfg.cost * 100).toLocaleString()}💎</span>
                              <span className="text-[7px] text-amber-300 font-bold leading-none">+{cfg.totalPieces * 120}個</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spinner & Results Output Container */}
              <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl relative z-10 min-h-[220px]">
                {gachaRolling ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
                      <div className="absolute inset-2 rounded-full border-4 border-dotted border-pink-500 animate-spin" style={{ animationDuration: '2s' }} />
                      <div className="absolute inset-4 rounded-full border-2 border-indigo-300 animate-ping" />
                    </div>
                    <strong className="text-indigo-300 text-sm font-semibold mt-6 animate-pulse">
                      召喚粒子を結合させて、かけらを抽出しています...
                    </strong>
                  </div>
                ) : gachaPiecesResult ? (
                  <div className="flex flex-col animate-fade-in text-center">
                    <div className="text-xs text-emerald-400 font-extrabold tracking-widest uppercase mb-1">🎉 GACHA REWARD SUMMONED 🎉</div>
                    
                    {specialGachaFeedback && (
                      <div className="mb-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 text-pink-300 border border-pink-500/30 py-3 px-5 rounded-2xl text-[11px] font-extrabold leading-relaxed max-w-lg mx-auto shadow-md animate-pulse">
                        {specialGachaFeedback}
                      </div>
                    )}

                    <h3 className="text-sm font-semibold text-slate-300 mb-3 font-mono">排出したダイスのかけら一覧：</h3>
                    
                    <p className="text-[10px] text-amber-400 font-mono mb-4 bg-slate-900 border border-slate-800 w-fit mx-auto px-4 py-1 rounded-full">
                      合計 {gachaPiecesResult.reduce((sum, item) => sum + item.count, 0)} 個 のかけらを獲得しました！
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[350px] overflow-y-auto pr-1">
                      {gachaPiecesResult.map(item => {
                        const info = DICE_DETAILS[item.type];
                        const countOfType = dicePieces[item.type] || 0;
                        const isUnlocked = unlockedTypes.includes(item.type);
                        const isUnlockReady = !isUnlocked && countOfType >= 10;
                        
                        return (
                          <div
                            key={item.type}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between text-center transition-transform hover:scale-[1.03] ${getDiceColor(item.type)}`}
                          >
                            <div>
                              <div className="text-[8px] opacity-75 font-serif">{info?.rarity}</div>
                              <div className="text-[10px] font-black tracking-tight truncate mt-0.5">{info?.nameJa || item.type}</div>
                            </div>
                            <div className="my-2">
                              <span className="text-xs text-white opacity-80 block font-mono">個数</span>
                              <strong className="text-lg font-black block leading-none">+{item.count}</strong>
                            </div>
                            <div className="border-t border-white/10 pt-1">
                              <span className="text-[8.5px] font-mono block opacity-80">
                                総所持: {countOfType}個
                              </span>
                              {isUnlockReady && (
                                <span className="text-[8px] text-green-300 font-bold block mt-0.5 animate-bounce">
                                  🔓 解放可能！
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 text-xs text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 max-w-md mx-auto">
                      📢 <b>『デッキ』タブ</b>に行ると、獲得したかけらを消費してダイスを解放、または与ダメージを永続的に大幅レベルアップ強化できます！
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 select-none">
                    <div className="text-5xl mb-4 grayscale opacity-40 filter">🔮</div>
                    <p className="text-slate-400 text-sm">
                      上のガチャボタンを押して、ダイスのかけらを入手しましょう！
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 3. INTERACTIVE INDEX/GUIDE */}
        {activeTab === 'guide' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-extrabold text-white">📘 ランダム・ダイス攻略図鑑</h2>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              ゲームの全7大ロール（役割）と、全61種類のダイスの詳細設定およびシミュレーションの実装対応状況を確認できます。
            </p>

            {/* Tactical role explanation cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong className="text-indigo-400 text-sm font-mono block mb-1">① 火力（メインアタッカー）</strong>
                <p className="text-xs text-slate-300 leading-normal">
                  太陽・陰陽・狂風など、盤面展開によって超火力を発揮するバトルの中核。各アタッカーに合わせた最適な外周・隣接バフ配置が重要です。
                </p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 text-sm font-mono block mb-1">② 割合・特殊ダメージ</strong>
                <p className="text-xs text-slate-300 leading-normal">
                  原子や光の剣など、後半モンスターの高億HPを段階的に切り崩す最強のサポート割合ダイス。
                </p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong className="text-yellow-300 text-sm font-mono block mb-1">③ バフ・攻撃アシスト</strong>
                <p className="text-xs text-slate-300 leading-normal">
                  月のダイス、光のダイス、スコープなど。アタッカーのポテンシャルを何十倍も引き上げる必須ギミック。
                </p>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong className="text-pink-400 text-sm font-mono block mb-1">④ 成長進化・SPコントロール</strong>
                <p className="text-xs text-slate-300 leading-normal">
                  成長のダイスや生贄マージ、吸収などで、驚異のスピードでSPを蓄積し全マスの高星進化を目指します。
                </p>
              </div>
            </div>

            {/* Implementation status of difficult dice mapping */}
            <h3 className="text-lg font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">🛠️ 実装技術と変更要素について (PvPからの最適化)</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 text-xs text-slate-300 space-y-3 leading-normal">
              <p>
                本シミュレーターでは、ユーザー様からのリストに含まれる<b>全61種類のダイスを完全にプログラムの中に実装しています。</b>
              </p>
              <div className="border-l-4 border-amber-500 pl-3">
                <strong>💡 特殊挙動・対戦PvPから1人用PvEへのアダプテーション解説:</strong>
                <ul className="list-disc list-inside space-y-1.5 mt-2 ml-1 text-slate-400">
                  <li>
                    <strong className="text-slate-200">フローのダイス (Flow)</strong>: 対戦プレイでは相手のレーンを加速させて自滅を誘うダイスですが、本1人用ゲームでは<b>「配置するだけで自分のレーンの敵進軍速度を常時遅延（スローダウン）」</b>させる非常に頼もしい妨害防衛として適用されています。
                  </li>
                  <li>
                    <strong className="text-slate-200">暗殺のダイス (Assassination)</strong>: 相手の目のランクを下げる妨害の代わりに、合成した瞬間に<b>「前方高体力のモンスターを自動追跡して粉砕する暗殺ミサイル」</b>を複数発射して一瞬で画面を片付ける大爆発アタックへ最適化。
                  </li>
                  <li>
                    <strong className="text-slate-200">ロイヤルのダイス (Royal)</strong>: 対戦相手の盤面のダイス種別をめちゃくちゃに掻き乱す対人妨害用ですが、本編では<b>「自分のお手元の余ってしまったレベル1のダイス達を瞬時に別のダイス種にシャッフル」</b>させ次なる進化のきっかけ・不意打ち活性化を生むスキルとして設計。
                  </li>
                  <li>
                    <strong className="text-slate-200">ジョーカー・栄養・スイッチ</strong>: セレクト後に別の対象マスを選択するだけで「変身」「栄養マージ」「位置の自由交換」を実行できるよう開発。
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 🛒 RETAIL & UPGRADE SHOP SYSTEM */}
        {activeTab === 'shop' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">🛒 シャードショップ (Crystal Shop)</h2>
                <p className="text-slate-400 text-sm mt-1">
                  集めたダイヤモンド（シャード）を消費して、戦闘を永続的に有利にするパッシブアップグレードや、特定ダイスのかけらを購入できます。
                </p>
              </div>
              <div className="bg-slate-950 px-4 py-2 rounded-xl border border-indigo-500/20 flex items-center gap-2 shadow-lg">
                <span className="text-xl">💎</span>
                <span className="font-mono text-lg font-bold text-indigo-400">{shards.toLocaleString()}</span>
                <span className="text-xs text-slate-500">シャード</span>
                <button
                  onClick={() => setShards(s => s + 3000)}
                  className="ml-3 px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-indigo-500/30 font-bold transition-all"
                >
                  テスト補給 (+3,000)
                </button>
              </div>
            </div>

            {/* 🔶 SECTION 1: PERMANENT PASSIVE UPGRADES */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-1.5">⚡ 永続パッシブ強化 (Permanent Combat Passives)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. START SP UPGRADE */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white flex items-center gap-1.5">⚡ 初期SP増加 (Initial SP Booster)</span>
                      <span className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Lv {shopStartSpLvl}/5
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      戦闘開始時、および再挑戦(リトライ)時の初期SPを永続的に増やします。<br />
                      <strong className="text-emerald-400">現在: +{shopStartSpLvl * 100} SP</strong>
                      {shopStartSpLvl < 5 && <span className="text-slate-500"> → 次: +{(shopStartSpLvl + 1) * 100} SP</span>}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {shopStartSpLvl >= 5 ? 'MAX LEVEL' : `必要: ${(shopStartSpLvl + 1) * 1200} 💎`}
                    </span>
                    <button
                      disabled={shopStartSpLvl >= 5 || shards < (shopStartSpLvl + 1) * 1200}
                      onClick={() => {
                        const cost = (shopStartSpLvl + 1) * 1200;
                        if (shards >= cost) {
                          setShards(s => s - cost);
                          setShopStartSpLvl(l => l + 1);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        shopStartSpLvl >= 5
                          ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                          : shards >= (shopStartSpLvl + 1) * 1200
                            ? 'bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow hover:scale-[1.03]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {shopStartSpLvl >= 5 ? '最大強化済' : 'アップグレード'}
                    </button>
                  </div>
                </div>

                {/* 2. MAX LIVES UPGRADE */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white flex items-center gap-1.5">❤️ 初期ライフ追加 (Starting Lives Boost)</span>
                      <span className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Lv {shopLivesLvl}/5
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      防衛線維持の耐久度！初期ライフ(HP)を永続的に増加させます。<br />
                      <strong className="text-emerald-400">現在: +{shopLivesLvl} ライフ</strong>
                      {shopLivesLvl < 5 && <span className="text-slate-500"> → 次: +{shopLivesLvl + 1} ライフ</span>}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {shopLivesLvl >= 5 ? 'MAX LEVEL' : `必要: ${(shopLivesLvl + 1) * 1500} 💎`}
                    </span>
                    <button
                      disabled={shopLivesLvl >= 5 || shards < (shopLivesLvl + 1) * 1500}
                      onClick={() => {
                        const cost = (shopLivesLvl + 1) * 1500;
                        if (shards >= cost) {
                          setShards(s => s - cost);
                          setShopLivesLvl(l => l + 1);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        shopLivesLvl >= 5
                          ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                          : shards >= (shopLivesLvl + 1) * 1500
                            ? 'bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow hover:scale-[1.03]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {shopLivesLvl >= 5 ? '最大強化済' : 'アップグレード'}
                    </button>
                  </div>
                </div>

                {/* 3. PREMIUM DAMAGE MULTIPLIER UPGRADE */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white flex items-center gap-1.5">💥 全ダイス基本攻撃力増加 (Full Force Boost)</span>
                      <span className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Lv {shopDmgPremiumLvl}/5
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      すべての配置ダイスのショットダメージを永続的にパーセント増加させます。<br />
                      <strong className="text-emerald-400 font-extrabold">現在: +{shopDmgPremiumLvl * 10}% ダメージバフ</strong>
                      {shopDmgPremiumLvl < 5 && <span className="text-slate-500"> → 次: +{(shopDmgPremiumLvl + 1) * 10}%</span>}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {shopDmgPremiumLvl >= 5 ? 'MAX LEVEL' : `必要: ${(shopDmgPremiumLvl + 1) * 2000} 💎`}
                    </span>
                    <button
                      disabled={shopDmgPremiumLvl >= 5 || shards < (shopDmgPremiumLvl + 1) * 2000}
                      onClick={() => {
                        const cost = (shopDmgPremiumLvl + 1) * 2000;
                        if (shards >= cost) {
                          setShards(s => s - cost);
                          setShopDmgPremiumLvl(l => l + 1);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        shopDmgPremiumLvl >= 5
                          ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                          : shards >= (shopDmgPremiumLvl + 1) * 2000
                            ? 'bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow hover:scale-[1.03]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {shopDmgPremiumLvl >= 5 ? '最大強化済' : 'アップグレード'}
                    </button>
                  </div>
                </div>

                {/* 4. GEM FACTOR REWARDS BOOST */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white flex items-center gap-1.5">💎 シャード追加ボーナス倍率 (Fortune Gems)</span>
                      <span className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Lv {shopGemBonusLvl}/5
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      ウェーブクリア時、および敵討伐時に獲得できるダイヤモンド量を永続的に増加させます。<br />
                      <strong className="text-emerald-400">現在: +{shopGemBonusLvl * 15}% 追加獲得</strong>
                      {shopGemBonusLvl < 5 && <span className="text-slate-500"> → 次: +{(shopGemBonusLvl + 1) * 15}%</span>}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {shopGemBonusLvl >= 5 ? 'MAX LEVEL' : `必要: ${(shopGemBonusLvl + 1) * 2550} 💎`}
                    </span>
                    <button
                      disabled={shopGemBonusLvl >= 5 || shards < (shopGemBonusLvl + 1) * 2550}
                      onClick={() => {
                        const cost = (shopGemBonusLvl + 1) * 2550;
                        if (shards >= cost) {
                          setShards(s => s - cost);
                          setShopGemBonusLvl(l => l + 1);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        shopGemBonusLvl >= 5
                          ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                          : shards >= (shopGemBonusLvl + 1) * 2550
                            ? 'bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow hover:scale-[1.03]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {shopGemBonusLvl >= 5 ? '最大強化済' : 'アップグレード'}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 🔷 SECTION 2: ROTATING FEATURED DICE SHARDS */}
            <div className="border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-pink-400 flex items-center gap-1.5">🔮 日替わり・ダイスのかけらセール (Featured Shards)</h3>
                  <p className="text-xs text-slate-400">結晶を消費して、特定のダイスの解放ピースをピンポイントで購入できます！</p>
                </div>
                <button
                  onClick={() => {
                    if (shards >= 150) {
                      setShards(s => s - 150);
                      setShopFeaturedDeals(generateShopFeaturedDeals());
                    }
                  }}
                  disabled={shards < 150}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 border transition-all ${
                    shards >= 150
                      ? 'bg-slate-950 border-slate-800 text-pink-400 hover:border-pink-500/55'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                  title="150シャードで日替わりセールを別のランダムダイスに変更します"
                >
                  🔄 特価品更新 (150💎)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shopFeaturedDeals.map((deal, idx) => {
                  const diceInfo = DICE_DETAILS[deal.type];
                  const dColor = getDiceColor(deal.type);
                  const currentPieces = dicePieces[deal.type] || 0;
                  return (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        {/* Box layout for visual identifier */}
                        <div className="flex gap-2.5 items-center mb-3">
                          <div className={`h-8 w-8 rounded-lg ${dColor} flex items-center justify-center font-bold text-center border text-[10px] shadow-inner`}>
                            {deal.type.substring(0, 2)}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">
                              {diceInfo?.rarity === 'Legendary' ? '🏆 伝説級' : diceInfo?.rarity === 'Unique' ? '💎 英雄級' : '⭐ 一般級'}
                            </span>
                            <strong className="text-white text-sm block">{diceInfo?.nameJa || deal.type}</strong>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-11">
                          {diceInfo?.desc}
                        </p>
                        <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                          <span>獲得: <b className="text-pink-400 text-xs font-extrabold">+{deal.count}個 かけら</b></span>
                          <span>（現在: {currentPieces}個所持）</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-900/60 pt-3">
                        <span className="text-xs text-slate-400 font-mono">
                          価格: <b className="text-indigo-400 font-bold">{deal.cost} 💎</b>
                        </span>
                        <button
                          disabled={deal.bought || shards < deal.cost}
                          onClick={() => {
                            if (shards >= deal.cost) {
                              setShards(s => s - deal.cost);
                              // Add pieces to dice container
                              setDicePieces(prev => ({
                                ...prev,
                                [deal.type]: (prev[deal.type] || 0) + deal.count
                              }));
                              // Mark as bought
                              setShopFeaturedDeals(prev => prev.map((d, i) => i === idx ? { ...d, bought: true } : d));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            deal.bought
                              ? 'bg-slate-900 text-slate-550 cursor-not-allowed border border-slate-850'
                              : shards >= deal.cost
                                ? 'bg-pink-600 hover:bg-pink-500 text-white font-extrabold shadow scale-100 hover:scale-[1.04]'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          {deal.bought ? '購入済' : '購入する'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono text-center pt-2">
              💡 注: デッキのレベルアップ機能でお手持ちのダイスのかけら（ピース）を消費して、基本ショット火力を永続的に更にブーストできます。
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
