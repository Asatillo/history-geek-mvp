export type Player = {
  name: string;
  country: string;
  code: string;
  score: number;
};

export const LEADERBOARD: Player[] = [
  { name: 'Elena Vásquez', country: 'Spain', code: 'ES', score: 1262 },
  { name: 'Tomasz Nowak', country: 'Poland', code: 'PL', score: 1251 },
  { name: 'Aiko Tanaka', country: 'Japan', code: 'JP', score: 1247 },
  { name: 'Marcus Okafor', country: 'Nigeria', code: 'NG', score: 1239 },
  { name: 'Ingrid Solberg', country: 'Norway', code: 'NO', score: 1228 },
  { name: 'Rafael Costa', country: 'Brazil', code: 'BR', score: 1214 },
  { name: 'Priya Raman', country: 'India', code: 'IN', score: 1206 },
  { name: "Liam O'Connor", country: 'Ireland', code: 'IE', score: 1193 },
  { name: 'Zeynep Kaya', country: 'Türkiye', code: 'TR', score: 1187 },
  { name: 'Daniel Kim', country: 'South Korea', code: 'KR', score: 1175 },
  { name: 'Sofia Ricci', country: 'Italy', code: 'IT', score: 1168 },
  { name: 'Ahmed El-Sayed', country: 'Egypt', code: 'EG', score: 1152 },
  { name: 'Chloé Martin', country: 'France', code: 'FR', score: 1141 },
  { name: 'Jonas Weber', country: 'Germany', code: 'DE', score: 1133 },
  { name: 'Amara Mensah', country: 'Ghana', code: 'GH', score: 1120 },
];

export const rankFor = (score: number) =>
  LEADERBOARD.filter((p) => p.score > score).length + 1;
