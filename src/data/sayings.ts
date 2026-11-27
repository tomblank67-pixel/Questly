import type { DayTime } from '../lib/date';

/**
 * Funke's lines. Warm, a little silly, never guilt-tripping.
 */
export const GREETINGS: Record<DayTime, string[]> = {
  morgen: [
    'Guten Morgen! Ich hab schon mal vorgeglüht. ☀️',
    'Aufgewacht? Ich auch! Na ja, fast. *gähn*',
    'Ein neuer Tag, drei neue Abenteuer. Ich bin bereit!',
    'Morgen! Kaffee für dich, ein Holzscheit für mich?',
    'Die Sonne ist da – und ich auch. Was für ein Team!',
    'Frühaufsteher-Bonus: Mein Lieblingslächeln ist schon an.',
  ],
  mittag: [
    'Hallo! Halbzeit – Zeit für eine kleine Heldentat?',
    'Mittagsglut! Ich bin heute besonders flackerig.',
    'Na, wie läuft dein Tag? Meiner flackert vor sich hin.',
    'Hey du! Schön, dass du vorbeischaust.',
    'Kleine Pause? Ich halte die Stellung.',
  ],
  abend: [
    'Guten Abend! Ich hab den Kamin schon gemütlich gemacht.',
    'Abendstimmung – perfekt für noch eine kleine Quest.',
    'Da bist du ja! Ich hab dich vermisst. Ein bisschen. Okay, sehr.',
    'Der Tag war lang, oder? Komm, wärm dich an mir.',
    'Abenddämmerung. Die beste Zeit für Lagerfeuer-Geschichten.',
  ],
  nacht: [
    'Psst … es ist spät. Ich glühe ganz leise für dich.',
    'Nachteule! Vergiss nicht, dass Schlaf auch eine Superkraft ist.',
    'Noch wach? Ich auch. Wir sind die Nachtwache.',
    'Die Sterne sind draußen. Ich bin der kleine hier drinnen.',
  ],
};

export const PRAISE = [
  'Wuhuu! Das war großartig! 🔥',
  'Ich bin so stolz, ich flackere vor Freude!',
  'Quest erledigt! Du bist echt ein Held.',
  'Zack! Erledigt! Hast du das gesehen? ICH hab es gesehen!',
  'Wie machst du das nur? Lehr mich das!',
  'Das gibt Extra-Glut! Danke dir!',
  'Heldenhaft! Ich mach einen Freudensprung.',
  'Noch eine Quest für die Legendenbücher!',
  'Ich spür richtig, wie ich wachse. Danke!',
  'Bäm! Du bist heute unaufhaltsam.',
  'Hach, ich glühe vor Stolz. Wortwörtlich.',
  'Das war so mutig! Ich hätte mich nicht getraut. Ich bin ein Feuer.',
];

export const MOTIVATION = [
  'Eine kleine Quest reicht schon. Klein ist auch heldenhaft.',
  'Kein Druck – ich bin da, wann immer du bereit bist.',
  'Fang mit der leichtesten an. Ich verrat’s auch keinem.',
  'Jede große Legende beginnt mit einem kleinen Schritt.',
  'Du musst nicht perfekt sein. Nur ein bisschen neugierig.',
  'Weißt du, was mich warm hält? Du. Und Holz. Aber vor allem du.',
  'Abenteuer warten nicht – aber ich schon. Geduldig. Glühend.',
  'Tipp ins Kästchen, wenn du fertig bist. Ich liebe dieses Geräusch.',
  'Heute ist ein guter Tag für etwas Neues, findest du nicht?',
  'Einmal neu würfeln ist erlaubt. Ich zähl nicht mit. Doch, ich zähl mit. Einmal.',
];

export const ALL_DONE = [
  'Alle Tagesquests geschafft! Du bist eine Legende! 👑',
  'Komplett! Ich mach heute Abend ein Freudenfeuerwerk.',
  'Alles erledigt. Jetzt darfst du offiziell auf dem Sofa glühen.',
  'Volle Quest-Ausbeute! Ich bin sprachlos. Fast.',
  'Fertig für heute – genieß den Rest des Tages, Held!',
];

export const SLEEPY = [
  'Zzz … oh! Du bist da! Ich hab nur kurz die Augen ausgeruht.',
  '*gähn* Schön, dich zu sehen. Ich hab von dir geträumt!',
  'Ich war ein bisschen eingeschlafen. Weckst du mich mit einer Quest?',
  'Zzz … Marshmallows … oh, hallo! Willkommen zurück!',
  'Pausen sind okay. Ich hab einfach Glut gespart. Los geht’s?',
];

export const STREAK = [
  'Schon {n} Tage in Folge! Wir sind ein unschlagbares Duo.',
  '{n}-Tage-Serie! Meine Flamme wird immer heller.',
  '{n} Tage am Stück – das ist echtes Durchhaltefeuer!',
];

export const TAP = [
  'Hihi, das kitzelt!',
  'Hey! Ich bin heiß, aber nicht SO heiß. Du kannst ruhig tippen.',
  'Boop! Selber boop!',
  'Ich bin übrigens zu 100 % aus Gemütlichkeit gemacht.',
  'Weißt du, dass du toll bist? Jetzt weißt du’s.',
  'Wenn ich Hände hätte … oh, Moment. Vielleicht bald!',
  'Ich hab heute noch nichts gegessen. Außer ein Streichholz.',
  'Flacker, flacker!',
];

export const LEVEL_UP = [
  'LEVEL UP! Ich spür ein Kribbeln in meiner Flamme!',
  'Neues Level! Bald brauch ich einen größeren Kamin.',
  'Level geschafft! Wir werden immer stärker.',
];

/** Every line, for counting/tests. */
export const ALL_SAYINGS = [
  ...Object.values(GREETINGS).flat(),
  ...PRAISE,
  ...MOTIVATION,
  ...ALL_DONE,
  ...SLEEPY,
  ...STREAK,
  ...TAP,
  ...LEVEL_UP,
];
