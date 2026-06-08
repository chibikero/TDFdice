export type DiceType = 
  | 'Basic' | 'Fire' | 'Electric' | 'Wind' | 'Poison' | 'Ice' | 'Iron' | 'Broken' | 'Gamble' | 'Lock' 
  | 'Light' | 'Thorn' | 'Melee' | 'Mine' | 'LightSpeed' | 'Absorb' | 'Laser' | 'Wave' | 'StrongWind' | 'Hurricane' 
  | 'Switch' | 'Teleport' | 'ModElectric' | 'Infect' | 'Death' | 'Sacrifice' | 'Clone' | 'Bounty' | 'Berserker' | 'Joker' 
  | 'Growth' | 'RandomGrowth' | 'BrokenGrowth' | 'Nutrition' | 'Summon' | 'Rewind' | 'Solar' | 'YinYang' | 'Typhoon' | 'Combo' 
  | 'Atomic' | 'LightSword' | 'Overheat' | 'Charge' | 'Soul' | 'Gun' | 'Moon' | 'Scope' | 'Blizzard' | 'Sand' 
  | 'Flow' | 'Shield' | 'Snowball' | 'Compressor' | 'Bubble' | 'Hell' | 'Guardian' | 'Ignite' | 'Assassination' | 'Royal' | 'Nuclear'
  | 'Ninja' | 'Rainbow' | 'CherryBlossom'
  | 'Star' | 'Metastasis' | 'Phoenix' | 'BlackHole' | 'CloneKing' | 'Saikoro'
  | 'Tornado' | 'Prism' | 'Vampire' | 'Time' | 'Meteor'
  | 'Imitator' | 'MiniCombo' | 'Sprout' | 'Line' | 'Firecracker'
  | 'Orbit' | 'Scythe' | 'Snowy' | 'Seed' | 'RustSword' | 'Parasite' | 'Breeze' | 'Crayon' | 'Dagger' | 'Whirlwind';

export interface Dice {
  id: string;
  type: DiceType;
  pips: number;
}

export interface Cell {
  id: number;
  dice: Dice | null;
}

export interface Enemy {
  id: string;
  hp: number;
  maxHp: number;
  position: number; // 0-100 (Path position)
  speed: number;
  slowed: boolean;
  poisoned: number; // DOT value
  isGoldAlien?: boolean;
}
