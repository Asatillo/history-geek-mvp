export type HistoricalEvent = {
  id: string;
  title: string;
  emoji: string;
  year: number; // sortable; BC is negative
  label: string; // display date
};

export const QUESTIONS: HistoricalEvent[][] = [
  [
    { id: 'flight', title: 'Wright brothers’ first flight', emoji: '✈️', year: 1903, label: 'December 17, 1903' },
    { id: 'titanic', title: 'Titanic sinks', emoji: '🚢', year: 1912, label: 'April 15, 1912' },
    { id: 'moon', title: 'Apollo 11 lands on the Moon', emoji: '🌕', year: 1969, label: 'July 20, 1969' },
    { id: 'berlin', title: 'Fall of the Berlin Wall', emoji: '🧱', year: 1989, label: 'November 9, 1989' },
  ],
  [
    { id: 'pyramid', title: 'Great Pyramid of Giza built', emoji: '🔺', year: -2560, label: 'c. 2560 BC' },
    { id: 'caesar', title: 'Julius Caesar assassinated', emoji: '🗡️', year: -44, label: 'March 15, 44 BC' },
    { id: 'columbus', title: 'Columbus reaches the Americas', emoji: '⛵', year: 1492, label: 'October 12, 1492' },
    { id: 'ww1', title: 'World War I begins', emoji: '💣', year: 1914, label: '1914–1918' },
  ],
  [
    { id: 'hastings', title: 'Battle of Hastings', emoji: '⚔️', year: 1066, label: '1066' },
    { id: 'magna', title: 'Magna Carta sealed', emoji: '📜', year: 1215, label: '1215' },
    { id: 'plague', title: 'Black Death reaches Europe', emoji: '💀', year: 1347, label: '1347' },
    { id: 'constantinople', title: 'Fall of Constantinople', emoji: '🏰', year: 1453, label: 'May 29, 1453' },
  ],
  [
    { id: 'rome', title: 'Founding of Rome (traditional)', emoji: '🐺', year: -753, label: '753 BC' },
    { id: 'marathon', title: 'Battle of Marathon', emoji: '🏃', year: -490, label: '490 BC' },
    { id: 'alexander', title: 'Death of Alexander the Great', emoji: '👑', year: -323, label: '323 BC' },
    { id: 'actium', title: 'Battle of Actium', emoji: '⚓', year: -31, label: '31 BC' },
  ],
  [
    { id: 'luther', title: 'Luther posts the 95 Theses', emoji: '⛪', year: 1517, label: 'October 31, 1517' },
    { id: 'shakespeare', title: 'Death of Shakespeare', emoji: '🎭', year: 1616, label: 'April 23, 1616' },
    { id: 'newton', title: 'Newton publishes the Principia', emoji: '🍎', year: 1687, label: '1687' },
    { id: 'declaration', title: 'US Declaration of Independence', emoji: '🇺🇸', year: 1776, label: 'July 4, 1776' },
  ],
  [
    { id: 'russia', title: 'Russian Revolution', emoji: '🚩', year: 1917, label: '1917' },
    { id: 'crash', title: 'Wall Street Crash', emoji: '📉', year: 1929, label: 'October 1929' },
    { id: 'hiroshima', title: 'Atomic bombing of Hiroshima', emoji: '☢️', year: 1945, label: 'August 6, 1945' },
    { id: 'sputnik', title: 'Sputnik 1 launched', emoji: '🛰️', year: 1957, label: 'October 4, 1957' },
  ],
  [
    { id: 'charlemagne', title: 'Charlemagne crowned emperor', emoji: '🤴', year: 800, label: 'December 25, 800' },
    { id: 'crusade', title: 'First Crusade begins', emoji: '🛡️', year: 1096, label: '1096' },
    { id: 'genghis', title: 'Genghis Khan unites the Mongols', emoji: '🏹', year: 1206, label: '1206' },
    { id: 'joan', title: 'Joan of Arc burned at the stake', emoji: '🔥', year: 1431, label: 'May 30, 1431' },
  ],
  [
    { id: 'waterloo', title: 'Battle of Waterloo', emoji: '🐎', year: 1815, label: 'June 18, 1815' },
    { id: 'darwin', title: 'Darwin publishes On the Origin of Species', emoji: '🐢', year: 1859, label: 'November 24, 1859' },
    { id: 'civilwar', title: 'American Civil War begins', emoji: '🎖️', year: 1861, label: '1861–1865' },
    { id: 'eiffel', title: 'Eiffel Tower completed', emoji: '🗼', year: 1889, label: 'March 31, 1889' },
  ],
  [
    { id: 'hammurabi', title: 'Code of Hammurabi', emoji: '📖', year: -1754, label: 'c. 1754 BC' },
    { id: 'parthenon', title: 'Construction of the Parthenon begins', emoji: '🏛️', year: -447, label: '447 BC' },
    { id: 'qin', title: 'Qin unifies China', emoji: '🐉', year: -221, label: '221 BC' },
    { id: 'pompeii', title: 'Vesuvius destroys Pompeii', emoji: '🌋', year: 79, label: 'AD 79' },
  ],
  [
    { id: 'bastille', title: 'Storming of the Bastille', emoji: '🥖', year: 1789, label: 'July 14, 1789' },
    { id: 'mozart', title: 'Death of Mozart', emoji: '🎼', year: 1791, label: 'December 5, 1791' },
    { id: 'louisiana', title: 'Louisiana Purchase', emoji: '🗺️', year: 1803, label: '1803' },
    { id: 'napoleon', title: 'Napoleon crowned emperor', emoji: '🎩', year: 1804, label: 'December 2, 1804' },
  ],
];
