/* known: parenting — crayon art.
   Each drawing takes a palette so it can be full color, or all white on a kid card.
   Placeholder art until the illustrator's real crayon set is ready. */
const S='filter="url(#crayon)" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"';
const FULL={a:'#8fa58b',b:'#c98c6e',c:'#e2bc5e',d:'#8aa3b8',e:'#3a322b',f:'#a46a4f',g:'#6f8b6a'};
const WHITE=Object.fromEntries(Object.keys(FULL).map(k=>[k,'#fff']));

/* the 5 kid art choices */
const ART={
  flower:{name:'Flower',svg:p=>`<svg viewBox="0 0 100 120" ${S}>
    <path d="M50 112 C 50 90, 52 70, 50 52" stroke="${p.a}"/>
    <path d="M50 92 C 38 82, 28 84, 22 90 C 32 96, 42 96, 50 92Z M51 78 C 62 66, 74 66, 80 70 C 72 80, 60 82, 51 78Z" stroke="${p.a}"/>
    <path d="M50 50 C 40 38, 30 30, 38 22 C 44 18, 50 24, 50 30 C 50 24, 56 18, 62 22 C 70 30, 60 38, 50 50Z" stroke="${p.b}"/>
    <path d="M50 12v-6M36 16l-4-4M64 16l4-4" stroke="${p.b}"/></svg>`},
  rainbow:{name:'Rainbow',svg:p=>`<svg viewBox="0 0 100 120" ${S}>
    <path d="M14 92 A 36 36 0 0 1 86 92" stroke="${p.b}" stroke-width="5"/>
    <path d="M24 92 A 26 26 0 0 1 76 92" stroke="${p.c}" stroke-width="5"/>
    <path d="M34 92 A 16 16 0 0 1 66 92" stroke="${p.a}" stroke-width="5"/>
    <path d="M8 96 C 4 88, 14 84, 20 90 C 24 86, 30 90, 28 96Z M72 96 C 70 88, 80 84, 84 90 C 90 86, 96 92, 92 96Z" stroke="${p.d}"/></svg>`},
  redwood:{name:'Redwood',svg:p=>`<svg viewBox="0 0 100 120" ${S}>
    <path d="M45 114 L46 70 M55 114 L54 70" stroke="${p.f}" stroke-width="3.5"/>
    <path d="M50 8 L36 32 L44 32 L30 54 L40 54 L24 78 L76 78 L60 54 L70 54 L56 32 L64 32 Z" stroke="${p.g}"/>
    <path d="M14 114 H86" stroke="${p.a}"/></svg>`},
  car:{name:'Car',svg:p=>`<svg viewBox="0 0 100 120" ${S}>
    <path d="M10 86 L14 70 L28 68 L38 54 L66 54 L76 68 L90 72 L90 86 Z" stroke="${p.d}"/>
    <path d="M42 58 L36 68 L60 68 L60 58 Z M64 58 L64 68 L72 68 L66 58Z" stroke="${p.d}"/>
    <circle cx="30" cy="88" r="9" stroke="${p.e}"/><circle cx="72" cy="88" r="9" stroke="${p.e}"/>
    <path d="M6 104 H94" stroke="${p.b}" stroke-dasharray="8 7"/></svg>`},
  balls:{name:'Sports',svg:p=>`<svg viewBox="0 0 100 120" ${S}>
    <circle cx="30" cy="92" r="18" stroke="${p.b}"/><path d="M12 92 H48 M30 74 V110 M17 79 C 26 86, 26 98, 17 105 M43 79 C 34 86, 34 98, 43 105" stroke="${p.b}" stroke-width="2.4"/>
    <circle cx="70" cy="96" r="14" stroke="${p.e}"/><path d="M70 89 l6 4 -2 7 h-8 l-2 -7z" stroke="${p.e}" stroke-width="2.4"/>
    <circle cx="52" cy="58" r="13" stroke="${p.c}"/><path d="M42 50 C 48 56, 48 62, 42 68 M62 50 C 56 56, 56 62, 62 68" stroke="${p.c}" stroke-width="2.4"/></svg>`}
};

/* extra crayon pictures for story pages and verse cards (on top of the kid art set) */
const STORY_ART={
  ...ART,
  house:{name:'House',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M18 60 L50 30 L82 60" stroke="${p.b}"/><path d="M26 56 V100 H74 V56" stroke="${p.d}"/><path d="M44 100 V78 H56 V100" stroke="${p.e}"/><path d="M8 104 H92" stroke="${p.a}"/></svg>`},
  moon:{name:'Night sky',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M62 28 A 26 26 0 1 0 74 76 A 20 20 0 1 1 62 28Z" stroke="${p.c}"/><path d="M22 30 l3 6 6 1 -5 4 1 6 -5 -3 -5 3 1 -6 -5 -4 6 -1z" stroke="${p.d}" stroke-width="2.4"/><path d="M80 96 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1z" stroke="${p.d}" stroke-width="2.4"/></svg>`},
  heart:{name:'Heart',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M50 98 C 18 76, 10 56, 22 40 C 32 28, 46 32, 50 46 C 54 32, 68 28, 78 40 C 90 56, 82 76, 50 98Z" stroke="${p.b}"/></svg>`},
  boat:{name:'Boat',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M16 74 H84 L72 92 H28 Z" stroke="${p.f}"/><path d="M50 74 V20 L78 66 H50" stroke="${p.d}"/><path d="M6 100 C 18 94, 28 106, 40 100 C 52 94, 62 106, 74 100 C 84 95, 92 102, 96 100" stroke="${p.d}"/></svg>`},
  mountain:{name:'Mountains',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M6 100 L36 46 L54 78 L68 56 L94 100 Z" stroke="${p.g}"/><path d="M30 57 L36 46 L42 57" stroke="${p.d}"/><circle cx="76" cy="30" r="9" stroke="${p.c}"/></svg>`}
};

/* sticker set for making books: everything above plus a few extras */
const STICKERS={
  ...STORY_ART,
  sun:{name:'Sun',svg:p=>`<svg viewBox="0 0 100 120" ${S}><circle cx="50" cy="60" r="16" stroke="${p.c}"/><path d="M50 26v10M50 84v10M16 60h10M74 60h10M26 36l7 7M67 77l7 7M26 84l7-7M67 43l7-7" stroke="${p.c}"/></svg>`},
  star:{name:'Star',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M50 22 L60 50 L90 51 L66 69 L75 98 L50 81 L25 98 L34 69 L10 51 L40 50 Z" stroke="${p.c}"/></svg>`},
  cloud:{name:'Cloud',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M22 82 C 8 82, 8 62, 22 62 C 22 46, 42 42, 48 54 C 54 40, 78 42, 76 60 C 92 60, 92 82, 78 82 Z" stroke="${p.d}"/></svg>`},
  fish:{name:'Fish',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M14 60 C 30 38, 62 38, 74 60 C 62 82, 30 82, 14 60 Z" stroke="${p.d}"/><path d="M74 60 L92 46 L92 74 Z" stroke="${p.d}"/><circle cx="30" cy="56" r="3" stroke="${p.e}"/></svg>`},
  bird:{name:'Bird',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M24 66 C 24 48, 48 44, 58 56 C 64 50, 74 50, 78 56 L88 58 L78 62 C 76 76, 60 84, 44 82 C 32 80, 24 74, 24 66 Z" stroke="${p.b}"/><path d="M40 62 C 46 54, 56 58, 54 68" stroke="${p.b}"/><circle cx="70" cy="57" r="2" stroke="${p.e}"/><path d="M50 82 V94 M60 80 V94" stroke="${p.f}"/></svg>`},
  person:{name:'Person',svg:p=>`<svg viewBox="0 0 100 120" ${S}><circle cx="50" cy="28" r="12" stroke="${p.f}"/><path d="M50 40 V78 M50 52 L30 64 M50 52 L70 64 M50 78 L36 104 M50 78 L64 104" stroke="${p.f}"/></svg>`},
  little:{name:'Little one',svg:p=>`<svg viewBox="0 0 100 120" ${S}><circle cx="50" cy="56" r="10" stroke="${p.b}"/><path d="M50 66 V90 M50 74 L36 82 M50 74 L64 82 M50 90 L40 108 M50 90 L60 108" stroke="${p.b}"/></svg>`},
  tree:{name:'Tree',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M50 108 V70" stroke="${p.f}" stroke-width="4"/><path d="M50 72 C 24 74, 18 48, 34 40 C 32 22, 58 16, 64 32 C 82 30, 86 58, 68 66 C 64 74, 56 74, 50 72 Z" stroke="${p.a}"/></svg>`},
  cross:{name:'Cross',svg:p=>`<svg viewBox="0 0 100 120" ${S}><path d="M50 18 V104 M30 44 H70" stroke="${p.f}" stroke-width="4"/></svg>`}
};
